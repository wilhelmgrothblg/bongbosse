// Market Analysis System for Stryktipset
// Detects steam moves, contrarian opportunities, and market inefficiencies

import type { MatchWithOdds, Outcome } from '$lib/types';

export interface SteamMove {
  matchId: string;
  outcome: Outcome;
  oddsMovement: number; // Percentage change
  direction: 'steam' | 'reverse-steam';
  strength: 'weak' | 'moderate' | 'strong';
  timing: 'early' | 'late';
  confidence: number;
}

export interface MarketInefficiency {
  matchId: string;
  outcome: Outcome;
  type: 'overvalued' | 'undervalued';
  severity: number; // 0-1 scale
  reasons: string[];
  expectedCorrection: number;
}

export interface ContrarianSignal {
  matchId: string;
  outcome: Outcome;
  publicPercentage: number;
  recommendedAction: 'fade' | 'follow' | 'neutral';
  strength: number; // 0-1 scale
  reasoning: string;
}

export interface MarketAnalysisResult {
  steamMoves: SteamMove[];
  inefficiencies: MarketInefficiency[];
  contrarianSignals: ContrarianSignal[];
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  overallEfficiency: number; // 0-1 scale, 1 = perfectly efficient
}

export class MarketAnalyzer {
  private historicalOdds: Map<string, any[]> = new Map();
  
  /**
   * Analyze the entire market for betting opportunities
   */
  analyzeMarket(matches: MatchWithOdds[]): MarketAnalysisResult {
    const steamMoves = this.detectSteamMoves(matches);
    const inefficiencies = this.findMarketInefficiencies(matches);
    const contrarianSignals = this.analyzeContrarianOpportunities(matches);
    
    return {
      steamMoves,
      inefficiencies,
      contrarianSignals,
      marketSentiment: this.calculateMarketSentiment(matches, steamMoves),
      overallEfficiency: this.calculateMarketEfficiency(matches)
    };
  }

