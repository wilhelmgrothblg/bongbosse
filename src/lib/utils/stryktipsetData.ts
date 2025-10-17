// Consistent Stryktipset data for Saturday matches
import type { MatchWithOdds } from '../types';
import { oddsToNormalizedProbabilities } from './odds';

// Fixed data for current Saturday (October 19, 2025)
const SATURDAY_DATE = '2025-10-19';

// Real European fixtures that would typically be in Stryktipset
const SATURDAY_MATCHES: Array<{
  home: string;
  away: string;
  league: string;
  kickoff: string;
  odds: { home: number; draw: number; away: number };
}> = [
  // Premier League
  {
    home: 'Arsenal',
    away: 'Chelsea',
    league: 'Premier League',
    kickoff: '2025-10-19T12:30:00Z',
    odds: { home: 2.45, draw: 3.20, away: 2.90 }
  },
  {
    home: 'Liverpool',
    away: 'Manchester City',
    league: 'Premier League', 
    kickoff: '2025-10-19T15:00:00Z',
    odds: { home: 2.80, draw: 3.40, away: 2.30 }
  },
  {
    home: 'Tottenham',
    away: 'Manchester United',
    league: 'Premier League',
    kickoff: '2025-10-19T17:30:00Z', 
    odds: { home: 2.60, draw: 3.30, away: 2.55 }
  },
  
  // La Liga
  {
    home: 'Barcelona',
    away: 'Real Madrid',
    league: 'La Liga',
    kickoff: '2025-10-19T16:00:00Z',
    odds: { home: 2.20, draw: 3.50, away: 3.10 }
  },
  {
    home: 'Atlético Madrid',
    away: 'Valencia',
    league: 'La Liga',
    kickoff: '2025-10-19T18:30:00Z',
    odds: { home: 1.85, draw: 3.60, away: 4.20 }
  },
  
  // Bundesliga
  {
    home: 'Bayern München',
    away: 'Borussia Dortmund',
    league: 'Bundesliga',
    kickoff: '2025-10-19T15:30:00Z',
    odds: { home: 1.75, draw: 3.80, away: 4.50 }
  },
  {
    home: 'RB Leipzig',
    away: 'Bayer Leverkusen',
    league: 'Bundesliga',
    kickoff: '2025-10-19T18:30:00Z',
    odds: { home: 2.40, draw: 3.25, away: 2.95 }
  },
  
  // Serie A
  {
    home: 'Juventus',
    away: 'AC Milan',
    league: 'Serie A',
    kickoff: '2025-10-19T20:45:00Z',
    odds: { home: 2.10, draw: 3.40, away: 3.30 }
  },
  {
    home: 'Inter Milan',
    away: 'AS Roma',
    league: 'Serie A',
    kickoff: '2025-10-19T18:00:00Z',
    odds: { home: 1.90, draw: 3.50, away: 3.90 }
  },
  
  // Ligue 1
  {
    home: 'PSG',
    away: 'Olympique Lyon',
    league: 'Ligue 1',
    kickoff: '2025-10-19T20:00:00Z',
    odds: { home: 1.45, draw: 4.20, away: 6.50 }
  },
  
  // Eredivisie
  {
    home: 'Ajax',
    away: 'PSV Eindhoven',
    league: 'Eredivisie',
    kickoff: '2025-10-19T16:45:00Z',
    odds: { home: 2.65, draw: 3.10, away: 2.70 }
  },
  
  // Scottish Premiership
  {
    home: 'Celtic',
    away: 'Rangers',
    league: 'Scottish Premiership',
    kickoff: '2025-10-19T15:00:00Z',
    odds: { home: 1.95, draw: 3.45, away: 3.60 }
  },
  
  // Primeira Liga
  {
    home: 'FC Porto',
    away: 'Benfica',
    league: 'Primeira Liga',
    kickoff: '2025-10-19T19:00:00Z',
    odds: { home: 2.30, draw: 3.20, away: 3.00 }
  }
];

/**
 * Get consistent Saturday Stryktipset matches
 */
export function getSaturdayStryktipsetMatches(): MatchWithOdds[] {
  return SATURDAY_MATCHES.map((match, index) => {
    const matchNumber = index + 1;
    const probabilities = oddsToNormalizedProbabilities(match.odds);
    
    return {
      matchId: `stryk_${matchNumber.toString().padStart(2, '0')}_${SATURDAY_DATE}`,
      home: match.home,
      away: match.away,
      kickoff: match.kickoff,
      odds: match.odds,
      probabilities
    };
  });
}

/**
 * Get the Saturday date for Stryktipset
 */
export function getStryktipsetSaturday(): string {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate days until next Saturday
  let daysUntilSaturday = 6 - dayOfWeek;
  if (daysUntilSaturday <= 0) {
    daysUntilSaturday += 7; // Next week's Saturday
  }
  
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  
  return saturday.toISOString().split('T')[0];
}

/**
 * Check if matches are for this coming Saturday
 */
export function isCurrentSaturday(dateString: string): boolean {
  return dateString === getStryktipsetSaturday();
}

/**
 * Get Stryktipset pool info
 */
export function getStryktipsetPoolInfo() {
  const saturdayDate = getStryktipsetSaturday();
  const closeTime = new Date(`${saturdayDate}T15:00:00Z`); // 3 PM UTC Saturday
  
  return {
    poolId: `stryktipset_${saturdayDate}`,
    name: `Stryktipset ${saturdayDate}`,
    closeTime: closeTime.toISOString(),
    matchCount: SATURDAY_MATCHES.length,
    isActive: new Date() < closeTime
  };
}

/**
 * Try to fetch real Stryktipset data from Svenska Spel API
 */
export async function tryFetchRealStryktipsetData(): Promise<MatchWithOdds[] | null> {
  try {
    console.log('� Attempting REAL Svenska Spel API...');
    
    // Import the REAL Svenska Spel API function
    const { getThisWeeksStryktipset } = await import('./realSvenskaSpelAPI');
    
    // Try to fetch THIS WEEK's real data
    const realData = await getThisWeeksStryktipset();
    if (realData && realData.length >= 13) {
      console.log('🎉 SUCCESS: Got real Svenska Spel data!');
      return realData.slice(0, 13); // Ensure exactly 13 matches
    }
    
    return null;
  } catch (error) {
    console.log('💥 Real Svenska Spel API failed:', error);
    return null;
  }
}

/**
 * Main function to get Stryktipset data (tries real Svenska Spel API first, falls back to consistent data)
 */
export async function getCurrentStryktipsetData(): Promise<{
  poolId: string;
  matches: MatchWithOdds[];
  lastUpdated: string;
  closeDateTime: string;
  source: 'real-svenska-spel-api' | 'real-football' | 'consistent-data';
}> {
  console.log('🎯 Getting current Stryktipset data...');
  
  // Try REAL Svenska Spel API first
  const realData = await tryFetchRealStryktipsetData();
  
  if (realData && realData.length >= 13) {
    const poolInfo = getStryktipsetPoolInfo();
    return {
      poolId: poolInfo.poolId,
      matches: realData,
      lastUpdated: new Date().toISOString(),
      closeDateTime: poolInfo.closeTime,
      source: 'real-svenska-spel-api'
    };
  }
  
  // Fallback to consistent Saturday data
  console.log('🔄 Falling back to consistent Saturday data');
  const matches = getSaturdayStryktipsetMatches();
  const poolInfo = getStryktipsetPoolInfo();
  
  return {
    poolId: poolInfo.poolId,
    matches,
    lastUpdated: new Date().toISOString(),
    closeDateTime: poolInfo.closeTime,
    source: 'consistent-data'
  };
}