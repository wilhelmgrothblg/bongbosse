// Enhanced System Generator for Stryktipset
// Integrates Kelly Criterion, Market Analysis, and Pattern Recognition

import type { MatchWithOdds, GeneratedRow, RiskProfile, Outcome, RowFilters } from '$lib/types';
import { KellyCriterion } from './kellycriterion.js';
import { MarketAnalyzer } from './marketanalysis.js';
import { PatternRecognizer } from './patternrecognition.js';

export interface EnhancedGeneratorConfig {
  riskProfile: RiskProfile;
  numRows: number;
  bankroll: number;
  minValueThreshold: number; // Minimum EV for inclusion
  confidenceThreshold: number; // Minimum pattern confidence
  diversificationLevel: 'low' | 'medium' | 'high';
  useMarketIntelligence: boolean;
  usePatternAnalysis: boolean;
  useKellyCriterion: boolean;
}

export interface SystemAnalysis {
  totalExpectedValue: number;
  avgConfidence: number;
  riskScore: number;
  diversificationScore: number;
  marketIntelligenceScore: number;
  patternStrength: number;
  kellyOptimization: number;
  recommendations: string[];
  warnings: string[];
}

export interface EnhancedRow extends GeneratedRow {
  marketIntelligence?: {
    steamMoves: number;
    contrarian: number;
    inefficiencies: number;
  };
  patternStrength?: number;
  kellyOptimal?: boolean;
  intelligenceScore?: number;
}

export class EnhancedSystemGenerator {
  private kellyCriterion: KellyCriterion;
  private marketAnalyzer: MarketAnalyzer;
  private patternRecognizer: PatternRecognizer;

  constructor() {
    this.kellyCriterion = new KellyCriterion();
    this.marketAnalyzer = new MarketAnalyzer();
    this.patternRecognizer = new PatternRecognizer();
  }

  /**
   * Generate enhanced system rows using all available intelligence
   */
  async generateEnhancedSystem(
    matches: MatchWithOdds[], 
    config: EnhancedGeneratorConfig
  ): Promise<{ rows: EnhancedRow[]; analysis: SystemAnalysis }> {
    
    // Run all analyses in parallel for performance
    const [kellyAnalysis, marketAnalysis, patternAnalysis] = await Promise.all([
      config.useKellyCriterion ? KellyCriterion.findValueBets(matches, config.bankroll) : null,
      config.useMarketIntelligence ? this.marketAnalyzer.analyzeMarket(matches) : null,
      config.usePatternAnalysis ? this.patternRecognizer.analyzePatterns(matches) : null
    ]);

    // Generate intelligent recommendations for each match
    const matchRecommendations = this.generateMatchRecommendations(
      matches, 
      kellyAnalysis, 
      marketAnalysis, 
      patternAnalysis, 
      config
    );

    // Generate system rows based on intelligence
    const rows = this.generateIntelligentRows(
      matches, 
      matchRecommendations, 
      config
    );

    // Analyze the generated system
    const analysis = this.analyzeGeneratedSystem(
      rows, 
      kellyAnalysis, 
      marketAnalysis, 
      patternAnalysis, 
      config
    );

    return { rows, analysis };
  }

