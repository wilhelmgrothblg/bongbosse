// Mock System Data Generator for Development/Testing
import { SystemHistoryManager } from './systemHistory.js';
import type { SavedSystem, MatchResult } from './systemHistory.js';

export class MockDataGenerator {
  /**
   * Generate mock completed systems for demonstration
   */
  static generateMockCompletedSystems(): void {
    const mockSystems: SavedSystem[] = [
      {
        id: 'mock-system-1',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        riskProfile: 'balanced',
        configuration: {
          totalRows: 64,
          cost: 64,
          description: '4 halves + 1 full = 64 rows'
        },
        matches: this.generateMockMatches(13),
        originalOdds: [],
        svenskaFolketSnapshot: [],
        status: 'completed',
        profitLoss: 432,
        roi: 575.0, // 575% ROI
        winPercentage: 84.6,
        correctPredictions: 11,
        actualResults: this.generateMockResults(13, 11)
      },
      {
        id: 'mock-system-2',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        riskProfile: 'safe',
        configuration: {
          totalRows: 32,
          cost: 32,
          description: '5 singles = 32 rows'
        },
        matches: this.generateMockMatches(13),
        originalOdds: [],
        svenskaFolketSnapshot: [],
        status: 'completed',
        profitLoss: 288,
        roi: 900.0, // 900% ROI  
        winPercentage: 92.3,
        correctPredictions: 12,
        actualResults: this.generateMockResults(13, 12)
      },
      {
        id: 'mock-system-3',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        riskProfile: 'risky',
        configuration: {
          totalRows: 128,
          cost: 128,
          description: '3 halves + 2 fulls = 128 rows'
        },
        matches: this.generateMockMatches(13),
        originalOdds: [],
        svenskaFolketSnapshot: [],
        status: 'completed',
        profitLoss: -128,
        roi: -100.0, // Lost everything
        winPercentage: 69.2,
        correctPredictions: 9,
        actualResults: this.generateMockResults(13, 9)
      },
      {
        id: 'mock-system-4',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        riskProfile: 'balanced',
        configuration: {
          totalRows: 96,
          cost: 96,
          description: '5 halves + 1 full = 96 rows'
        },
        matches: this.generateMockMatches(13),
        originalOdds: [],
        svenskaFolketSnapshot: [],
        status: 'completed',
        profitLoss: 144,
        roi: 150.0, // 150% ROI
        winPercentage: 76.9,
        correctPredictions: 10,
        actualResults: this.generateMockResults(13, 10)
      },
      {
        id: 'mock-system-5',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
        riskProfile: 'safe',
        configuration: {
          totalRows: 48,
          cost: 48,
          description: '4 halves = 48 rows'
        },
        matches: this.generateMockMatches(13),
        originalOdds: [],
        svenskaFolketSnapshot: [],
        status: 'completed',
        profitLoss: -48,
        roi: -100.0, // Lost everything
        winPercentage: 61.5,
        correctPredictions: 8,
        actualResults: this.generateMockResults(13, 8)
      }
    ];

    // Save mock systems to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('bongbosse_system_history', JSON.stringify(mockSystems));
      console.log('Mock completed systems generated!');
    }
  }

  /**
   * Generate mock system matches
   */
  private static generateMockMatches(count: number) {
    const teams = [
      ['AIK', 'Hammarby'], ['IFK Göteborg', 'Malmö FF'], ['Djurgården', 'Elfsborg'],
      ['BK Häcken', 'IFK Norrköping'], ['Kalmar FF', 'Örebro SK'], ['Sirius', 'Varberg'],
      ['Degerfors', 'Helsingborg'], ['GIF Sundsvall', 'Landskrona'], ['Öster', 'Sandviken'],
      ['GAIS', 'Örgryte'], ['Trelleborg', 'Utsikten'], ['Västerås SK', 'Gefle IF'],
      ['Östersund', 'Skövde AIK']
    ];

    const outcomes = ['1', 'X', '2', '1X', '12', 'X2'] as const;

    return Array.from({ length: count }, (_, i) => ({
      matchId: `mock-match-${i + 1}`,
      home: teams[i % teams.length][0],
      away: teams[i % teams.length][1],
      kickoff: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
      odds: {
        home: 1.5 + Math.random() * 3.5,
        draw: 3.0 + Math.random() * 2.0,
        away: 1.8 + Math.random() * 4.2
      },
      probabilities: {
        home: 0.2 + Math.random() * 0.5,
        draw: 0.15 + Math.random() * 0.4,
        away: 0.2 + Math.random() * 0.5
      },
      systemOutcome: outcomes[Math.floor(Math.random() * outcomes.length)]
    }));
  }

  /**
   * Generate mock match results
   */
  private static generateMockResults(totalMatches: number, correctPredictions: number): MatchResult[] {
    const outcomes = ['1', 'X', '2'] as const;
    const teams = [
      ['AIK', 'Hammarby'], ['IFK Göteborg', 'Malmö FF'], ['Djurgården', 'Elfsborg'],
      ['BK Häcken', 'IFK Norrköping'], ['Kalmar FF', 'Örebro SK'], ['Sirius', 'Varberg'],
      ['Degerfors', 'Helsingborg'], ['GIF Sundsvall', 'Landskrona'], ['Öster', 'Sandviken'],
      ['GAIS', 'Örgryte'], ['Trelleborg', 'Utsikten'], ['Västerås SK', 'Gefle IF'],
      ['Östersund', 'Skövde AIK']
    ];

    return Array.from({ length: totalMatches }, (_, i) => {
      const homeScore = Math.floor(Math.random() * 4);
      const awayScore = Math.floor(Math.random() * 4);
      
      let actualOutcome: '1' | 'X' | '2';
      if (homeScore > awayScore) actualOutcome = '1';
      else if (homeScore === awayScore) actualOutcome = 'X';
      else actualOutcome = '2';

      return {
        matchId: `mock-match-${i + 1}`,
        actualOutcome,
        homeTeam: teams[i % teams.length][0],
        awayTeam: teams[i % teams.length][1],
        homeScore,
        awayScore
      };
    });
  }

  /**
   * Clear all mock data
   */
  static clearMockData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bongbosse_system_history');
      console.log('Mock data cleared!');
    }
  }

  /**
   * Generate mock data for current week (pending systems)
   */
  static generateMockPendingSystems(): void {
    const existingSystems = SystemHistoryManager.getAllSystems();
    
    const mockPendingSystems: SavedSystem[] = [
      {
        id: 'mock-pending-1',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        riskProfile: 'balanced',
        configuration: {
          totalRows: 64,
          cost: 64,
          description: '4 halves + 1 full = 64 rows'
        },
        matches: this.generateMockMatches(13),
        originalOdds: [],
        svenskaFolketSnapshot: [],
        status: 'pending'
      },
      {
        id: 'mock-pending-2',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        riskProfile: 'safe',
        configuration: {
          totalRows: 32,
          cost: 32,
          description: '5 singles = 32 rows'
        },
        matches: this.generateMockMatches(13),
        originalOdds: [],
        svenskaFolketSnapshot: [],
        status: 'pending'
      }
    ];

    const allSystems = [...existingSystems, ...mockPendingSystems];
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('bongbosse_system_history', JSON.stringify(allSystems));
      console.log('Mock pending systems added!');
    }
  }
}

// Auto-generate mock data in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Check if we already have mock data
  const existingData = localStorage.getItem('bongbosse_system_history');
  if (!existingData || JSON.parse(existingData).length === 0) {
    console.log('Generating mock system data for development...');
    MockDataGenerator.generateMockCompletedSystems();
    MockDataGenerator.generateMockPendingSystems();
  }
}