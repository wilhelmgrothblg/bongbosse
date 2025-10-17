// Pattern Recognition System for Stryktipset
// Analyzes historical patterns, team form, and predictive indicators

import type { MatchWithOdds, Outcome } from '$lib/types';

export interface TeamForm {
  teamName: string;
  recentForm: FormEntry[];
  homeForm: FormEntry[];
  awayForm: FormEntry[];
  avgGoalsScored: number;
  avgGoalsConceded: number;
  winPercentage: number;
  formTrend: 'improving' | 'declining' | 'stable';
}

export interface FormEntry {
  date: string;
  opponent: string;
  result: 'W' | 'D' | 'L';
  goalsFor: number;
  goalsAgainst: number;
  wasHome: boolean;
}

export interface HeadToHeadPattern {
  homeTeam: string;
  awayTeam: string;
  historicalMeetings: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  avgGoalsHome: number;
  avgGoalsAway: number;
  pattern: 'home-dominated' | 'away-dominated' | 'draw-heavy' | 'balanced';
  lastMeetings: FormEntry[];
}

export interface SeasonalPattern {
  pattern: 'early-season' | 'mid-season' | 'late-season';
  historicalTrend: string;
  affectedOutcomes: Outcome[];
  strength: number; // 0-1 scale
  description: string;
}

export interface MatchPattern {
  matchId: string;
  primaryPattern: string;
  confidence: number;
  supportingFactors: string[];
  contradictingFactors: string[];
  historicalSuccessRate: number;
  recommendedOutcome: Outcome;
  alternativeOutcomes: Outcome[];
}

export interface PatternAnalysisResult {
  teamForms: TeamForm[];
  headToHeadPatterns: HeadToHeadPattern[];
  seasonalPatterns: SeasonalPattern[];
  matchPatterns: MatchPattern[];
  overallPatternStrength: number;
  patternConsistency: number;
}

export class PatternRecognizer {
  private historicalData: Map<string, any> = new Map();
  private seasonalCache: Map<string, SeasonalPattern[]> = new Map();

  /**
   * Analyze patterns across all matches
   */
  analyzePatterns(matches: MatchWithOdds[]): PatternAnalysisResult {
    const teamForms = this.analyzeTeamForms(matches);
    const headToHeadPatterns = this.analyzeHeadToHead(matches);
    const seasonalPatterns = this.analyzeSeasonalPatterns();
    const matchPatterns = this.identifyMatchPatterns(matches, teamForms, headToHeadPatterns);

    return {
      teamForms,
      headToHeadPatterns,
      seasonalPatterns,
      matchPatterns,
      overallPatternStrength: this.calculateOverallPatternStrength(matchPatterns),
      patternConsistency: this.calculatePatternConsistency(matchPatterns)
    };
  }

  /**
   * Analyze team forms and trends
   */
  private analyzeTeamForms(matches: MatchWithOdds[]): TeamForm[] {
    const teams = new Set<string>();
    matches.forEach(match => {
      teams.add(match.home);
      teams.add(match.away);
    });

    const teamForms: TeamForm[] = [];

    for (const team of teams) {
      const form = this.calculateTeamForm(team);
      if (form) {
        teamForms.push(form);
      }
    }

    return teamForms.sort((a, b) => b.winPercentage - a.winPercentage);
  }

  /**
   * Analyze head-to-head patterns
   */
  private analyzeHeadToHead(matches: MatchWithOdds[]): HeadToHeadPattern[] {
    const patterns: HeadToHeadPattern[] = [];

    for (const match of matches) {
      const h2h = this.getHeadToHeadData(match.home, match.away);
      if (h2h) {
        patterns.push(h2h);
      }
    }

    return patterns;
  }

  /**
   * Analyze seasonal patterns
   */
  private analyzeSeasonalPatterns(): SeasonalPattern[] {
    const currentMonth = new Date().getMonth() + 1;
    let seasonPhase: 'early-season' | 'mid-season' | 'late-season';

    if (currentMonth >= 3 && currentMonth <= 5) {
      seasonPhase = 'early-season';
    } else if (currentMonth >= 6 && currentMonth <= 9) {
      seasonPhase = 'mid-season';
    } else {
      seasonPhase = 'late-season';
    }

    return this.getSeasonalPatterns(seasonPhase);
  }

