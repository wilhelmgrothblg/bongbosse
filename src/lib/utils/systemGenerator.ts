import type { 
  MatchWithOdds, 
  RiskProfile,
  Outcome,
  GeneratedRow
} from '../types';
import type { 
  SystemMatch, 
  SystemConfiguration, 
  GeneratedSystem, 
  SystemOutcome
} from '../types/system';
import { SYSTEM_PRESETS } from '../types/system';
import { adjustMatchProbabilities } from './odds';
import { generateIntelligentPicks, analyzeMatch } from './footballIntelligence';

/**
 * Generate a Stryktipset system with combinations
 */
export function generateSystem(
  matches: MatchWithOdds[],
  systemConfig: SystemConfiguration,
  riskProfile: RiskProfile
): GeneratedSystem {
  const config = systemConfig;
  
  // Select which matches get which system outcomes
  const systemMatches = selectSystemOutcomes(matches, config, riskProfile);
  
  // Generate all possible rows from the system
  const allRows = generateAllSystemRows(systemMatches, riskProfile);
  
  // Calculate system metrics
  const expectedCorrect = calculateSystemExpectedCorrect(allRows);
  const expectedPayout = calculateSystemExpectedPayout(allRows);
  
  return {
    id: generateSystemId(),
    matches: systemMatches,
    configuration: config,
    allRows,
    expectedCorrect,
    expectedPayout,
    riskProfile,
    createdAt: new Date().toISOString()
  };
}

/**
 * Select which matches get halves, fulls, or singles based on probabilities and risk profile
 */
/**
 * Select which matches get halves, fulls, or singles using football intelligence
 */
