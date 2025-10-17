import type { MatchOdds, RiskProfile, Outcome } from '../types';

/**
 * Convert bookmaker odds to implied probabilities and normalize them
 * to remove the bookmaker's vig (overround)
 */
export function oddsToNormalizedProbabilities(odds: { home: number; draw: number; away: number }): { home: number; draw: number; away: number } {
  // Calculate implied probabilities
  const impliedProbs = {
    home: 1 / odds.home,
    draw: 1 / odds.draw,
    away: 1 / odds.away
  };

  // Calculate total (this will be > 1 due to bookmaker vig)
  const total = impliedProbs.home + impliedProbs.draw + impliedProbs.away;

  // Normalize to remove vig
  return {
    home: impliedProbs.home / total,
    draw: impliedProbs.draw / total,
    away: impliedProbs.away / total
  };
}

/**
 * Adjust probabilities based on risk profile
 * risk_factor ∈ [-1,1] where -1 = ultra safe, +1 = ultra risky
 */
export function adjustProbabilityForRisk(prob: number, riskFactor: number): number {
  const bias = 1 + (riskFactor * (0.5 - prob));
  return Math.max(0, Math.min(1, prob * bias));
}

/**
 * Get risk factor for a given profile
 */
export function getRiskFactor(profile: RiskProfile): number {
  switch (profile) {
    case 'safe':
      return -0.7; // Bias toward favorites
    case 'balanced':
      return 0; // No bias
    case 'risky':
      return 0.7; // Bias toward underdogs
    default:
      return 0;
  }
}

/**
 * Adjust match probabilities based on risk profile
 */
export function adjustMatchProbabilities(
  probabilities: { home: number; draw: number; away: number },
  riskProfile: RiskProfile
): { home: number; draw: number; away: number } {
  const riskFactor = getRiskFactor(riskProfile);
  
  const adjusted = {
    home: adjustProbabilityForRisk(probabilities.home, riskFactor),
    draw: adjustProbabilityForRisk(probabilities.draw, riskFactor),
    away: adjustProbabilityForRisk(probabilities.away, riskFactor)
  };

  // Renormalize to ensure they sum to 1
  const total = adjusted.home + adjusted.draw + adjusted.away;
  
  return {
    home: adjusted.home / total,
    draw: adjusted.draw / total,
    away: adjusted.away / total
  };
}

/**
 * Calculate Expected Value for each outcome
 */
export function calculateExpectedValues(
  odds: { home: number; draw: number; away: number },
  probabilities: { home: number; draw: number; away: number }
): { home: number; draw: number; away: number } {
  return {
    home: (odds.home * probabilities.home) - 1,
    draw: (odds.draw * probabilities.draw) - 1,
    away: (odds.away * probabilities.away) - 1
  };
}

/**
 * Select outcome based on weighted random selection
 */
export function selectWeightedRandomOutcome(probabilities: { home: number; draw: number; away: number }): Outcome {
  const random = Math.random();
  
  if (random < probabilities.home) {
    return '1';
  } else if (random < probabilities.home + probabilities.draw) {
    return 'X';
  } else {
    return '2';
  }
}

/**
 * Select outcome based on highest Expected Value
 */
export function selectEVBasedOutcome(
  odds: { home: number; draw: number; away: number },
  probabilities: { home: number; draw: number; away: number },
  randomnessFactor: number = 0.1
): Outcome {
  const evs = calculateExpectedValues(odds, probabilities);
  
  // Add some randomness to avoid always picking the same outcome
  if (Math.random() < randomnessFactor) {
    return selectWeightedRandomOutcome(probabilities);
  }
  
  // Find outcome with highest EV
  if (evs.home >= evs.draw && evs.home >= evs.away) {
    return '1';
  } else if (evs.draw >= evs.away) {
    return 'X';
  } else {
    return '2';
  }
}

/**
 * Generate mock odds for testing (will be replaced with real API calls)
 */
export function generateMockOdds(): { home: number; draw: number; away: number } {
  // Generate realistic odds ranges
  const homeOdds = 1.5 + Math.random() * 3; // 1.5 - 4.5
  const drawOdds = 2.8 + Math.random() * 1.5; // 2.8 - 4.3
  const awayOdds = 1.8 + Math.random() * 4; // 1.8 - 5.8
  
  return {
    home: Math.round(homeOdds * 100) / 100,
    draw: Math.round(drawOdds * 100) / 100,
    away: Math.round(awayOdds * 100) / 100
  };
}