  /**
   * Identify patterns for individual matches
   */
  private identifyMatchPatterns(
    matches: MatchWithOdds[], 
    teamForms: TeamForm[], 
    headToHeadPatterns: HeadToHeadPattern[]
  ): MatchPattern[] {
    const patterns: MatchPattern[] = [];

    for (const match of matches) {
      const homeForm = teamForms.find(tf => tf.teamName === match.home);
      const awayForm = teamForms.find(tf => tf.teamName === match.away);
      const h2h = headToHeadPatterns.find(p => p.homeTeam === match.home && p.awayTeam === match.away);

      const pattern = this.analyzeIndividualMatch(match, homeForm, awayForm, h2h);
      patterns.push(pattern);
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate team form data
   */
  private calculateTeamForm(teamName: string): TeamForm | null {
    const historicalData = this.getTeamHistoricalData(teamName);
    if (!historicalData || historicalData.length < 5) return null;

    const recentGames = historicalData.slice(-10);
    const homeGames = historicalData.filter(game => game.wasHome);
    const awayGames = historicalData.filter(game => !game.wasHome);

    const wins = recentGames.filter(game => game.result === 'W').length;
    const winPercentage = wins / recentGames.length;

    const avgGoalsScored = recentGames.reduce((sum, game) => sum + game.goalsFor, 0) / recentGames.length;
    const avgGoalsConceded = recentGames.reduce((sum, game) => sum + game.goalsAgainst, 0) / recentGames.length;

    return {
      teamName,
      recentForm: recentGames,
      homeForm: homeGames.slice(-5),
      awayForm: awayGames.slice(-5),
      avgGoalsScored,
      avgGoalsConceded,
      winPercentage,
      formTrend: this.determineFormTrend(recentGames)
    };
  }

  /**
   * Get head-to-head analysis
   */
  private getHeadToHeadData(homeTeam: string, awayTeam: string): HeadToHeadPattern | null {
    const h2hKey = `${homeTeam}_vs_${awayTeam}`;
    const historicalMeetings = this.getHistoricalMeetings(h2hKey);

    if (!historicalMeetings || historicalMeetings.length < 3) return null;

    const homeWins = historicalMeetings.filter(game => game.result === 'W' && game.wasHome).length;
    const awayWins = historicalMeetings.filter(game => game.result === 'W' && !game.wasHome).length;
    const draws = historicalMeetings.filter(game => game.result === 'D').length;

    const avgGoalsHome = historicalMeetings
      .filter(game => game.wasHome)
      .reduce((sum, game) => sum + game.goalsFor, 0) / Math.max(1, historicalMeetings.filter(g => g.wasHome).length);

    const avgGoalsAway = historicalMeetings
      .filter(game => !game.wasHome)
      .reduce((sum, game) => sum + game.goalsFor, 0) / Math.max(1, historicalMeetings.filter(g => !g.wasHome).length);

    let pattern: 'home-dominated' | 'away-dominated' | 'draw-heavy' | 'balanced';
    const total = historicalMeetings.length;
    
    if (homeWins / total > 0.6) pattern = 'home-dominated';
    else if (awayWins / total > 0.6) pattern = 'away-dominated';
    else if (draws / total > 0.4) pattern = 'draw-heavy';
    else pattern = 'balanced';

    return {
      homeTeam,
      awayTeam,
      historicalMeetings: total,
      homeWins,
      draws,
      awayWins,
      avgGoalsHome,
      avgGoalsAway,
      pattern,
      lastMeetings: historicalMeetings.slice(-5)
    };
  }

  /**
   * Analyze individual match for patterns
   */
  private analyzeIndividualMatch(
    match: MatchWithOdds,
    homeForm: TeamForm | undefined,
    awayForm: TeamForm | undefined,
    h2h: HeadToHeadPattern | undefined
  ): MatchPattern {
    const supportingFactors: string[] = [];
    const contradictingFactors: string[] = [];
    let confidence = 0.5;
    let primaryPattern = 'Insufficient data';
    let recommendedOutcome: Outcome = 'X';

    // Analyze home advantage
    if (homeForm && homeForm.winPercentage > 0.6) {
      supportingFactors.push(`${match.home} strong home form (${Math.round(homeForm.winPercentage * 100)}% wins)`);
      confidence += 0.1;
      recommendedOutcome = '1';
    }

    // Analyze away form
    if (awayForm && awayForm.winPercentage > 0.6) {
      if (recommendedOutcome === '1') {
        contradictingFactors.push(`${match.away} excellent away form (${Math.round(awayForm.winPercentage * 100)}% wins)`);
        confidence -= 0.05;
        recommendedOutcome = 'X'; // Conflicting signals suggest draw
      } else {
        supportingFactors.push(`${match.away} strong away form`);
        confidence += 0.1;
        recommendedOutcome = '2';
      }
    }

    // Analyze head-to-head patterns
    if (h2h) {
      switch (h2h.pattern) {
        case 'home-dominated':
          if (recommendedOutcome !== '2') {
            supportingFactors.push(`Historical home dominance (${h2h.homeWins}/${h2h.historicalMeetings} wins)`);
            confidence += 0.15;
            recommendedOutcome = '1';
            primaryPattern = 'Historical home dominance';
          } else {
            contradictingFactors.push('History favors home team');
            confidence -= 0.1;
          }
          break;
        case 'away-dominated':
          supportingFactors.push(`Historical away dominance (${h2h.awayWins}/${h2h.historicalMeetings} wins)`);
          confidence += 0.15;
          recommendedOutcome = '2';
          primaryPattern = 'Historical away dominance';
          break;
        case 'draw-heavy':
          supportingFactors.push(`Draw-heavy fixture (${h2h.draws}/${h2h.historicalMeetings} draws)`);
          confidence += 0.1;
          recommendedOutcome = 'X';
          primaryPattern = 'Draw-heavy fixture';
          break;
      }
    }

    // Form trend analysis
    if (homeForm && awayForm) {
      if (homeForm.formTrend === 'improving' && awayForm.formTrend === 'declining') {
        supportingFactors.push('Positive form trend differential');
        confidence += 0.1;
        if (recommendedOutcome === 'X') recommendedOutcome = '1';
      } else if (homeForm.formTrend === 'declining' && awayForm.formTrend === 'improving') {
        supportingFactors.push('Negative form trend differential');
        confidence += 0.1;
        if (recommendedOutcome === 'X') recommendedOutcome = '2';
      }
    }

    // Goal scoring patterns
    if (homeForm && awayForm) {
      const homeOffense = homeForm.avgGoalsScored;
      const awayDefense = awayForm.avgGoalsConceded;
      const awayOffense = awayForm.avgGoalsScored;
      const homeDefense = homeForm.avgGoalsConceded;

      if (homeOffense > awayDefense + 0.5) {
        supportingFactors.push('Home team attacking strength vs away defense');
        confidence += 0.05;
      }

      if (awayOffense > homeDefense + 0.5) {
        supportingFactors.push('Away team attacking strength vs home defense');
        confidence += 0.05;
      }
    }

    // Odds analysis for pattern confirmation
    const oddsImplyHome = 1 / match.odds.home;
    const oddsImplyDraw = 1 / match.odds.draw;
    const oddsImplyAway = 1 / match.odds.away;

    if (recommendedOutcome === '1' && oddsImplyHome < 0.4) {
      contradictingFactors.push('Market heavily favors home team');
      confidence -= 0.1;
    }

    if (recommendedOutcome === '2' && oddsImplyAway < 0.3) {
      contradictingFactors.push('Market heavily favors away team');
      confidence -= 0.1;
    }

    // Set primary pattern if not already set
    if (primaryPattern === 'Insufficient data') {
      if (supportingFactors.length > contradictingFactors.length) {
        primaryPattern = 'Form-based prediction';
      } else {
        primaryPattern = 'Conflicting signals';
      }
    }

    const alternativeOutcomes: Outcome[] = [];
    if (recommendedOutcome !== '1') alternativeOutcomes.push('1');
    if (recommendedOutcome !== 'X') alternativeOutcomes.push('X');
    if (recommendedOutcome !== '2') alternativeOutcomes.push('2');

    return {
      matchId: match.matchId,
      primaryPattern,
      confidence: Math.max(0.1, Math.min(0.95, confidence)),
      supportingFactors,
      contradictingFactors,
      historicalSuccessRate: this.calculateHistoricalSuccessRate(primaryPattern),
      recommendedOutcome,
      alternativeOutcomes
    };
  }

  /**
   * Helper methods
   */
  private determineFormTrend(recentGames: FormEntry[]): 'improving' | 'declining' | 'stable' {
    if (recentGames.length < 6) return 'stable';

    const firstHalf = recentGames.slice(0, Math.floor(recentGames.length / 2));
    const secondHalf = recentGames.slice(Math.floor(recentGames.length / 2));

    const firstHalfWins = firstHalf.filter(game => game.result === 'W').length / firstHalf.length;
    const secondHalfWins = secondHalf.filter(game => game.result === 'W').length / secondHalf.length;

    const difference = secondHalfWins - firstHalfWins;

    if (difference > 0.2) return 'improving';
    if (difference < -0.2) return 'declining';
    return 'stable';
  }

  private getSeasonalPatterns(phase: 'early-season' | 'mid-season' | 'late-season'): SeasonalPattern[] {
    const cached = this.seasonalCache.get(phase);
    if (cached) return cached;

    const patterns: SeasonalPattern[] = [];

    switch (phase) {
      case 'early-season':
        patterns.push({
          pattern: 'early-season',
          historicalTrend: 'Home teams typically stronger',
          affectedOutcomes: ['1'],
          strength: 0.15,
          description: 'Teams still adapting to new season, home advantage pronounced'
        });
        break;
      case 'mid-season':
        patterns.push({
          pattern: 'mid-season',
          historicalTrend: 'More predictable outcomes',
          affectedOutcomes: ['1', '2'],
          strength: 0.25,
          description: 'Form becomes more reliable, fewer surprises'
        });
        break;
      case 'late-season':
        patterns.push({
          pattern: 'late-season',
          historicalTrend: 'Increased draw rate',
          affectedOutcomes: ['X'],
          strength: 0.2,
          description: 'Teams with nothing to play for, fatigue factor'
        });
        break;
    }

    this.seasonalCache.set(phase, patterns);
    return patterns;
  }

  private calculateOverallPatternStrength(patterns: MatchPattern[]): number {
    if (patterns.length === 0) return 0;
    return patterns.reduce((sum, pattern) => sum + pattern.confidence, 0) / patterns.length;
  }

  private calculatePatternConsistency(patterns: MatchPattern[]): number {
    if (patterns.length === 0) return 0;
    
    const avgConfidence = this.calculateOverallPatternStrength(patterns);
    const variance = patterns.reduce((sum, pattern) => 
      sum + Math.pow(pattern.confidence - avgConfidence, 2), 0) / patterns.length;
    
    return 1 - Math.min(1, variance * 4); // Convert variance to consistency score
  }

  private calculateHistoricalSuccessRate(patternType: string): number {
    // In a real implementation, this would query historical performance
    const successRates: Record<string, number> = {
      'Historical home dominance': 0.75,
      'Historical away dominance': 0.70,
      'Draw-heavy fixture': 0.65,
      'Form-based prediction': 0.60,
      'Conflicting signals': 0.45,
      'Insufficient data': 0.33
    };

    return successRates[patternType] || 0.50;
  }

  private getTeamHistoricalData(teamName: string): FormEntry[] {
    // In a real implementation, this would fetch from database
    // For now, return mock data
    const key = `team_${teamName}`;
    return this.historicalData.get(key) || this.generateMockTeamData(teamName);
  }

  private getHistoricalMeetings(h2hKey: string): FormEntry[] {
    // In a real implementation, this would fetch from database
    return this.historicalData.get(h2hKey) || [];
  }

  private generateMockTeamData(teamName: string): FormEntry[] {
    // Generate some realistic mock data for demonstration
    const games: FormEntry[] = [];
    const opponents = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'];
    
    for (let i = 0; i < 10; i++) {
      const wasHome = Math.random() > 0.5;
      const goalsFor = Math.floor(Math.random() * 4);
      const goalsAgainst = Math.floor(Math.random() * 3);
      
      let result: 'W' | 'D' | 'L';
      if (goalsFor > goalsAgainst) result = 'W';
      else if (goalsFor === goalsAgainst) result = 'D';
      else result = 'L';

      games.push({
        date: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        opponent: opponents[Math.floor(Math.random() * opponents.length)],
        result,
        goalsFor,
        goalsAgainst,
        wasHome
      });
    }

    this.historicalData.set(`team_${teamName}`, games);
    return games;
  }
}