  /**
   * Generate recommendations for each match based on all available intelligence
   */
  private generateMatchRecommendations(
    matches: MatchWithOdds[],
    kellyAnalysis: any,
    marketAnalysis: any,
    patternAnalysis: any,
    config: EnhancedGeneratorConfig
  ): Map<string, MatchRecommendation> {
    const recommendations = new Map<string, MatchRecommendation>();

    for (const match of matches) {
      const recommendation: MatchRecommendation = {
        matchId: match.matchId,
        primaryOutcome: 'X',
        confidence: 0.33,
        alternatives: ['1', '2'],
        reasoning: [],
        riskLevel: 'medium',
        intelligenceScore: 0
      };

      let totalConfidence = 0;
      let outcomeScores = { '1': 0, 'X': 0, '2': 0 };

      // Kelly Criterion analysis
      if (kellyAnalysis && config.useKellyCriterion) {
        const valueBets = kellyAnalysis.valueBets.filter((bet: any) => bet.matchId === match.matchId);
        for (const bet of valueBets) {
          const outcome = bet.outcome as Outcome;
          outcomeScores[outcome] += bet.value * 10; // Scale value to scoring system
          totalConfidence += 0.2;
          recommendation.reasoning.push(`Kelly: ${bet.outcome} shows ${(bet.value * 100).toFixed(1)}% expected value`);
        }
        recommendation.intelligenceScore += 0.3;
      }

      // Market Analysis intelligence
      if (marketAnalysis && config.useMarketIntelligence) {
        // Steam moves
        const steamMoves = marketAnalysis.steamMoves.filter((move: any) => move.matchId === match.matchId);
        for (const move of steamMoves) {
          const score = move.confidence * (move.direction === 'steam' ? 1 : -0.5);
          const outcome = move.outcome as Outcome;
          outcomeScores[outcome] += score;
          totalConfidence += 0.15;
          recommendation.reasoning.push(`Market: ${move.outcome} ${move.direction} (${move.strength} confidence)`);
        }

        // Contrarian signals
        const contrarianSignals = marketAnalysis.contrarianSignals.filter((signal: any) => signal.matchId === match.matchId);
        for (const signal of contrarianSignals) {
          const outcome = signal.outcome as Outcome;
          if (signal.recommendedAction === 'fade') {
            outcomeScores[outcome] -= signal.strength * 0.5;
            recommendation.reasoning.push(`Contrarian: Fade ${signal.outcome} (${signal.reasoning})`);
          } else if (signal.recommendedAction === 'follow') {
            outcomeScores[outcome] += signal.strength * 0.3;
            recommendation.reasoning.push(`Contrarian: Follow ${signal.outcome} (${signal.reasoning})`);
          }
        }
        
        recommendation.intelligenceScore += 0.25;
      }

      // Pattern Recognition analysis
      if (patternAnalysis && config.usePatternAnalysis) {
        const matchPattern = patternAnalysis.matchPatterns.find((pattern: any) => pattern.matchId === match.matchId);
        if (matchPattern) {
          const outcome = matchPattern.recommendedOutcome as Outcome;
          outcomeScores[outcome] += matchPattern.confidence * 2;
          totalConfidence += matchPattern.confidence;
          recommendation.reasoning.push(`Pattern: ${matchPattern.primaryPattern} suggests ${matchPattern.recommendedOutcome}`);
          
          if (matchPattern.supportingFactors.length > 0) {
            recommendation.reasoning.push(`Supporting: ${matchPattern.supportingFactors.join(', ')}`);
          }
        }
        recommendation.intelligenceScore += 0.25;
      }

      // Determine primary outcome and confidence
      const bestOutcome = Object.entries(outcomeScores).reduce((a, b) => 
        outcomeScores[a[0] as Outcome] > outcomeScores[b[0] as Outcome] ? a : b
      )[0] as Outcome;

      recommendation.primaryOutcome = bestOutcome;
      recommendation.confidence = Math.min(0.95, Math.max(0.1, totalConfidence));
      
      // Set alternatives
      recommendation.alternatives = (['1', 'X', '2'] as Outcome[]).filter(outcome => outcome !== bestOutcome);

      // Determine risk level based on confidence and intelligence score
      if (recommendation.confidence > 0.7 && recommendation.intelligenceScore > 0.5) {
        recommendation.riskLevel = 'low';
      } else if (recommendation.confidence < 0.4 || recommendation.intelligenceScore < 0.3) {
        recommendation.riskLevel = 'high';
      } else {
        recommendation.riskLevel = 'medium';
      }

      recommendations.set(match.matchId, recommendation);
    }

    return recommendations;
  }

  /**
   * Generate system rows based on match recommendations and risk profile
   */
  private generateIntelligentRows(
    matches: MatchWithOdds[],
    recommendations: Map<string, MatchRecommendation>,
    config: EnhancedGeneratorConfig
  ): EnhancedRow[] {
    const rows: EnhancedRow[] = [];
    
    for (let i = 0; i < config.numRows; i++) {
      const row = this.generateSingleIntelligentRow(matches, recommendations, config, i);
      rows.push(row);
    }

    // Apply diversification if requested
    if (config.diversificationLevel !== 'low') {
      this.applyDiversification(rows, config.diversificationLevel);
    }

    return rows;
  }

