// System History and Tracking for Anonymous Users
import type { GeneratedSystem, SystemMatch } from '$lib/types/system';
import type { MatchWithOdds, RiskProfile } from '$lib/types';

export interface SavedSystem {
  id: string;
  timestamp: string;
  riskProfile: RiskProfile;
  configuration: {
    totalRows: number;
    cost: number;
    description: string;
  };
  matches: SystemMatch[];
  originalOdds: MatchWithOdds[];
  svenskaFolketSnapshot: {
    matchId: string;
    home: number;
    draw: number;
    away: number;
  }[];
  intelligenceData?: {
    kellyValueBets: number;
    marketEfficiency: number;
    patternStrength: number;
  };
  status: 'pending' | 'completed';
  actualResults?: MatchResult[];
  profitLoss?: number;
  winPercentage?: number;
  correctPredictions?: number;
  roi?: number;
}

export interface MatchResult {
  matchId: string;
  actualOutcome: '1' | 'X' | '2';
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

export interface SystemPerformance {
  systemId: string;
  profitLoss: number;
  roi: number;
  winPercentage: number;
  riskProfile: RiskProfile;
  systemSize: string;
  generatedDate: string;
  correctPredictions: number;
  totalMatches: number;
}

export class SystemHistoryManager {
  private static readonly STORAGE_KEY = 'bongbosse_system_history';
  private static readonly MAX_SYSTEMS = 1000; // Keep up to 1000 systems

  /**
   * Save a newly generated system
   */
  static saveGeneratedSystem(
    generatedSystem: GeneratedSystem, 
    originalOdds: MatchWithOdds[],
    intelligenceData?: any
  ): string {
    const savedSystem: SavedSystem = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      riskProfile: generatedSystem.riskProfile,
      configuration: {
        totalRows: generatedSystem.configuration.totalRows,
        cost: generatedSystem.configuration.cost,
        description: generatedSystem.configuration.description
      },
      matches: generatedSystem.matches,
      originalOdds: originalOdds,
      svenskaFolketSnapshot: this.captureSwedishPeopleSnapshot(originalOdds),
      intelligenceData: intelligenceData ? {
        kellyValueBets: intelligenceData.valueBets?.length || 0,
        marketEfficiency: intelligenceData.overallEfficiency || 0,
        patternStrength: intelligenceData.patternStrength || 0
      } : undefined,
      status: 'pending'
    };

    this.addSystemToHistory(savedSystem);
    return savedSystem.id;
  }

