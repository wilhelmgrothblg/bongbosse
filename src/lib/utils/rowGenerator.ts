import type { MatchWithOdds, GeneratedRow, RowFilters, RiskProfile, Outcome, GeneratorConfig } from '../types';
import { adjustMatchProbabilities, selectWeightedRandomOutcome, selectEVBasedOutcome } from './odds';

/**
 * Generate a single Stryktipset row based on strategy and filters
 */
export function generateRow(
  matches: MatchWithOdds[],
  config: GeneratorConfig,
  rowId?: string
): GeneratedRow | null {
  const outcomes: Outcome[] = [];
  
  // Apply personal biases first
  const biasedMatches = matches.map(match => {
    const bias = config.filters.personalBiases?.find(b => b.matchId === match.matchId);
    if (bias) {
      return { ...match, forcedOutcome: bias.outcome };
    }
    return match;
  });

  // Generate outcomes for each match
  for (const match of biasedMatches) {
    let outcome: Outcome;
    
    // Check if outcome is forced by personal bias
    if ('forcedOutcome' in match && match.forcedOutcome) {
      outcome = match.forcedOutcome as Outcome;
    } else {
      // Adjust probabilities based on risk profile
      const adjustedProbs = adjustMatchProbabilities(match.probabilities, config.riskProfile);
      
      // Select outcome based on strategy
      switch (config.strategy) {
        case 'weighted-random':
          outcome = selectWeightedRandomOutcome(adjustedProbs);
          break;
        case 'ev-based':
          outcome = selectEVBasedOutcome(match.odds, adjustedProbs, 0.15);
          break;
        case 'multi-row-coverage':
          // For multi-row coverage, we'll use weighted random with slight variations
          outcome = selectWeightedRandomOutcome(adjustedProbs);
          break;
        default:
          outcome = selectWeightedRandomOutcome(adjustedProbs);
      }
    }
    
    outcomes.push(outcome);
  }

  // Validate against filters
  if (!validateRowAgainstFilters(outcomes, matches, config.filters)) {
    return null; // Row doesn't meet criteria
  }

  // Calculate expected metrics
  const expectedCorrect = calculateExpectedCorrect(outcomes, matches);
  const expectedPayout = calculateExpectedPayout(expectedCorrect);

  return {
    id: rowId || generateRowId(),
    outcomes,
    expectedCorrect,
    expectedPayout,
    riskProfile: config.riskProfile,
    filters: config.filters,
    createdAt: new Date().toISOString()
  };
}

/**
 * Generate multiple rows with retry logic
 */
export function generateMultipleRows(
  matches: MatchWithOdds[],
  config: GeneratorConfig
): GeneratedRow[] {
  const rows: GeneratedRow[] = [];
  const maxAttempts = config.numRows * 10; // Allow for retries
  let attempts = 0;

  while (rows.length < config.numRows && attempts < maxAttempts) {
    attempts++;
    const row = generateRow(matches, config);
    
    if (row) {
      // Check for duplicates
      const isDuplicate = rows.some(existingRow => 
        JSON.stringify(existingRow.outcomes) === JSON.stringify(row.outcomes)
      );
      
      if (!isDuplicate) {
        rows.push(row);
      }
    }
  }

  return rows;
}

/**
 * Validate a row against filters
 */
function validateRowAgainstFilters(
  outcomes: Outcome[],
  matches: MatchWithOdds[],
  filters: RowFilters
): boolean {
  const draws = outcomes.filter(o => o === 'X').length;
  const awayWins = outcomes.filter(o => o === '2').length;
  const homeWins = outcomes.filter(o => o === '1').length;
  
  // Check draw constraints
  if (filters.minDraws !== undefined && draws < filters.minDraws) return false;
  if (filters.maxDraws !== undefined && draws > filters.maxDraws) return false;
  
  // Check away win constraints
  if (filters.minAwayWins !== undefined && awayWins < filters.minAwayWins) return false;
  if (filters.maxAwayWins !== undefined && awayWins > filters.maxAwayWins) return false;
  
  // Check favorites constraint (odds below certain threshold)
  if (filters.maxOddsBelow !== undefined && filters.maxFavorites !== undefined) {
    let favoritesCount = 0;
    for (let i = 0; i < outcomes.length; i++) {
      const match = matches[i];
      const outcome = outcomes[i];
      let odds: number;
      
      switch (outcome) {
        case '1':
          odds = match.odds.home;
          break;
        case 'X':
          odds = match.odds.draw;
          break;
        case '2':
          odds = match.odds.away;
          break;
      }
      
      if (odds < filters.maxOddsBelow) {
        favoritesCount++;
      }
    }
    
    if (favoritesCount > filters.maxFavorites) return false;
  }
  
  return true;
}

/**
 * Calculate expected number of correct results
 */
function calculateExpectedCorrect(outcomes: Outcome[], matches: MatchWithOdds[]): number {
  let expected = 0;
  
  for (let i = 0; i < outcomes.length; i++) {
    const match = matches[i];
    const outcome = outcomes[i];
    
    switch (outcome) {
      case '1':
        expected += match.probabilities.home;
        break;
      case 'X':
        expected += match.probabilities.draw;
        break;
      case '2':
        expected += match.probabilities.away;
        break;
    }
  }
  
  return expected;
}

/**
 * Calculate expected payout based on Svenska Spel's payout structure
 * This is a simplified model - real payouts depend on the total pool and winners
 */
function calculateExpectedPayout(expectedCorrect: number): number {
  // Simplified payout model based on historical data
  if (expectedCorrect >= 13) return 50000; // Jackpot estimate
  if (expectedCorrect >= 12) return 5000;
  if (expectedCorrect >= 11) return 500;
  if (expectedCorrect >= 10) return 50;
  return 0;
}

/**
 * Generate a unique row ID
 */
function generateRowId(): string {
  return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate diversity score between rows (how different they are)
 */
export function calculateDiversityScore(rows: GeneratedRow[]): number {
  if (rows.length < 2) return 1;
  
  let totalDifferences = 0;
  let comparisons = 0;
  
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const differences = rows[i].outcomes.reduce((diff, outcome, index) => {
        return diff + (outcome !== rows[j].outcomes[index] ? 1 : 0);
      }, 0);
      
      totalDifferences += differences;
      comparisons++;
    }
  }
  
  return totalDifferences / (comparisons * 13); // Normalize by number of matches
}