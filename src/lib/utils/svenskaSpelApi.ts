// Svenska Spel API integration for Stryktipset
import type { MatchWithOdds } from '../types';
import { oddsToNormalizedProbabilities } from './odds';
import { getApiConfig, ERROR_CONFIG, type ApiErrorType } from '../config/api';

// Svenska Spel API endpoints
const SVENSKA_SPEL_BASE_URL = 'https://api.svenskaspel.se';
const STRYKTIPSET_API_URL = `${SVENSKA_SPEL_BASE_URL}/draw/1`;

// Types for Svenska Spel API responses
interface SvenskaSpelMatch {
  eventId: string;
  eventNumber: number;
  homeTeam: {
    id: string;
    name: string;
    shortName?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName?: string;
  };
  startDateTime: string;
  league?: {
    id: string;
    name: string;
  };
  odds?: {
    one?: number;    // Home win
    x?: number;      // Draw
    two?: number;    // Away win
  };
  status: string;
}

interface StryktipsetDraw {
  drawId: string;
  name: string;
  status: string;
  closeDateTime: string;
  events: SvenskaSpelMatch[];
}

interface StryktipsetResponse {
  draws: StryktipsetDraw[];
}

/**
 * Fetch current Stryktipset draw with matches
 */
export async function fetchStryktipsetMatches(): Promise<{
  poolId: string;
  matches: MatchWithOdds[];
  lastUpdated: string;
  closeDateTime?: string;
}> {
  console.log('Fetching Stryktipset data...');
  
  // Use fallback data for reliability (API has CORS restrictions)
  console.log('Using realistic mock data (API access limited due to CORS)');
  return generateMockStryktipsetData();
}

/**
 * Convert Svenska Spel match format to our internal format
 */
function convertSvenskaSpelMatch(event: SvenskaSpelMatch, matchNumber: number): MatchWithOdds {
  const matchId = event.eventId || `m${matchNumber}`;
  
  // Use provided odds or generate realistic ones
  const odds = event.odds && event.odds.one && event.odds.x && event.odds.two 
    ? {
        home: event.odds.one,
        draw: event.odds.x,
        away: event.odds.two
      }
    : generateRealisticOdds();

  const probabilities = oddsToNormalizedProbabilities(odds);

  return {
    matchId,
    home: event.homeTeam.shortName || event.homeTeam.name,
    away: event.awayTeam.shortName || event.awayTeam.name,
    kickoff: event.startDateTime,
    odds,
    probabilities
  };
}

/**
 * Generate realistic odds based on typical football patterns
 */
function generateRealisticOdds(): { home: number; draw: number; away: number } {
  // Generate odds that reflect realistic football scenarios
  const scenarios = [
    { home: 1.45, draw: 4.20, away: 6.50 }, // Strong home favorite
    { home: 2.10, draw: 3.40, away: 3.20 }, // Balanced match
    { home: 3.80, draw: 3.50, away: 1.85 }, // Away favorite
    { home: 1.65, draw: 3.80, away: 4.75 }, // Home favorite
    { home: 2.75, draw: 3.20, away: 2.45 }, // Slight away edge
    { home: 1.90, draw: 3.60, away: 3.80 }, // Slight home edge
  ];

  return scenarios[Math.floor(Math.random() * scenarios.length)];
}

/**
 * Generate a single mock match (fallback)
 */
function generateMockMatch(matchNumber: number): MatchWithOdds {
  // Mix of Swedish teams and popular European fixtures for realistic Stryktipset
  const teams = [
    ['AIK', 'Djurgården'], ['Malmö FF', 'IFK Göteborg'], ['Hammarby', 'IFK Norrköping'],
    ['Arsenal', 'Chelsea'], ['Liverpool', 'Man City'], ['Barcelona', 'Real Madrid'],
    ['Bayern München', 'Borussia Dortmund'], ['PSG', 'Olympique Lyon'], ['Juventus', 'AC Milan'],
    ['Ajax', 'PSV Eindhoven'], ['Celtic', 'Rangers'], ['Porto', 'Benfica'],
    ['Atlético Madrid', 'Valencia']
  ];

  const [home, away] = teams[Math.min(matchNumber - 1, teams.length - 1)];
  const odds = generateRealisticOdds();
  const probabilities = oddsToNormalizedProbabilities(odds);

  // Create realistic kickoff times (Saturday/Sunday afternoon typical for Stryktipset)
  const baseDate = new Date();
  const nextSaturday = new Date(baseDate);
  nextSaturday.setDate(baseDate.getDate() + (6 - baseDate.getDay()));
  
  const kickoffHour = 13 + (matchNumber % 4); // 13:00, 14:00, 15:00, 16:00
  const kickoffDay = matchNumber <= 7 ? nextSaturday : new Date(nextSaturday.getTime() + 24 * 60 * 60 * 1000); // Sat/Sun split
  
  kickoffDay.setHours(kickoffHour, 0, 0, 0);

  return {
    matchId: `stryk_${matchNumber.toString().padStart(2, '0')}_${new Date().toISOString().split('T')[0]}`,
    home,
    away,
    kickoff: kickoffDay.toISOString(),
    odds,
    probabilities
  };
}

/**
 * Generate complete mock Stryktipset data (fallback)
 */
function generateMockStryktipsetData(): {
  poolId: string;
  matches: MatchWithOdds[];
  lastUpdated: string;
  closeDateTime?: string;
} {
  const matches: MatchWithOdds[] = [];
  for (let i = 1; i <= 13; i++) {
    matches.push(generateMockMatch(i));
  }

  const closeTime = new Date();
  closeTime.setHours(15, 0, 0, 0); // Typical Stryktipset close time
  if (closeTime < new Date()) {
    closeTime.setDate(closeTime.getDate() + 7); // Next week
  }

  return {
    poolId: `stryktipset_${new Date().toISOString().split('T')[0]}`,
    matches,
    lastUpdated: new Date().toISOString(),
    closeDateTime: closeTime.toISOString()
  };
}

/**
 * Fetch additional odds from bookmakers (future enhancement)
 */
export async function fetchBookmakerOdds(matchId: string): Promise<{
  bookmaker: string;
  odds: { home: number; draw: number; away: number };
} | null> {
  // This would integrate with bookmaker APIs like:
  // - Bet365, Betfair, Pinnacle, etc.
  // For now, return null (not implemented)
  return null;
}

/**
 * Get historical data for better probability modeling (future enhancement)
 */
export async function fetchHistoricalData(homeTeam: string, awayTeam: string): Promise<{
  headToHead: { homeWins: number; draws: number; awayWins: number; totalGames: number };
  homeForm: { wins: number; draws: number; losses: number; recentGames: number };
  awayForm: { wins: number; draws: number; losses: number; recentGames: number };
} | null> {
  // This would integrate with football data APIs
  // For now, return null (not implemented)
  return null;
}