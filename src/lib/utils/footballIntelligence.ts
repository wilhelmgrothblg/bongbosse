// Advanced football betting intelligence using Svenska Spel data and statistical analysis
import type { MatchWithOdds, RiskProfile, Outcome } from '../types';

export interface MatchIntelligence {
  match: MatchWithOdds;
  scores: {
    valueScore: number;        // How good value the odds are (0-1)
    publicSentiment: number;   // How the public is betting (0-1, 0=home heavy, 0.5=balanced, 1=away heavy)
    expertConsensus: number;   // Expert agreement (0-1, higher = more consensus)
    homeAdvantage: number;     // Home field advantage factor (0-1)
    uncertaintyScore: number;  // How unpredictable the match is (0-1)
    contrarian: number;        // Contrarian opportunity score (0-1)
  };
  recommendations: {
    safePick: Outcome;
    valuePick: Outcome;
    contrarian: Outcome;
    confidence: number; // 0-1
  };
}

/**
 * Analyze a match using Svenska Spel data and football intelligence
 */
export function analyzeMatch(match: MatchWithOdds): MatchIntelligence {
  const { odds, probabilities, svenskaSpelData } = match;
  
  // Calculate value score - how good value the odds are
  const valueScore = calculateValueScore(odds, probabilities);
  
  // Public sentiment from Svenska Folket data
  const publicSentiment = calculatePublicSentiment(svenskaSpelData?.svenskaFolket);
  
  // Expert consensus from newspaper tips
  const expertConsensus = calculateExpertConsensus(svenskaSpelData?.expertTips);
  
  // Home advantage based on team names and league
  const homeAdvantage = calculateHomeAdvantage(match.home, match.away, svenskaSpelData?.league);
  
  // Uncertainty/entropy of the match
  const uncertaintyScore = calculateUncertainty(probabilities);
  
  // Contrarian opportunities (where public/experts disagree with odds)
  const contrarian = calculateContrarianScore(odds, svenskaSpelData);
  
  // Generate recommendations
  const recommendations = generateRecommendations(match, {
    valueScore,
    publicSentiment,
    expertConsensus,
    homeAdvantage,
    uncertaintyScore,
    contrarian
  });
  
  return {
    match,
    scores: {
      valueScore,
      publicSentiment,
      expertConsensus,
      homeAdvantage,
      uncertaintyScore,
      contrarian
    },
    recommendations
  };
}

/**
 * Calculate value score - how good value the odds are compared to true probability
 */
function calculateValueScore(
  odds: { home: number; draw: number; away: number },
  probabilities: { home: number; draw: number; away: number }
): number {
  // Expected value calculation for each outcome
  const homeEV = (odds.home * probabilities.home) - 1;
  const drawEV = (odds.draw * probabilities.draw) - 1;
  const awayEV = (odds.away * probabilities.away) - 1;
  
  // Take the best EV and normalize to 0-1 scale
  const bestEV = Math.max(homeEV, drawEV, awayEV);
  return Math.max(0, Math.min(1, (bestEV + 0.2) / 0.4)); // Scale to 0-1
}

/**
 * Calculate public sentiment from Svenska Folket betting percentages
 */
function calculatePublicSentiment(
  svenskaFolket?: { home: number; draw: number; away: number }
): number {
  if (!svenskaFolket) return 0.5; // Neutral if no data
  
  const total = svenskaFolket.home + svenskaFolket.draw + svenskaFolket.away;
  if (total === 0) return 0.5;
  
  // 0 = heavily home favored by public, 1 = heavily away favored
  const homeWeight = svenskaFolket.home / total;
  const awayWeight = svenskaFolket.away / total;
  
  return awayWeight / (homeWeight + awayWeight); // 0-1 scale
}

/**
 * Calculate expert consensus from newspaper tips
 */
function calculateExpertConsensus(
  expertTips?: { home: number; draw: number; away: number }
): number {
  if (!expertTips) return 0.5;
  
  const total = expertTips.home + expertTips.draw + expertTips.away;
  if (total === 0) return 0;
  
  // Higher score = more expert consensus (less disagreement)
  const maxTips = Math.max(expertTips.home, expertTips.draw, expertTips.away);
  return maxTips / total; // 0-1, higher = more consensus
}