  /**
   * Generate a single intelligent row
   */
  private generateSingleIntelligentRow(
    matches: MatchWithOdds[],
    recommendations: Map<string, MatchRecommendation>,
    config: EnhancedGeneratorConfig,
    rowIndex: number
  ): EnhancedRow {
    const outcomes: Outcome[] = [];
    let expectedCorrect = 0;
    let expectedPayout = 1;
    let totalIntelligenceScore = 0;
    let marketIntelligence = { steamMoves: 0, contrarian: 0, inefficiencies: 0 };
    let patternStrength = 0;
    let kellyOptimal = true;

    for (const match of matches) {
      const recommendation = recommendations.get(match.matchId);
      let selectedOutcome: Outcome;

      if (recommendation) {
        // Apply risk profile to outcome selection
        selectedOutcome = this.selectOutcomeByRiskProfile(
          recommendation, 
          config.riskProfile, 
          rowIndex
        );

        // Update metrics
        expectedCorrect += recommendation.confidence;
        totalIntelligenceScore += recommendation.intelligenceScore;
        patternStrength += recommendation.confidence;

        // Check Kelly optimality
        if (recommendation.riskLevel === 'high' && config.riskProfile === 'safe') {
          kellyOptimal = false;
        }

      } else {
        // Fallback to probability-based selection
        selectedOutcome = this.selectOutcomeByProbability(match, config.riskProfile);
        expectedCorrect += match.probabilities[selectedOutcome === '1' ? 'home' : selectedOutcome === 'X' ? 'draw' : 'away'];
      }

      outcomes.push(selectedOutcome);
      expectedPayout *= match.odds[selectedOutcome === '1' ? 'home' : selectedOutcome === 'X' ? 'draw' : 'away'];
    }

    // Apply expected value calculation
    expectedPayout = expectedPayout * (expectedCorrect / matches.length);

    const filters: RowFilters = this.generateRowFilters(config);

    return {
      id: `enhanced_${Date.now()}_${rowIndex}`,
      outcomes,
      expectedCorrect,
      expectedPayout,
      riskProfile: config.riskProfile,
      filters,
      createdAt: new Date().toISOString(),
      marketIntelligence,
      patternStrength: patternStrength / matches.length,
      kellyOptimal,
      intelligenceScore: totalIntelligenceScore / matches.length
    };
  }

  /**
   * Select outcome based on risk profile and recommendation
   */
  private selectOutcomeByRiskProfile(
    recommendation: MatchRecommendation,
    riskProfile: RiskProfile,
    rowIndex: number
  ): Outcome {
    const confidenceThreshold = {
      'safe': 0.6,
      'balanced': 0.4,
      'risky': 0.2
    };

    // High confidence recommendation - follow it
    if (recommendation.confidence >= confidenceThreshold[riskProfile]) {
      return recommendation.primaryOutcome;
    }

    // Medium confidence - mix with alternatives based on risk profile
    if (recommendation.confidence >= 0.4) {
      if (riskProfile === 'safe') {
        // Conservative: stick with primary or safest alternative
        return Math.random() > 0.3 ? recommendation.primaryOutcome : 'X';
      } else if (riskProfile === 'risky') {
        // Aggressive: try alternatives for better odds
        return Math.random() > 0.5 ? recommendation.primaryOutcome : 
               recommendation.alternatives[rowIndex % recommendation.alternatives.length];
      }
    }

    // Low confidence - apply diversification
    const outcomes: Outcome[] = ['1', 'X', '2'];
    if (riskProfile === 'safe') {
      return 'X'; // Default to draw when uncertain
    } else {
      return outcomes[rowIndex % outcomes.length]; // Rotate for diversification
    }
  }

  /**
   * Fallback probability-based outcome selection
   */
  private selectOutcomeByProbability(match: MatchWithOdds, riskProfile: RiskProfile): Outcome {
    const probs = match.probabilities;
    const rand = Math.random();

    if (riskProfile === 'safe') {
      // Favor higher probability outcomes
      if (probs.home >= Math.max(probs.draw, probs.away)) return '1';
      if (probs.draw >= probs.away) return 'X';
      return '2';
    } else if (riskProfile === 'risky') {
      // Weighted random with bias toward longer odds
      const weights = [1/match.odds.home, 1/match.odds.draw, 1/match.odds.away];
      const total = weights.reduce((a, b) => a + b, 0);
      const normalized = weights.map(w => w / total);
      
      if (rand < normalized[0]) return '1';
      if (rand < normalized[0] + normalized[1]) return 'X';
      return '2';
    } else {
      // Balanced approach
      if (rand < probs.home) return '1';
      if (rand < probs.home + probs.draw) return 'X';
      return '2';
    }
  }

