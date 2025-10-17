import type { MatchWithOdds, GeneratedRow, SimulationResult, Outcome } from '../types';
import { selectWeightedRandomOutcome } from './odds';

/**
 * Run Monte Carlo simulation for a generated row
 */
export function simulateRow(
  row: GeneratedRow,
  matches: MatchWithOdds[],
  iterations: number = 100000
): SimulationResult {
  const results = {
    exactly10: 0,
    exactly11: 0,
    exactly12: 0,
    exactly13: 0,
    atLeast10: 0,
    atLeast11: 0,
    atLeast12: 0,
    atLeast13: 0
  };

  let totalCorrect = 0;

  for (let i = 0; i < iterations; i++) {
    const correctCount = simulateMatchday(row.outcomes, matches);
    totalCorrect += correctCount;

    // Count exact results
    switch (correctCount) {
      case 10:
        results.exactly10++;
        break;
      case 11:
        results.exactly11++;
        break;
      case 12:
        results.exactly12++;
        break;
      case 13:
        results.exactly13++;
        break;
    }

    // Count at-least results
    if (correctCount >= 10) results.atLeast10++;
    if (correctCount >= 11) results.atLeast11++;
    if (correctCount >= 12) results.atLeast12++;
    if (correctCount >= 13) results.atLeast13++;
  }

  // Convert counts to probabilities
  const probabilities = {
    exactly10: results.exactly10 / iterations,
    exactly11: results.exactly11 / iterations,
    exactly12: results.exactly12 / iterations,
    exactly13: results.exactly13 / iterations,
    atLeast10: results.atLeast10 / iterations,
    atLeast11: results.atLeast11 / iterations,
    atLeast12: results.atLeast12 / iterations,
    atLeast13: results.atLeast13 / iterations
  };

  const averageCorrect = totalCorrect / iterations;
  const expectedPayout = calculateExpectedPayout(probabilities);

  return {
    rowId: row.id,
    correctResults: probabilities,
    averageCorrect,
    expectedPayout,
    iterations
  };
}

/**
 * Simulate multiple rows in parallel
 */
export function simulateMultipleRows(
  rows: GeneratedRow[],
  matches: MatchWithOdds[],
  iterations: number = 100000
): SimulationResult[] {
  return rows.map(row => simulateRow(row, matches, iterations));
}

/**
 * Simulate a single matchday to see how many predictions were correct
 */
function simulateMatchday(predictions: Outcome[], matches: MatchWithOdds[]): number {
  let correctCount = 0;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const prediction = predictions[i];
    
    // Generate actual outcome based on probabilities
    const actualOutcome = selectWeightedRandomOutcome(match.probabilities);
    
    if (prediction === actualOutcome) {
      correctCount++;
    }
  }

  return correctCount;
}

/**
 * Calculate expected payout based on probability distribution
 */
function calculateExpectedPayout(probabilities: {
  exactly10: number;
  exactly11: number;
  exactly12: number;
  exactly13: number;
  atLeast10: number;
  atLeast11: number;
  atLeast12: number;
  atLeast13: number;
}): number {
  // Svenska Spel payout estimates (simplified model)
  const payouts = {
    exactly10: 50,    // ~50 SEK
    exactly11: 500,   // ~500 SEK
    exactly12: 5000,  // ~5,000 SEK
    exactly13: 50000  // ~50,000 SEK (jackpot estimate)
  };

  return (
    probabilities.exactly10 * payouts.exactly10 +
    probabilities.exactly11 * payouts.exactly11 +
    probabilities.exactly12 * payouts.exactly12 +
    probabilities.exactly13 * payouts.exactly13
  );
}

/**
 * Calculate optimal system coverage for multiple rows
 * This helps determine how to distribute outcomes across rows for maximum coverage
 */