function selectSystemOutcomes(
  matches: MatchWithOdds[],
  config: SystemConfiguration,
  riskProfile: RiskProfile
): SystemMatch[] {
  console.log(`🎯 Generating INTELLIGENT system with risk profile: ${riskProfile}`);
  
  // Use football intelligence to analyze all matches
  const matchAnalyses = matches.map(analyzeMatch);
  
  // Log some intelligence data
  matchAnalyses.slice(0, 3).forEach((analysis, i) => {
    const { match, scores, recommendations } = analysis;
    console.log(`🧠 Match ${i+1} (${match.home} vs ${match.away}):`);
    console.log(`   Intelligence: Value=${(scores.valueScore*100).toFixed(0)}% | Uncertainty=${(scores.uncertaintyScore*100).toFixed(0)}% | Public=${(scores.publicSentiment*100).toFixed(0)}%`);
    console.log(`   Svenska Folket: ${match.svenskaSpelData?.svenskaFolket?.home}%/${match.svenskaSpelData?.svenskaFolket?.draw}%/${match.svenskaSpelData?.svenskaFolket?.away}%`);
    console.log(`   Recommendations: Safe=${recommendations.safePick} | Value=${recommendations.valuePick} | Contrarian=${recommendations.contrarian}`);
  });

  // Sort matches by strategic value for system play
  // High uncertainty + high value = good for halves/fulls
  // Low uncertainty + high confidence = good for singles
  const strategicMatches = matchAnalyses.map((analysis, index) => ({
    ...analysis,
    index,
    strategicValue: analysis.scores.uncertaintyScore * 0.6 + analysis.scores.valueScore * 0.4
  }));

  // Sort by strategic value for system assignments (highest strategic value gets halves/fulls)
  strategicMatches.sort((a, b) => b.strategicValue - a.strategicValue);
  
  // Add randomization based on risk profile
  if (riskProfile === 'risky') {
    // EXTREME randomization - add complete chaos to strategic ordering
    console.log('🎲 Risky profile: Applying EXTREME randomization to match assignments');
    
    // First, add random noise to strategic values
    strategicMatches.forEach(match => {
      const noise = (Math.random() - 0.5) * 0.8; // ±40% noise
      match.strategicValue += noise;
    });
    
    // Re-sort with the noise
    strategicMatches.sort((a, b) => b.strategicValue - a.strategicValue);
    
    // Then do multiple random swaps throughout the list
    const numSwaps = Math.floor(strategicMatches.length * (0.5 + Math.random() * 0.5)); // 50-100% of matches get swapped
    for (let i = 0; i < numSwaps; i++) {
      const idx1 = Math.floor(Math.random() * strategicMatches.length);
      const idx2 = Math.floor(Math.random() * strategicMatches.length);
      [strategicMatches[idx1], strategicMatches[idx2]] = [strategicMatches[idx2], strategicMatches[idx1]];
    }
    
    // Finally, sometimes completely reverse the order
    if (Math.random() < 0.3) {
      strategicMatches.reverse();
      console.log('🔄 Complete order reversal applied!');
    }
  } else if (riskProfile === 'balanced') {
    // Medium randomization - shuffle middle section with some probability swaps
    if (Math.random() < 0.7) { // 70% chance to add some randomization
      const stable = strategicMatches.slice(0, 4);
      const middle = strategicMatches.slice(4, 9);
      const bottom = strategicMatches.slice(9);
      
      // Partial shuffle of middle section
      for (let i = 0; i < 3; i++) {
        const idx1 = Math.floor(Math.random() * middle.length);
        const idx2 = Math.floor(Math.random() * middle.length);
        [middle[idx1], middle[idx2]] = [middle[idx2], middle[idx1]];
      }
      
      strategicMatches.splice(0, strategicMatches.length, ...stable, ...middle, ...bottom);
      console.log('� Balanced profile: Moderate randomization applied');
    }
  } else {
    console.log(`📊 Safe profile: Using deterministic strategic assignment order`);
  }

  const systemMatches: SystemMatch[] = new Array(13);
  let halvesAssigned = 0;
  let fullsAssigned = 0;

  // Assign system outcomes using football intelligence
  for (let i = 0; i < strategicMatches.length; i++) {
    const analysis = strategicMatches[i];
    const match = analysis.match;
    let systemOutcome: SystemOutcome;

    if (halvesAssigned < config.distribution.halves) {
      // Assign intelligent "half" coverage
      systemOutcome = selectIntelligentHalf(analysis, riskProfile);
      if (match.home.includes('Brighton') || match.away.includes('Brighton')) {
        console.log(`🔍 Brighton match assigned INTELLIGENT HALF: ${systemOutcome}`);
        console.log(`   Analysis: Value=${(analysis.scores.valueScore*100).toFixed(0)}% | Contrarian=${(analysis.scores.contrarian*100).toFixed(0)}% | Public=${analysis.match.svenskaSpelData?.svenskaFolket?.home}%/${analysis.match.svenskaSpelData?.svenskaFolket?.draw}%/${analysis.match.svenskaSpelData?.svenskaFolket?.away}%`);
      }
      halvesAssigned++;
    } else if (fullsAssigned < config.distribution.fulls) {
      // Assign full coverage for high uncertainty matches
      systemOutcome = '1X2';
      if (match.home.includes('Brighton') || match.away.includes('Brighton')) {
        console.log(`🔍 Brighton match assigned FULL: ${systemOutcome} (high uncertainty)`);
      }
      fullsAssigned++;
    } else {
      // Assign intelligent single outcome
      systemOutcome = selectIntelligentSingle(analysis, riskProfile);
      if (match.home.includes('Brighton') || match.away.includes('Brighton')) {
        console.log(`🔍 Brighton match assigned INTELLIGENT SINGLE: ${systemOutcome}`);
        console.log(`   Reasoning: Safe=${analysis.recommendations.safePick} | Value=${analysis.recommendations.valuePick} | Confidence=${(analysis.recommendations.confidence*100).toFixed(0)}%`);
      }
    }

    systemMatches[analysis.index] = {
      ...match,
      systemOutcome
    };
  }

  return systemMatches;
}

/**
 * Select intelligent half coverage using football analysis
 */
