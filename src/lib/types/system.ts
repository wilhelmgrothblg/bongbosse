// Enhanced types for Stryktipset system play
import type { Match, GeneratedRow, RiskProfile } from './index';

export type SystemOutcome = '1' | 'X' | '2' | '1X' | '12' | 'X2' | '1X2';

export interface SystemMatch extends Match {
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
  systemOutcome: SystemOutcome; // What the system selected for this match
}

export interface SystemConfiguration {
  totalRows: number;           // e.g., 96, 64, 48, 32
  cost: number;               // Total cost in SEK
  costPerRow: number;         // Always 1 SEK
  distribution: {
    halves: number;           // Number of matches with 2 outcomes (1X, 12, X2)
    fulls: number;           // Number of matches with 3 outcomes (1X2)
    singles: number;         // Number of matches with 1 outcome (1, X, or 2)
  };
  description: string;        // e.g., "5 halves + 1 full = 96 rows"
}

export interface GeneratedSystem {
  id: string;
  matches: SystemMatch[];
  configuration: SystemConfiguration;
  allRows: GeneratedRow[];    // All individual rows generated from the system
  expectedCorrect: number;    // Average expected correct across all rows
  expectedPayout: number;     // Expected payout for the system
  riskProfile: RiskProfile;
  createdAt: string;
}

export interface SystemSimulationResult {
  systemId: string;
  totalRows: number;
  cost: number;
  results: {
    // Probability of getting at least one row with X+ correct
    atLeastOneWith10Plus: number;
    atLeastOneWith11Plus: number;
    atLeastOneWith12Plus: number;
    atLeastOneWith13: number;
    
    // Expected number of rows with X+ correct
    expectedRowsWith10Plus: number;
    expectedRowsWith11Plus: number;
    expectedRowsWith12Plus: number;
    expectedRowsWith13: number;
    
    // System-wide metrics
    averageCorrectPerRow: number;
    totalExpectedPayout: number;
    returnOnInvestment: number; // Expected payout / cost
  };
  iterations: number;
}

// Predefined system configurations
export const SYSTEM_PRESETS: Record<string, SystemConfiguration> = {
  'system-96': {
    totalRows: 96,
    cost: 96,
    costPerRow: 1,
    distribution: { halves: 5, fulls: 1, singles: 7 },
    description: '5 halves + 1 full + 7 singles = 96 rows'
  },
  'system-64': {
    totalRows: 64,
    cost: 64,
    costPerRow: 1,
    distribution: { halves: 6, fulls: 0, singles: 7 },
    description: '6 halves + 7 singles = 64 rows'
  },
  'system-48': {
    totalRows: 48,
    cost: 48,
    costPerRow: 1,
    distribution: { halves: 4, fulls: 1, singles: 8 },
    description: '4 halves + 1 full + 8 singles = 48 rows'
  },
  'system-32': {
    totalRows: 32,
    cost: 32,
    costPerRow: 1,
    distribution: { halves: 5, fulls: 0, singles: 8 },
    description: '5 halves + 8 singles = 32 rows'
  }
};