export function calculateOptimalCoverage(
  matches: MatchWithOdds[],
  numRows: number,
  targetCorrect: number = 11
): {
  recommendations: Array<{
    matchIndex: number;
    suggestedDistribution: { home: number; draw: number; away: number };
  }>;
  expectedHitRate: number;
} {
  const recommendations: Array<{
    matchIndex: number;
    suggestedDistribution: { home: number; draw: number; away: number };
  }> = [];

  let totalExpectedHits = 0;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const probs = match.probabilities;
    
    // Calculate optimal distribution across rows
    // Favor more likely outcomes but ensure some diversity
    const totalRows = numRows;
    const homeRows = Math.max(1, Math.round(probs.home * totalRows));
    const drawRows = Math.max(1, Math.round(probs.draw * totalRows));
    const awayRows = Math.max(1, Math.round(probs.away * totalRows));
    
    // Adjust if sum exceeds numRows
    const sum = homeRows + drawRows + awayRows;
    let adjusted = { home: homeRows, draw: drawRows, away: awayRows };
    
    if (sum > numRows) {
      const scale = numRows / sum;
      adjusted = {
        home: Math.floor(homeRows * scale),
        draw: Math.floor(drawRows * scale),
        away: Math.floor(awayRows * scale)
      };
      
      // Distribute remaining rows to most likely outcomes
      let remaining = numRows - (adjusted.home + adjusted.draw + adjusted.away);
      const outcomes = [
        { key: 'home' as const, prob: probs.home },
        { key: 'draw' as const, prob: probs.draw },
        { key: 'away' as const, prob: probs.away }
      ].sort((a, b) => b.prob - a.prob);
      
      for (const outcome of outcomes) {
        if (remaining > 0) {
          adjusted[outcome.key]++;
          remaining--;
        }
      }
    }
    
    recommendations.push({
      matchIndex: i,
      suggestedDistribution: adjusted
    });
    
    // Calculate expected hits for this match
    const maxProb = Math.max(probs.home, probs.draw, probs.away);
    totalExpectedHits += maxProb;
  }

  return {
    recommendations,
    expectedHitRate: totalExpectedHits / matches.length
  };
}

/**
 * Advanced simulation with confidence intervals
 */
export function simulateWithConfidenceIntervals(
  row: GeneratedRow,
  matches: MatchWithOdds[],
  iterations: number = 100000,
  confidenceLevel: number = 0.95
): SimulationResult & {
  confidenceIntervals: {
    averageCorrect: { lower: number; upper: number };
    expectedPayout: { lower: number; upper: number };
  };
} {
  const baseResult = simulateRow(row, matches, iterations);
  
  // Calculate confidence intervals using bootstrap sampling
  const bootstrapSamples = 1000;
  const bootstrapResults: number[] = [];
  const bootstrapPayouts: number[] = [];
  
  for (let i = 0; i < bootstrapSamples; i++) {
    let sampleCorrect = 0;
    let samplePayout = 0;
    
    for (let j = 0; j < 1000; j++) { // Smaller sample size for bootstrap
      const correctCount = simulateMatchday(row.outcomes, matches);
      sampleCorrect += correctCount;
      
      // Calculate payout for this sample
      if (correctCount >= 13) samplePayout += 50000;
      else if (correctCount >= 12) samplePayout += 5000;
      else if (correctCount >= 11) samplePayout += 500;
      else if (correctCount >= 10) samplePayout += 50;
    }
    
    bootstrapResults.push(sampleCorrect / 1000);
    bootstrapPayouts.push(samplePayout / 1000);
  }
  
  // Sort for percentile calculation
  bootstrapResults.sort((a, b) => a - b);
  bootstrapPayouts.sort((a, b) => a - b);
  
  const alpha = 1 - confidenceLevel;
  const lowerIndex = Math.floor(alpha / 2 * bootstrapSamples);
  const upperIndex = Math.floor((1 - alpha / 2) * bootstrapSamples);
  
  return {
    ...baseResult,
    confidenceIntervals: {
      averageCorrect: {
        lower: bootstrapResults[lowerIndex],
        upper: bootstrapResults[upperIndex]
      },
      expectedPayout: {
        lower: bootstrapPayouts[lowerIndex],
        upper: bootstrapPayouts[upperIndex]
      }
    }
  };
}