function selectIntelligentHalf(
  analysis: ReturnType<typeof analyzeMatch>,
  riskProfile: RiskProfile
): '1X' | '12' | 'X2' {
  const { scores, recommendations } = analysis;
  const { home, draw, away } = analysis.match.probabilities;
  
  if (riskProfile === 'safe') {
    // Safe: Use expert consensus and pick safest combination
    const safePick = recommendations.safePick;
    if (safePick === '1') return draw > away ? '1X' : '12';
    if (safePick === 'X') return home > away ? '1X' : 'X2';
    return home > draw ? '12' : 'X2';
  } else if (riskProfile === 'risky') {
    // Risky: Use contrarian approach or value-based decisions with heavy randomization
    const useContrarian = Math.random() < (scores.contrarian * 0.8 + 0.2); // 20-100% chance based on contrarian score
    
    if (useContrarian) {
      // Include the contrarian pick in the combination with random secondary choice
      const contrarianPick = recommendations.contrarian;
      const randomFactor = Math.random();
      
      if (contrarianPick === '1') {
        return randomFactor < 0.33 ? '1X' : (randomFactor < 0.66 ? '12' : (draw > away ? '1X' : '12'));
      }
      if (contrarianPick === 'X') {
        return randomFactor < 0.33 ? '1X' : (randomFactor < 0.66 ? 'X2' : (home > away ? '1X' : 'X2'));
      }
      return randomFactor < 0.33 ? '12' : (randomFactor < 0.66 ? 'X2' : (home > draw ? '12' : 'X2'));
    } else {
      // Use value pick as base but add randomness
      const valuePick = recommendations.valuePick;
      const randomChoice = Math.random();
      
      if (valuePick === '1') {
        return randomChoice < 0.6 ? (draw > away ? '1X' : '12') : (randomChoice < 0.8 ? '1X' : '12');
      }
      if (valuePick === 'X') {
        return randomChoice < 0.6 ? (home > away ? '1X' : 'X2') : (randomChoice < 0.8 ? '1X' : 'X2');
      }
      return randomChoice < 0.6 ? (home > draw ? '12' : 'X2') : (randomChoice < 0.8 ? '12' : 'X2');
    }
  } else {
    // Balanced: Mix of safe and value approaches
    const useSafe = recommendations.confidence > 0.7;
    const basePick = useSafe ? recommendations.safePick : recommendations.valuePick;
    
    if (basePick === '1') return draw > away ? '1X' : '12';
    if (basePick === 'X') return home > away ? '1X' : 'X2';
    return home > draw ? '12' : 'X2';
  }
}

/**
 * Select intelligent single outcome using football analysis
 */
function selectIntelligentSingle(
  analysis: ReturnType<typeof analyzeMatch>,
  riskProfile: RiskProfile
): '1' | 'X' | '2' {
  const { recommendations, scores } = analysis;
  
  if (riskProfile === 'safe') {
    return recommendations.safePick;
  } else if (riskProfile === 'risky') {
    // Risky: Heavily randomized approach with multiple decision paths
    const randomFactor = Math.random();
    
    // 25% chance to completely ignore all analysis and pick randomly
    if (randomFactor < 0.25) {
      const outcomes: ('1' | 'X' | '2')[] = ['1', 'X', '2'];
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    }
    
    // 25% chance to be contrarian to our own analysis
    if (randomFactor < 0.5) {
      const allPicks = [recommendations.safePick, recommendations.valuePick, recommendations.contrarian];
      const uniquePicks = [...new Set(allPicks)];
      const allOutcomes: ('1' | 'X' | '2')[] = ['1', 'X', '2'];
      const otherOutcomes = allOutcomes.filter(o => !uniquePicks.includes(o));
      if (otherOutcomes.length > 0) {
        return otherOutcomes[Math.floor(Math.random() * otherOutcomes.length)];
      }
    }
    
    // Remaining 50%: Use weighted strategies but with chaos factor
    const chaosMultiplier = 0.5 + Math.random(); // 0.5 to 1.5 multiplier
    const strategies = [
      { pick: recommendations.valuePick, weight: 0.4 * chaosMultiplier },
      { pick: recommendations.contrarian, weight: 0.35 * chaosMultiplier },
      { pick: recommendations.safePick, weight: 0.25 * chaosMultiplier }
    ];
    
    // Add extra chaos based on contrarian score
    if (scores.contrarian > 0.6) {
      strategies[1].weight *= (1 + Math.random() * 0.5); // Up to 50% bonus
    }
    
    // Random shuffle of strategies 30% of the time
    if (Math.random() < 0.3) {
      for (let i = strategies.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [strategies[i], strategies[j]] = [strategies[j], strategies[i]];
      }
    }
    
    const totalWeight = strategies.reduce((sum, s) => sum + s.weight, 0);
    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    
    for (const strategy of strategies) {
      cumulativeWeight += strategy.weight;
      if (random <= cumulativeWeight) {
        return strategy.pick;
      }
    }
    
    return recommendations.valuePick; // Fallback
  } else {
    // Balanced: Choose between safe and value based on confidence
    return recommendations.confidence > 0.65 ? recommendations.safePick : recommendations.valuePick;
  }
}

