// Core data types for the Stryktipset generator

export interface Match {
  matchId: string;
  home: string;
  away: string;
  kickoff: string;
}

export interface MatchOdds {
  matchId: string;
  odds: {
    home: number;   // 1
    draw: number;   // X  
    away: number;   // 2
  };
  probabilities: {
    home: number;
    draw: number;
    away: number;
  };
}

export interface MatchWithOdds extends Match {
  odds: MatchOdds['odds'];
  probabilities: MatchOdds['probabilities'];
  oddsAnalysis?: {
    bookmakerCount: number;
    bestOdds: {
      home: { odds: number; bookmaker: string };
      draw: { odds: number; bookmaker: string };
      away: { odds: number; bookmaker: string };
    };
    oddsSpread: {
      home: number;
      draw: number;
      away: number;
    };
  };
  // Svenska Spel intelligence data
  svenskaSpelData?: {
    svenskaFolket?: {
      home: number;    // % of Swedish people betting on home
      draw: number;    // % betting on draw
      away: number;    // % betting on away
      date?: string;
    };
    expertTips?: {
      home: number;    // Number of expert tips for home
      draw: number;    // Number for draw
      away: number;    // Number for away
    };
    betMetrics?: {
      distributionDate?: string;
      eventType?: string;
      eventSubType?: string;
    };
    league?: string;
    matchStatus?: string;
  };
}

export type Outcome = '1' | 'X' | '2';

export interface GeneratedRow {
  id: string;
  outcomes: Outcome[];
  expectedCorrect: number;
  expectedPayout: number;
  riskProfile: RiskProfile;
  filters: RowFilters;
  createdAt: string;
}

export type RiskProfile = 'safe' | 'balanced' | 'risky';

export interface RowFilters {
  minDraws?: number;
  maxDraws?: number;
  maxAwayWins?: number;
  minAwayWins?: number;
  maxFavorites?: number;
  personalBiases?: Array<{
    matchId: string;
    outcome: Outcome;
  }>;
  maxOddsBelow?: number; // e.g., no more than 3 odds below 1.40
}

export interface SimulationResult {
  rowId: string;
  correctResults: {
    exactly10: number;
    exactly11: number;
    exactly12: number;
    exactly13: number;
    atLeast10: number;
    atLeast11: number;
    atLeast12: number;
    atLeast13: number;
  };
  averageCorrect: number;
  expectedPayout: number;
  iterations: number;
  confidenceIntervals?: {
    averageCorrect: { lower: number; upper: number };
    expectedPayout: { lower: number; upper: number };
  };
}

export interface RiskAdjustment {
  profile: RiskProfile;
  factor: number; // -1 to 1, where -1 = ultra safe, +1 = ultra risky
}

export interface GeneratorConfig {
  riskProfile: RiskProfile;
  filters: RowFilters;
  numRows: number;
  strategy: 'weighted-random' | 'ev-based' | 'multi-row-coverage';
}

export interface StryktipsetPool {
  poolId: string;
  matches: MatchWithOdds[];
  generatedRows: GeneratedRow[];
  lastUpdated: string;
}

// Re-export system types
export * from './system';