/**
 * Calculate home advantage based on team names and league
 */
function calculateHomeAdvantage(
  homeTeam: string, 
  awayTeam: string, 
  league?: string
): number {
  let advantage = 0.6; // Base home advantage
  
  // League-specific adjustments
  if (league?.includes('Premier League')) advantage = 0.65;
  if (league?.includes('La Liga')) advantage = 0.68;
  if (league?.includes('Serie A')) advantage = 0.62;
  if (league?.includes('Bundesliga')) advantage = 0.63;
  if (league?.includes('Allsvenskan')) advantage = 0.67; // Swedish league has strong home advantage
  
  // Team-specific adjustments (big teams have less home advantage when away)
  const bigTeams = ['Manchester City', 'Arsenal', 'Liverpool', 'Real Madrid', 'Barcelona', 'Bayern München'];
  if (bigTeams.some(team => awayTeam.includes(team))) {
    advantage -= 0.1; // Big away teams reduce home advantage
  }
  
  return Math.max(0.4, Math.min(0.8, advantage));
}

/**
 * Calculate uncertainty/entropy of match outcome
 */
function calculateUncertainty(probabilities: { home: number; draw: number; away: number }): number {
  const probs = [probabilities.home, probabilities.draw, probabilities.away];
  const entropy = -probs.reduce((sum, p) => {
    return p > 0 ? sum + p * Math.log2(p) : sum;
  }, 0);
  
  return entropy / Math.log2(3); // Normalize to 0-1 (max entropy for 3 outcomes)
}

/**
 * Calculate contrarian opportunities where public disagrees with odds
 */
function calculateContrarianScore(
  odds: { home: number; draw: number; away: number },
  svenskaSpelData?: any
): number {
  if (!svenskaSpelData?.svenskaFolket) return 0;
  
  const { svenskaFolket } = svenskaSpelData;
  const total = svenskaFolket.home + svenskaFolket.draw + svenskaFolket.away;
  if (total === 0) return 0;
  
  // Convert odds to implied probabilities
  const oddsProbs = {
    home: (1 / odds.home),
    draw: (1 / odds.draw), 
    away: (1 / odds.away)
  };
  
  const oddsTotal = oddsProbs.home + oddsProbs.draw + oddsProbs.away;
  const normalizedOddsProbs = {
    home: oddsProbs.home / oddsTotal,
    draw: oddsProbs.draw / oddsTotal,
    away: oddsProbs.away / oddsTotal
  };
  
  // Convert public betting to probabilities
  const publicProbs = {
    home: svenskaFolket.home / total,
    draw: svenskaFolket.draw / total,
    away: svenskaFolket.away / total
  };
  
  // Calculate disagreement between odds and public
  const disagreement = Math.abs(normalizedOddsProbs.home - publicProbs.home) +
                      Math.abs(normalizedOddsProbs.draw - publicProbs.draw) +
                      Math.abs(normalizedOddsProbs.away - publicProbs.away);
  
  return Math.min(1, disagreement / 0.6); // Scale to 0-1
}

/**
 * Generate smart recommendations based on all intelligence factors
 */
function generateRecommendations(
  match: MatchWithOdds,
  scores: Omit<MatchIntelligence['scores'], 'contrarian'> & { contrarian: number }
): MatchIntelligence['recommendations'] {
  const { odds, probabilities } = match;
  
  // Safe pick - highest probability with good confidence
  const safePick = getSafePick(probabilities, scores.expertConsensus);
  
  // Value pick - best expected value
  const valuePick = getValuePick(odds, probabilities);
  
  // Contrarian pick - against the crowd when there's good reason
  const contrarian = getContrarianPick(odds, match.svenskaSpelData?.svenskaFolket, scores.contrarian);
  
  // Overall confidence based on multiple factors
  const confidence = calculateOverallConfidence(scores);
  
  return {
    safePick,
    valuePick,
    contrarian,
    confidence
  };
}

function getSafePick(
  probabilities: { home: number; draw: number; away: number },
  expertConsensus: number
): Outcome {
  // Weight the probabilities by expert consensus
  const weight = 0.7 + (expertConsensus * 0.3);
  
  const weightedProbs = {
    home: probabilities.home * weight,
    draw: probabilities.draw * weight,
    away: probabilities.away * weight
  };
  
  if (weightedProbs.home >= weightedProbs.draw && weightedProbs.home >= weightedProbs.away) return '1';
  if (weightedProbs.draw >= weightedProbs.away) return 'X';
  return '2';
}