/**
 * Calculate uncertainty (entropy) of a match
 */
function calculateUncertainty(probabilities: { home: number; draw: number; away: number }): number {
  const probs = [probabilities.home, probabilities.draw, probabilities.away];
  return -probs.reduce((entropy, p) => {
    return p > 0 ? entropy + p * Math.log2(p) : entropy;
  }, 0);
}

/**
 * Select the best "half" (2-outcome combination) for a match based on probabilities
 */
function selectBestHalf(
  probabilities: { home: number; draw: number; away: number },
  riskProfile: RiskProfile
): '1X' | '12' | 'X2' {
  const { home, draw, away } = probabilities;
  
  const combinations = {
    '1X': home + draw,    // Home win or Draw
    '12': home + away,    // Home win or Away win
    'X2': draw + away     // Draw or Away win
  };

  if (riskProfile === 'safe') {
    // Safe: Pick the combination with highest probability (most likely to win)
    let bestKey: '1X' | '12' | 'X2' = '1X';
    let bestProb = combinations['1X'];
    
    if (combinations['12'] > bestProb) {
      bestKey = '12';
      bestProb = combinations['12'];
    }
    if (combinations['X2'] > bestProb) {
      bestKey = 'X2';
    }
    
    return bestKey;
  } else if (riskProfile === 'balanced') {
    // Balanced: Exclude the least likely single outcome (intelligent coverage)
    const minProb = Math.min(home, draw, away);
    if (minProb === home) return 'X2';   // Exclude home, cover draw + away
    if (minProb === draw) return '12';   // Exclude draw, cover home + away  
    return '1X';                         // Exclude away, cover home + draw
  } else {
    // Risky: Prefer combinations that include underdogs or have better payout potential
    // Add randomization to make it non-deterministic
    const minProb = Math.min(home, draw, away);
    const maxProb = Math.max(home, draw, away);
    
    // 40% chance to include the underdog, 60% chance to use contrarian logic
    if (Math.random() < 0.4) {
      // Include the biggest underdog if it's not hopeless
      if (minProb === home && home > 0.15) return '1X';
      if (minProb === draw && draw > 0.15) return '1X';
      if (minProb === away && away > 0.15) return 'X2';
    }
    
    // Contrarian approach: exclude the favorite sometimes
    if (maxProb === home) return Math.random() < 0.5 ? 'X2' : '1X';
    if (maxProb === draw) return Math.random() < 0.5 ? '12' : '1X';
    return Math.random() < 0.5 ? '12' : 'X2';
  }
}

/**
 * Select the most likely single outcome based on risk profile
 */
function selectMostLikely(
  probabilities: { home: number; draw: number; away: number },
  riskProfile: RiskProfile = 'balanced'
): '1' | 'X' | '2' {
  const { home, draw, away } = probabilities;
  
  if (riskProfile === 'safe') {
    // Safe: Always pick the most probable outcome
    if (home >= draw && home >= away) return '1';
    if (draw >= away) return 'X';
    return '2';
  } else if (riskProfile === 'risky') {
    // Risky: Sometimes pick underdogs if they're not too unlikely
    const maxProb = Math.max(home, draw, away);
    const outcomes = [
      { outcome: '1' as const, prob: home },
      { outcome: 'X' as const, prob: draw },
      { outcome: '2' as const, prob: away }
    ];
    
    // Sort by probability desc
    outcomes.sort((a, b) => b.prob - a.prob);
    
    // 70% chance to pick favorite, 30% chance to pick second most likely if it's reasonable
    if (Math.random() < 0.7 || outcomes[1].prob < 0.15) {
      return outcomes[0].outcome;
    } else {
      return outcomes[1].outcome;
    }
  } else {
    // Balanced: Pick most likely
    if (home >= draw && home >= away) return '1';
    if (draw >= away) return 'X';
    return '2';
  }
}

/**
 * Generate all possible rows from a system configuration
 */
function generateAllSystemRows(systemMatches: SystemMatch[], riskProfile: RiskProfile): GeneratedRow[] {
  const allCombinations = generateOutcomeCombinations(systemMatches);
  
  return allCombinations.map((outcomes, index) => ({
    id: `system_row_${index}`,
    outcomes,
    expectedCorrect: calculateRowExpectedCorrect(outcomes, systemMatches),
    expectedPayout: estimateRowPayout(outcomes, systemMatches),
    riskProfile,
    filters: {}, // Systems don't use filters
    createdAt: new Date().toISOString()
  }));
}