  /**
   * Apply diversification to generated rows
   */
  private applyDiversification(rows: EnhancedRow[], level: 'medium' | 'high'): void {
    const diversificationStrength = level === 'high' ? 0.4 : 0.2;
    
    for (let i = 1; i < rows.length; i++) {
      const previousRow = rows[i - 1];
      const currentRow = rows[i];
      
      // Count identical outcomes
      let identicalCount = 0;
      for (let j = 0; j < currentRow.outcomes.length; j++) {
        if (currentRow.outcomes[j] === previousRow.outcomes[j]) {
          identicalCount++;
        }
      }
      
      // If too similar, modify some outcomes
      const similarityRatio = identicalCount / currentRow.outcomes.length;
      if (similarityRatio > (1 - diversificationStrength)) {
        const outcomesToChange = Math.ceil(currentRow.outcomes.length * diversificationStrength);
        
        for (let k = 0; k < outcomesToChange; k++) {
          const randomIndex = Math.floor(Math.random() * currentRow.outcomes.length);
          const alternatives = (['1', 'X', '2'] as Outcome[]).filter(o => o !== currentRow.outcomes[randomIndex]);
          currentRow.outcomes[randomIndex] = alternatives[Math.floor(Math.random() * alternatives.length)];
        }
      }
    }
  }

  /**
   * Generate row filters based on configuration
   */
  private generateRowFilters(config: EnhancedGeneratorConfig): RowFilters {
    const filters: RowFilters = {};

    // Apply risk-based filters
    if (config.riskProfile === 'safe') {
      filters.maxAwayWins = 4;
      filters.minDraws = 2;
      filters.maxOddsBelow = 3;
    } else if (config.riskProfile === 'risky') {
      filters.minAwayWins = 2;
      filters.maxDraws = 6;
    }

    return filters;
  }

  /**
   * Analyze the generated system
   */
  private analyzeGeneratedSystem(
    rows: EnhancedRow[],
    kellyAnalysis: any,
    marketAnalysis: any,
    patternAnalysis: any,
    config: EnhancedGeneratorConfig
  ): SystemAnalysis {
    const totalExpectedValue = rows.reduce((sum, row) => sum + (row.expectedPayout - 1), 0);
    const avgConfidence = rows.reduce((sum, row) => sum + row.expectedCorrect, 0) / (rows.length * 13);
    const avgIntelligenceScore = rows.reduce((sum, row) => sum + (row.intelligenceScore || 0), 0) / rows.length;

    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Generate recommendations based on analysis
    if (totalExpectedValue > 0) {
      recommendations.push(`System shows positive expected value of ${totalExpectedValue.toFixed(2)}`);
    } else {
      warnings.push(`System shows negative expected value of ${totalExpectedValue.toFixed(2)}`);
    }

    if (avgConfidence > 0.6) {
      recommendations.push('High confidence system based on strong pattern recognition');
    } else if (avgConfidence < 0.4) {
      warnings.push('Low confidence system - consider reducing stake or changing strategy');
    }

    if (avgIntelligenceScore > 0.5) {
      recommendations.push('Strong market intelligence coverage - good system foundation');
    }

    if (marketAnalysis && marketAnalysis.overallEfficiency < 0.7) {
      recommendations.push('Market inefficiencies detected - good betting environment');
    }

    return {
      totalExpectedValue,
      avgConfidence,
      riskScore: this.calculateRiskScore(rows),
      diversificationScore: this.calculateDiversificationScore(rows),
      marketIntelligenceScore: avgIntelligenceScore,
      patternStrength: patternAnalysis?.overallPatternStrength || 0,
      kellyOptimization: rows.filter(row => row.kellyOptimal).length / rows.length,
      recommendations,
      warnings
    };
  }

  /**
   * Calculate risk score for the system
   */
  private calculateRiskScore(rows: EnhancedRow[]): number {
    let totalRisk = 0;
    
    for (const row of rows) {
      // Higher expected payout = higher risk
      const payoutRisk = Math.log(row.expectedPayout) / 10;
      // Lower confidence = higher risk  
      const confidenceRisk = (1 - row.expectedCorrect / 13) * 0.5;
      
      totalRisk += payoutRisk + confidenceRisk;
    }
    
    return totalRisk / rows.length;
  }

  /**
   * Calculate diversification score
   */
  private calculateDiversificationScore(rows: EnhancedRow[]): number {
    if (rows.length < 2) return 1;
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < rows.length - 1; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        let identicalOutcomes = 0;
        for (let k = 0; k < rows[i].outcomes.length; k++) {
          if (rows[i].outcomes[k] === rows[j].outcomes[k]) {
            identicalOutcomes++;
          }
        }
        totalSimilarity += identicalOutcomes / rows[i].outcomes.length;
        comparisons++;
      }
    }
    
    const avgSimilarity = totalSimilarity / comparisons;
    return 1 - avgSimilarity; // Higher score = more diversified
  }
}

interface MatchRecommendation {
  matchId: string;
  primaryOutcome: Outcome;
  confidence: number;
  alternatives: Outcome[];
  reasoning: string[];
  riskLevel: 'low' | 'medium' | 'high';
  intelligenceScore: number;
}