function getValuePick(
  odds: { home: number; draw: number; away: number },
  probabilities: { home: number; draw: number; away: number }
): Outcome {
  const homeEV = (odds.home * probabilities.home) - 1;
  const drawEV = (odds.draw * probabilities.draw) - 1;
  const awayEV = (odds.away * probabilities.away) - 1;
  
  if (homeEV >= drawEV && homeEV >= awayEV) return '1';
  if (drawEV >= awayEV) return 'X';
  return '2';
}

function getContrarianPick(
  odds: { home: number; draw: number; away: number },
  svenskaFolket?: { home: number; draw: number; away: number },
  contrarianScore?: number
): Outcome {
  if (!svenskaFolket || !contrarianScore || contrarianScore < 0.3) {
    // If no contrarian opportunity, return value pick
    return getValuePick(odds, {
      home: 1/odds.home, 
      draw: 1/odds.draw, 
      away: 1/odds.away
    });
  }
  
  const total = svenskaFolket.home + svenskaFolket.draw + svenskaFolket.away;
  if (total === 0) return '1';
  
  // Find the least popular choice among the public
  const publicPercentages = {
    home: svenskaFolket.home / total,
    draw: svenskaFolket.draw / total,
    away: svenskaFolket.away / total
  };
  
  const minPublic = Math.min(publicPercentages.home, publicPercentages.draw, publicPercentages.away);
  
  if (publicPercentages.home === minPublic) return '1';
  if (publicPercentages.draw === minPublic) return 'X';
  return '2';
}

function calculateOverallConfidence(
  scores: Omit<MatchIntelligence['scores'], 'contrarian'> & { contrarian: number }
): number {
  // Weighted combination of different confidence factors
  const weights = {
    valueScore: 0.25,
    expertConsensus: 0.3,
    homeAdvantage: 0.15,
    uncertaintyScore: -0.2, // Lower uncertainty = higher confidence
    contrarian: 0.1
  };
  
  const confidence = 
    scores.valueScore * weights.valueScore +
    scores.expertConsensus * weights.expertConsensus +
    scores.homeAdvantage * weights.homeAdvantage +
    (1 - scores.uncertaintyScore) * Math.abs(weights.uncertaintyScore) +
    scores.contrarian * weights.contrarian;
  
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Generate intelligent system picks based on risk profile and football intelligence
 */
export function generateIntelligentPicks(
  matches: MatchWithOdds[],
  riskProfile: RiskProfile
): { match: MatchWithOdds; pick: Outcome; confidence: number; reasoning: string }[] {
  
  const matchAnalyses = matches.map(analyzeMatch);
  
  return matchAnalyses.map(analysis => {
    const { match, scores, recommendations } = analysis;
    
    let pick: Outcome;
    let reasoning: string;
    
    switch (riskProfile) {
      case 'safe':
        pick = recommendations.safePick;
        reasoning = `Safe pick based on ${(scores.expertConsensus * 100).toFixed(0)}% expert consensus`;
        break;
        
      case 'risky':
        // Randomly choose between value and contrarian based on opportunity
        const useContrarian = Math.random() < (scores.contrarian * 0.7);
        pick = useContrarian ? recommendations.contrarian : recommendations.valuePick;
        reasoning = useContrarian 
          ? `Contrarian pick against ${(scores.publicSentiment * 100).toFixed(0)}% public sentiment`
          : `Value pick with ${(scores.valueScore * 100).toFixed(0)}% value score`;
        break;
        
      default: // balanced
        // Weight between safe and value picks
        const useSafe = recommendations.confidence > 0.7 || Math.random() < 0.6;
        pick = useSafe ? recommendations.safePick : recommendations.valuePick;
        reasoning = useSafe 
          ? `Balanced safe pick (${(recommendations.confidence * 100).toFixed(0)}% confidence)`
          : `Balanced value pick`;
        break;
    }
    
    return {
      match,
      pick,
      confidence: recommendations.confidence,
      reasoning
    };
  });
}