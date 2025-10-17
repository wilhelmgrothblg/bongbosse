import type { MatchWithOdds } from '../types';

export interface ValueBet {
  matchId: string;
  outcome: '1' | 'X' | '2';
  value: number;
  kellyFraction: number;
  confidence: number;
  recommendedStake: number;
}

export interface KellyResult {
  valueBets: ValueBet[];
  totalValue: number;
  recommendedOutcomes: Record<string, '1' | 'X' | '2'>;
}

export class KellyCriterion {
  /**
   * Calculate the Kelly fraction for optimal bet sizing
   */
  static calculateOptimalStake(
    trueProbability: number,
    bookmakerOdds: number,
    bankroll: number = 1000
  ): number {
    const edge = (trueProbability * bookmakerOdds) - 1;
    
    if (edge <= 0) return 0; // No positive expected value
    
    const kellyFraction = edge / (bookmakerOdds - 1);
    
    // Cap at 25% of bankroll for safety
    return Math.min(kellyFraction * bankroll, 0.25 * bankroll);
  }

  /**
   * Calculate the value of a bet (expected value)
   */
  static calculateValue(trueProbability: number, bookmakerOdds: number): number {
    return (trueProbability * bookmakerOdds) - 1;
  }

  /**
   * Find value bets across all matches
   */
  static findValueBets(matches: MatchWithOdds[], bankroll: number = 1000): KellyResult {
    const valueBets: ValueBet[] = [];
    const recommendedOutcomes: Record<string, '1' | 'X' | '2'> = {};

    matches.forEach(match => {
      // Calculate true probabilities (enhanced with market analysis)
      const trueProbabilities = this.calculateTrueProbabilities(match);
      
      // Check each outcome for value
      const outcomes: Array<{outcome: '1' | 'X' | '2', prob: number, odds: number}> = [
        { outcome: '1', prob: trueProbabilities.home, odds: match.odds.home },
        { outcome: 'X', prob: trueProbabilities.draw, odds: match.odds.draw },
        { outcome: '2', prob: trueProbabilities.away, odds: match.odds.away }
      ];

      let bestValue = -1;
      let bestOutcome: '1' | 'X' | '2' = '1';

      outcomes.forEach(({ outcome, prob, odds }) => {
        const value = this.calculateValue(prob, odds);
        const kellyFraction = value > 0 ? this.calculateOptimalStake(prob, odds, bankroll) / bankroll : 0;
        
        if (value > 0) {
          valueBets.push({
            matchId: match.matchId,
            outcome,
            value,
            kellyFraction,
            confidence: this.calculateConfidence(prob, odds, match),
            recommendedStake: this.calculateOptimalStake(prob, odds, bankroll)
          });
        }

        if (value > bestValue) {
          bestValue = value;
          bestOutcome = outcome;
        }
      });

      // Store the best outcome for this match
      if (bestValue > -0.05) { // Tolerance for close calls
        recommendedOutcomes[match.matchId] = bestOutcome;
      }
    });

    return {
      valueBets: valueBets.sort((a, b) => b.value - a.value),
      totalValue: valueBets.reduce((sum, bet) => sum + bet.value, 0),
      recommendedOutcomes
    };
  }

  /**
   * Calculate enhanced true probabilities using market data
   */
  private static calculateTrueProbabilities(match: MatchWithOdds): {
    home: number;
    draw: number;
    away: number;
  } {
    // Start with implied probabilities from odds
    const impliedHome = 1 / match.odds.home;
    const impliedDraw = 1 / match.odds.draw;
    const impliedAway = 1 / match.odds.away;
    const total = impliedHome + impliedDraw + impliedAway;

    // Normalize to remove bookmaker margin
    let normalizedHome = impliedHome / total;
    let normalizedDraw = impliedDraw / total;
    let normalizedAway = impliedAway / total;

    // Adjust based on Svenska Folket data (wisdom of crowds)
    if (match.svenskaSpelData?.svenskaFolket) {
      const publicHome = match.svenskaSpelData.svenskaFolket.home / 100;
      const publicDraw = match.svenskaSpelData.svenskaFolket.draw / 100;
      const publicAway = match.svenskaSpelData.svenskaFolket.away / 100;

      // Weight: 70% normalized odds, 30% public sentiment
      normalizedHome = (normalizedHome * 0.7) + (publicHome * 0.3);
      normalizedDraw = (normalizedDraw * 0.7) + (publicDraw * 0.3);
      normalizedAway = (normalizedAway * 0.7) + (publicAway * 0.3);
    }

    // Apply team form and league patterns (simplified)
    const homeAdvantage = 0.05; // 5% home advantage
    normalizedHome += homeAdvantage;
    normalizedAway -= homeAdvantage / 2;
    normalizedDraw -= homeAdvantage / 2;

    // Ensure probabilities sum to 1
    const finalTotal = normalizedHome + normalizedDraw + normalizedAway;
    return {
      home: normalizedHome / finalTotal,
      draw: normalizedDraw / finalTotal,
      away: normalizedAway / finalTotal
    };
  }

  /**
   * Calculate confidence score for a bet
   */
  private static calculateConfidence(
    probability: number,
    odds: number,
    match: MatchWithOdds
  ): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence for strong favorites or clear underdogs
    if (probability > 0.6 || probability < 0.2) {
      confidence += 0.2;
    }

    // Adjust based on market efficiency
    const impliedProb = 1 / odds;
    const discrepancy = Math.abs(probability - impliedProb);
    confidence += Math.min(discrepancy * 2, 0.3);

    return Math.min(confidence, 1.0);
  }
}