  /**
   * Get all systems from storage
   */
  static getAllSystems(): SavedSystem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading system history:', error);
      return [];
    }
  }

  /**
   * Get systems by status
   */
  static getSystemsByStatus(status: 'pending' | 'completed'): SavedSystem[] {
    return this.getAllSystems().filter(system => system.status === status);
  }

  /**
   * Get top performing completed systems
   */
  static getTopPerformingSystems(limit: number = 3): SystemPerformance[] {
    const completedSystems = this.getSystemsByStatus('completed');
    
    return completedSystems
      .filter(system => system.profitLoss !== undefined && system.roi !== undefined)
      .map(system => ({
        systemId: system.id,
        profitLoss: system.profitLoss!,
        roi: system.roi!,
        winPercentage: system.winPercentage || 0,
        riskProfile: system.riskProfile,
        systemSize: this.getSystemSizeLabel(system.configuration.totalRows),
        generatedDate: system.timestamp,
        correctPredictions: system.correctPredictions || 0,
        totalMatches: system.matches.length
      }))
      .sort((a, b) => b.profitLoss - a.profitLoss) // Sort by profit descending
      .slice(0, limit);
  }

  /**
   * Get systems generated this week that are pending results
   */
  static getPendingSystems(): SavedSystem[] {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.getSystemsByStatus('pending')
      .filter(system => new Date(system.timestamp) > oneWeekAgo);
  }

  /**
   * Process match results for pending systems
   * This would typically be called on Monday morning
   */
  static processMatchResults(matchResults: MatchResult[]): void {
    const pendingSystems = this.getPendingSystems();
    
    for (const system of pendingSystems) {
      const systemResults = this.calculateSystemResults(system, matchResults);
      if (systemResults) {
        this.updateSystemWithResults(system.id, systemResults);
      }
    }
  }

  /**
   * Calculate if a system won and how much profit/loss
   */
  private static calculateSystemResults(
    system: SavedSystem, 
    matchResults: MatchResult[]
  ): Partial<SavedSystem> | null {
    // Check if all system matches have results
    const systemMatchIds = system.matches.map(m => m.matchId);
    const availableResults = matchResults.filter(r => systemMatchIds.includes(r.matchId));
    
    if (availableResults.length !== system.matches.length) {
      return null; // Not all results available yet
    }

    let correctPredictions = 0;
    let systemWon = false;

    // Check each generated row against actual results
    for (const row of system.matches) {
      const matchResult = availableResults.find(r => r.matchId === row.matchId);
      if (!matchResult) continue;

      // Check if the system's prediction for this match was correct
      const systemOutcome = row.systemOutcome;
      const actualOutcome = matchResult.actualOutcome;
      
      const wasCorrect = this.checkOutcomeCorrect(systemOutcome, actualOutcome);
      if (wasCorrect) {
        correctPredictions++;
      }
    }

    // Simple system win check: if 10+ correct predictions, system wins
    // In real Stryktipset, this would be more complex with payout calculations
    systemWon = correctPredictions >= 10;
    
    const profitLoss = systemWon ? 
      this.calculateActualPayout(system, correctPredictions) - system.configuration.cost :
      -system.configuration.cost;

    const roi = ((profitLoss / system.configuration.cost) * 100);
    const winPercentage = (correctPredictions / system.matches.length) * 100;

    return {
      status: 'completed' as const,
      actualResults: availableResults,
      profitLoss,
      roi,
      winPercentage,
      correctPredictions
    };
  }

  /**
   * Check if system outcome matches actual result
   */
  private static checkOutcomeCorrect(systemOutcome: string, actualOutcome: '1' | 'X' | '2'): boolean {
    switch (systemOutcome) {
      case '1': return actualOutcome === '1';
      case 'X': return actualOutcome === 'X';
      case '2': return actualOutcome === '2';
      case '1X': return actualOutcome === '1' || actualOutcome === 'X';
      case '12': return actualOutcome === '1' || actualOutcome === '2';
      case 'X2': return actualOutcome === 'X' || actualOutcome === '2';
      case '1X2': return true; // Always correct
      default: return false;
    }
  }

  /**
   * Calculate actual payout based on correct predictions
   * Simplified calculation - in reality this would be more complex
   */
  private static calculateActualPayout(system: SavedSystem, correctPredictions: number): number {
    // Simplified payout table
    const payoutMultipliers: Record<number, number> = {
      10: 10,   // 10 correct = 10x stake
      11: 50,   // 11 correct = 50x stake  
      12: 500,  // 12 correct = 500x stake
      13: 5000  // 13 correct = 5000x stake
    };

    const multiplier = payoutMultipliers[correctPredictions] || 0;
    return system.configuration.cost * multiplier;
  }

  /**
   * Update system with calculated results
   */
  private static updateSystemWithResults(systemId: string, results: Partial<SavedSystem>): void {
    const systems = this.getAllSystems();
    const systemIndex = systems.findIndex(s => s.id === systemId);
    
    if (systemIndex !== -1) {
      systems[systemIndex] = { ...systems[systemIndex], ...results };
      this.saveAllSystems(systems);
    }
  }

  /**
   * Add new system to history
   */
  private static addSystemToHistory(system: SavedSystem): void {
    const systems = this.getAllSystems();
    systems.unshift(system); // Add to beginning

    // Cleanup old systems if exceeding limit
    if (systems.length > this.MAX_SYSTEMS) {
      systems.splice(this.MAX_SYSTEMS);
    }

    this.saveAllSystems(systems);
  }

  /**
   * Save all systems to storage
   */
  private static saveAllSystems(systems: SavedSystem[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(systems));
    } catch (error) {
      console.error('Error saving system history:', error);
    }
  }

  /**
   * Capture Swedish people betting percentages at generation time
   */
  private static captureSwedishPeopleSnapshot(matches: MatchWithOdds[]) {
    return matches.map(match => ({
      matchId: match.matchId,
      home: match.svenskaSpelData?.svenskaFolket?.home || 0,
      draw: match.svenskaSpelData?.svenskaFolket?.draw || 0,
      away: match.svenskaSpelData?.svenskaFolket?.away || 0
    }));
  }

  /**
   * Get system size label
   */
  private static getSystemSizeLabel(totalRows: number): string {
    if (totalRows <= 32) return 'Litet system';
    if (totalRows <= 96) return 'Mellansystem';
    if (totalRows <= 256) return 'Stort system';
    return 'Extra stort system';
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats() {
    const completedSystems = this.getSystemsByStatus('completed');
    
    if (completedSystems.length === 0) {
      return {
        totalSystems: 0,
        averageROI: 0,
        winRate: 0,
        totalProfit: 0
      };
    }

    const totalProfit = completedSystems.reduce((sum, system) => sum + (system.profitLoss || 0), 0);
    const averageROI = completedSystems.reduce((sum, system) => sum + (system.roi || 0), 0) / completedSystems.length;
    const winners = completedSystems.filter(system => (system.profitLoss || 0) > 0).length;
    const winRate = (winners / completedSystems.length) * 100;

    return {
      totalSystems: completedSystems.length,
      averageROI: Math.round(averageROI * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
      totalProfit: Math.round(totalProfit)
    };
  }

  /**
   * Check if system generation is available (Thursday-Saturday)
   */
  static isGenerationAvailable(): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, etc.
    
    // Available: Thursday (4), Friday (5), Saturday until 2:30 PM (6)
    if (dayOfWeek === 4 || dayOfWeek === 5) {
      return true;
    }
    
    if (dayOfWeek === 6) {
      const hour = now.getHours();
      const minute = now.getMinutes();
      return hour < 14 || (hour === 14 && minute <= 30);
    }
    
    return false;
  }

  /**
   * Mock function to simulate processing weekend results
   * In production, this would fetch from Svenska Spel API
   */
  static simulateWeekendResults(): void {
    console.log('Processing weekend results...');
    
    // This would fetch real results from Svenska Spel API
    const mockResults: MatchResult[] = [
      { matchId: 'match-1', actualOutcome: '1', homeTeam: 'Team A', awayTeam: 'Team B', homeScore: 2, awayScore: 1 },
      { matchId: 'match-2', actualOutcome: 'X', homeTeam: 'Team C', awayTeam: 'Team D', homeScore: 1, awayScore: 1 },
      // ... more results
    ];

    this.processMatchResults(mockResults);
    console.log('Weekend results processed!');
  }
}