  /**
   * Detect steam moves (sharp money movement)
   */
  private detectSteamMoves(matches: MatchWithOdds[]): SteamMove[] {
    const steamMoves: SteamMove[] = [];

    for (const match of matches) {
      const outcomes: { outcome: Outcome; odds: number }[] = [
        { outcome: '1', odds: match.odds.home },
        { outcome: 'X', odds: match.odds.draw },
        { outcome: '2', odds: match.odds.away }
      ];

      for (const { outcome, odds } of outcomes) {
        const historical = this.getHistoricalOdds(match.matchId, outcome);
        
        if (historical.length >= 2) {
          const movement = this.calculateOddsMovement(historical, odds);
          const steamMove = this.identifySteamMove(match.matchId, outcome, movement, odds);
          
          if (steamMove) {
            steamMoves.push(steamMove);
          }
        }
      }
    }

    return steamMoves.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Find market inefficiencies
   */
  private findMarketInefficiencies(matches: MatchWithOdds[]): MarketInefficiency[] {
    const inefficiencies: MarketInefficiency[] = [];

    for (const match of matches) {
      // Check for bookmaker margin anomalies
      const totalImpliedProb = (1/match.odds.home) + (1/match.odds.draw) + (1/match.odds.away);
      const margin = totalImpliedProb - 1;

      if (margin < 0.02 || margin > 0.12) { // Unusually low or high margin
        const reasons = margin < 0.02 ? 
          ['Exceptionally low bookmaker margin', 'Potential arbitrage opportunity'] :
          ['High bookmaker margin', 'Overpriced market'];

        inefficiencies.push({
          matchId: match.matchId,
          outcome: this.getLowestOddsOutcome(match),
          type: margin < 0.02 ? 'undervalued' : 'overvalued',
          severity: Math.abs(margin - 0.06) / 0.06, // 6% is typical margin
          reasons,
          expectedCorrection: margin < 0.02 ? 0.03 : -0.03
        });
      }

      // Check for probability-odds mismatches
      this.checkProbabilityMismatches(match, inefficiencies);
    }

    return inefficiencies.sort((a, b) => b.severity - a.severity);
  }

  /**
   * Analyze contrarian betting opportunities
   */
  private analyzeContrarianOpportunities(matches: MatchWithOdds[]): ContrarianSignal[] {
    const signals: ContrarianSignal[] = [];

    for (const match of matches) {
      if (match.svenskaSpelData?.svenskaFolket) {
        const publicData = match.svenskaSpelData.svenskaFolket;
        
        // Check for extreme public bias
        const publicBets = [
          { outcome: '1' as Outcome, percentage: publicData.home },
          { outcome: 'X' as Outcome, percentage: publicData.draw },
          { outcome: '2' as Outcome, percentage: publicData.away }
        ];

        for (const bet of publicBets) {
          const signal = this.evaluateContrarianSignal(match, bet.outcome, bet.percentage);
          if (signal) {
            signals.push(signal);
          }
        }
      }
    }

    return signals.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Calculate overall market sentiment
   */
  private calculateMarketSentiment(matches: MatchWithOdds[], steamMoves: SteamMove[]): 'bullish' | 'bearish' | 'neutral' {
    let sentiment = 0;

    // Analyze steam moves
    for (const move of steamMoves) {
      if (move.direction === 'steam') {
        sentiment += move.confidence * 0.1;
      } else {
        sentiment -= move.confidence * 0.1;
      }
    }

    // Analyze odds distribution
    for (const match of matches) {
      const favoriteOdds = Math.min(match.odds.home, match.odds.draw, match.odds.away);
      if (favoriteOdds < 1.5) sentiment -= 0.02; // Heavy favorites = bearish
      if (favoriteOdds > 2.5) sentiment += 0.02; // No clear favorite = bullish
    }

    if (sentiment > 0.1) return 'bullish';
    if (sentiment < -0.1) return 'bearish';
    return 'neutral';
  }

  /**
   * Calculate market efficiency score
   */
  private calculateMarketEfficiency(matches: MatchWithOdds[]): number {
    let efficiencyScore = 1.0;
    let totalMatches = matches.length;

    for (const match of matches) {
      // Check margin consistency
      const totalImpliedProb = (1/match.odds.home) + (1/match.odds.draw) + (1/match.odds.away);
      const margin = totalImpliedProb - 1;
      const marginDeviation = Math.abs(margin - 0.06) / 0.06;
      
      efficiencyScore -= marginDeviation * 0.1 / totalMatches;

      // Check for obvious arbitrage opportunities
      if (margin < 0) {
        efficiencyScore -= 0.2 / totalMatches;
      }

      // Check odds distribution rationality
      const oddsList = [match.odds.home, match.odds.draw, match.odds.away];
      const maxOdds = Math.max(...oddsList);
      const minOdds = Math.min(...oddsList);
      
      if (maxOdds / minOdds > 20) { // Extreme odds spread
        efficiencyScore -= 0.05 / totalMatches;
      }
    }

    return Math.max(0, Math.min(1, efficiencyScore));
  }

  /**
   * Helper methods
   */
  private calculateOddsMovement(historical: any[], currentOdds: number): number {
    if (historical.length === 0) return 0;
    
    const previousOdds = historical[historical.length - 1].odds;
    return ((currentOdds - previousOdds) / previousOdds) * 100;
  }

  private identifySteamMove(matchId: string, outcome: Outcome, movement: number, currentOdds: number): SteamMove | null {
    const absMovement = Math.abs(movement);
    
    if (absMovement < 2) return null; // Minimum 2% movement
    
    let strength: 'weak' | 'moderate' | 'strong';
    if (absMovement > 10) strength = 'strong';
    else if (absMovement > 5) strength = 'moderate';
    else strength = 'weak';

    const confidence = Math.min(0.95, absMovement / 15); // Max 95% confidence

    return {
      matchId,
      outcome,
      oddsMovement: movement,
      direction: movement < 0 ? 'steam' : 'reverse-steam',
      strength,
      timing: this.determineMovementTiming(),
      confidence
    };
  }

  private checkProbabilityMismatches(match: MatchWithOdds, inefficiencies: MarketInefficiency[]): void {
    const impliedProbs = {
      home: 1 / match.odds.home,
      draw: 1 / match.odds.draw,
      away: 1 / match.odds.away
    };

    const modelProbs = {
      home: match.probabilities.home,
      draw: match.probabilities.draw,
      away: match.probabilities.away
    };

    const outcomes: { outcome: Outcome; implied: number; model: number }[] = [
      { outcome: '1', implied: impliedProbs.home, model: modelProbs.home },
      { outcome: 'X', implied: impliedProbs.draw, model: modelProbs.draw },
      { outcome: '2', implied: impliedProbs.away, model: modelProbs.away }
    ];

    for (const { outcome, implied, model } of outcomes) {
      const discrepancy = Math.abs(implied - model);
      
      if (discrepancy > 0.15) { // 15% discrepancy threshold
        inefficiencies.push({
          matchId: match.matchId,
          outcome,
          type: implied > model ? 'overvalued' : 'undervalued',
          severity: discrepancy,
          reasons: [
            `${Math.round(discrepancy * 100)}% probability discrepancy`,
            `Market implies ${Math.round(implied * 100)}%, model suggests ${Math.round(model * 100)}%`
          ],
          expectedCorrection: (model - implied) * 0.5 // Conservative correction estimate
        });
      }
    }
  }

  private getLowestOddsOutcome(match: MatchWithOdds): Outcome {
    const odds = [
      { outcome: '1' as Outcome, value: match.odds.home },
      { outcome: 'X' as Outcome, value: match.odds.draw },
      { outcome: '2' as Outcome, value: match.odds.away }
    ];
    
    return odds.reduce((min, current) => current.value < min.value ? current : min).outcome;
  }

  private evaluateContrarianSignal(match: MatchWithOdds, outcome: Outcome, publicPercentage: number): ContrarianSignal | null {
    // Contrarian theory: fade the public when they're heavily biased
    if (publicPercentage > 70) {
      return {
        matchId: match.matchId,
        outcome,
        publicPercentage,
        recommendedAction: 'fade',
        strength: (publicPercentage - 70) / 30, // 0-1 scale
        reasoning: `${Math.round(publicPercentage)}% of public backing this outcome - historically overvalued`
      };
    }
    
    if (publicPercentage < 15) {
      return {
        matchId: match.matchId,
        outcome,
        publicPercentage,
        recommendedAction: 'follow',
        strength: (15 - publicPercentage) / 15, // 0-1 scale
        reasoning: `Only ${Math.round(publicPercentage)}% of public backing this outcome - potential value`
      };
    }

    return null;
  }

  private determineMovementTiming(): 'early' | 'late' {
    // In a real implementation, this would check time until kickoff
    // For now, we'll use a simple heuristic
    return Math.random() > 0.5 ? 'early' : 'late';
  }

  private getHistoricalOdds(matchId: string, outcome: Outcome): any[] {
    // In a real implementation, this would fetch from a database
    // For now, return mock data
    return this.historicalOdds.get(`${matchId}_${outcome}`) || [];
  }

  /**
   * Store odds for future analysis (call this when odds update)
   */
  recordOddsSnapshot(matchId: string, outcome: Outcome, odds: number, timestamp: Date = new Date()): void {
    const key = `${matchId}_${outcome}`;
    const historical = this.historicalOdds.get(key) || [];
    
    historical.push({ odds, timestamp });
    
    // Keep only last 20 snapshots per match/outcome
    if (historical.length > 20) {
      historical.shift();
    }
    
    this.historicalOdds.set(key, historical);
  }
}