/**
 * Generate all outcome combinations for a system
 */
function generateOutcomeCombinations(systemMatches: SystemMatch[]): Outcome[][] {
  const combinations: Outcome[][] = [[]];
  
  for (const match of systemMatches) {
    const newCombinations: Outcome[][] = [];
    const possibleOutcomes = expandSystemOutcome(match.systemOutcome);
    
    for (const combination of combinations) {
      for (const outcome of possibleOutcomes) {
        newCombinations.push([...combination, outcome]);
      }
    }
    
    combinations.length = 0;
    combinations.push(...newCombinations);
  }
  
  return combinations;
}

/**
 * Expand a system outcome to individual outcomes
 */
function expandSystemOutcome(systemOutcome: SystemOutcome): Outcome[] {
  switch (systemOutcome) {
    case '1': return ['1'];
    case 'X': return ['X'];
    case '2': return ['2'];
    case '1X': return ['1', 'X'];
    case '12': return ['1', '2'];
    case 'X2': return ['X', '2'];
    case '1X2': return ['1', 'X', '2'];
    default: return ['1']; // fallback
  }
}

/**
 * Calculate expected correct results for a single row
 */
function calculateRowExpectedCorrect(outcomes: Outcome[], systemMatches: SystemMatch[]): number {
  return outcomes.reduce((total, outcome, index) => {
    const match = systemMatches[index];
    switch (outcome) {
      case '1': return total + match.probabilities.home;
      case 'X': return total + match.probabilities.draw;
      case '2': return total + match.probabilities.away;
    }
  }, 0);
}

/**
 * Estimate payout for a single row (simplified)
 */
function estimateRowPayout(outcomes: Outcome[], systemMatches: SystemMatch[]): number {
  // This is a simplified payout model
  // Real payouts depend on total pool, number of winners, etc.
  const totalOdds = outcomes.reduce((product, outcome, index) => {
    const match = systemMatches[index];
    const odds = outcome === '1' ? match.odds.home : 
                 outcome === 'X' ? match.odds.draw : 
                 match.odds.away;
    return product * odds;
  }, 1);
  
  // Estimate based on odds and typical Stryktipset return rates
  return Math.min(totalOdds * 0.65, 100000); // Cap at reasonable maximum
}

/**
 * Calculate system-wide expected correct
 */
function calculateSystemExpectedCorrect(allRows: GeneratedRow[]): number {
  return allRows.reduce((sum, row) => sum + row.expectedCorrect, 0) / allRows.length;
}

/**
 * Calculate system-wide expected payout
 */
function calculateSystemExpectedPayout(allRows: GeneratedRow[]): number {
  return allRows.reduce((sum, row) => sum + row.expectedPayout, 0) / allRows.length;
}

/**
 * Generate unique system ID
 */
function generateSystemId(): string {
  return `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate the theoretical maximum and minimum rows for a system
 */
export function calculateSystemBounds(config: SystemConfiguration): { min: number; max: number } {
  const { halves, fulls, singles } = config.distribution;
  
  // Minimum: all halves pick 1 outcome, fulls pick 1 outcome
  const min = Math.pow(2, halves) * Math.pow(1, fulls) * Math.pow(1, singles);
  
  // Maximum: all halves pick 2 outcomes, fulls pick 3 outcomes  
  const max = Math.pow(2, halves) * Math.pow(3, fulls) * Math.pow(1, singles);
  
  return { min, max };
}

/**
 * Get human-readable description of system outcomes
 */
export function getSystemDescription(systemMatches: SystemMatch[]): string {
  const counts = {
    halves: systemMatches.filter(m => ['1X', '12', 'X2'].includes(m.systemOutcome)).length,
    fulls: systemMatches.filter(m => m.systemOutcome === '1X2').length,
    singles: systemMatches.filter(m => ['1', 'X', '2'].includes(m.systemOutcome)).length
  };
  
  const parts = [];
  if (counts.halves > 0) parts.push(`${counts.halves} halvgarderingar`);
  if (counts.fulls > 0) parts.push(`${counts.fulls} helgarderingar`);
  if (counts.singles > 0) parts.push(`${counts.singles} spikar`);
  
  return parts.join(' + ');
}