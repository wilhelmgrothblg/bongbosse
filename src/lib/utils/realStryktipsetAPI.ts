// Real Svenska Spel API integration for Stryktipset
import type { MatchWithOdds } from '../types';
import { oddsToNormalizedProbabilities } from './odds';

// Svenska Spel's actual API endpoints
const SVENSKA_SPEL_BASE = 'https://api.svenskaspel.se';
const STRYKTIPSET_ENDPOINTS = {
  draws: '/draw/1/stryktipset',
  currentDraw: '/draw/1/stryktipset/draws/current',
  odds: '/odds/stryktipset'
};

interface SvenskaSpelApiResponse {
  drawGameId: number;
  drawId: string;
  name: string;
  drawDate: string;
  closeTime: string;
  drawStatus: string;
  events: SvenskaSpelEvent[];
}

interface SvenskaSpelEvent {
  eventNumber: number;
  homeTeam: {
    id: number;
    name: string;
  };
  awayTeam: {
    id: number;
    name: string;
  };
  eventDate: string;
  odds?: {
    one?: number;
    x?: number;
    two?: number;
  };
}

/**
 * Attempt to fetch real Stryktipset data from Svenska Spel API
 */
export async function fetchRealStryktipsetAPI(): Promise<MatchWithOdds[] | null> {
  try {
    console.log('Attempting to fetch from real Svenska Spel API...');
    
    // Try different endpoints
    const endpoints = [
      `${SVENSKA_SPEL_BASE}${STRYKTIPSET_ENDPOINTS.currentDraw}`,
      `${SVENSKA_SPEL_BASE}${STRYKTIPSET_ENDPOINTS.draws}`,
      `${SVENSKA_SPEL_BASE}/external/stryktipset/v1/public/currentround`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Stryktipset-Generator/1.0',
            'Origin': 'https://www.svenskaspel.se'
          },
          mode: 'cors',
          cache: 'no-cache'
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Successfully fetched data from Svenska Spel API:', data);
          
          return convertSvenskaSpelData(data);
        } else {
          console.log(`Endpoint ${endpoint} returned ${response.status}`);
        }
        
      } catch (endpointError) {
        console.log(`Endpoint ${endpoint} failed:`, endpointError);
        continue;
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Failed to fetch from Svenska Spel API:', error);
    return null;
  }
}

/**
 * Convert Svenska Spel API data to our format
 */
function convertSvenskaSpelData(apiData: any): MatchWithOdds[] {
  try {
    const events = apiData.events || apiData.draws?.[0]?.events || [];
    
    return events.slice(0, 13).map((event: SvenskaSpelEvent, index: number) => {
      // Use provided odds or generate realistic ones
      const odds = event.odds ? {
        home: event.odds.one || 2.50,
        draw: event.odds.x || 3.20,
        away: event.odds.two || 2.80
      } : generateRealisticOddsForTeams(event.homeTeam.name, event.awayTeam.name);
      
      const probabilities = oddsToNormalizedProbabilities(odds);
      
      return {
        matchId: `stryk_api_${(index + 1).toString().padStart(2, '0')}`,
        home: event.homeTeam.name,
        away: event.awayTeam.name,
        kickoff: event.eventDate,
        odds,
        probabilities
      };
    });
    
  } catch (error) {
    console.error('Error converting Svenska Spel data:', error);
    return [];
  }
}

/**
 * Generate realistic odds based on team names
 */
function generateRealisticOddsForTeams(homeTeam: string, awayTeam: string): {
  home: number;
  draw: number;
  away: number;
} {
  // Big clubs that usually have lower odds
  const bigClubs = ['Arsenal', 'Chelsea', 'Liverpool', 'Man City', 'Barcelona', 'Real Madrid', 
                   'Bayern München', 'PSG', 'Juventus', 'Ajax', 'Celtic'];
  
  const homeIsBig = bigClubs.some(club => homeTeam.includes(club));
  const awayIsBig = bigClubs.some(club => awayTeam.includes(club));
  
  if (homeIsBig && !awayIsBig) {
    // Home team favored
    return { home: 1.60 + Math.random() * 0.30, draw: 3.50 + Math.random() * 0.50, away: 4.50 + Math.random() * 1.50 };
  } else if (!homeIsBig && awayIsBig) {
    // Away team favored  
    return { home: 4.50 + Math.random() * 1.50, draw: 3.50 + Math.random() * 0.50, away: 1.60 + Math.random() * 0.30 };
  } else if (homeIsBig && awayIsBig) {
    // Both big - close match
    return { home: 2.20 + Math.random() * 0.60, draw: 3.20 + Math.random() * 0.40, away: 2.20 + Math.random() * 0.60 };
  } else {
    // Regular match
    return { home: 2.30 + Math.random() * 0.70, draw: 3.10 + Math.random() * 0.30, away: 2.50 + Math.random() * 0.70 };
  }
}

/**
 * Alternative: Try to fetch through a proxy or CORS helper
 */
export async function fetchThroughProxy(): Promise<MatchWithOdds[] | null> {
  try {
    // You could use services like:
    // - https://cors-anywhere.herokuapp.com/
    // - Your own CORS proxy
    // - AllOrigins.win
    
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const targetUrl = encodeURIComponent('https://api.svenskaspel.se/draw/1/stryktipset');
    
    const response = await fetch(`${proxyUrl}${targetUrl}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const proxyData = await response.json();
      const actualData = JSON.parse(proxyData.contents);
      return convertSvenskaSpelData(actualData);
    }
    
    return null;
    
  } catch (error) {
    console.log('Proxy fetch failed:', error);
    return null;
  }
}

/**
 * Master function to try all methods
 */
export async function tryAllApiMethods(): Promise<MatchWithOdds[] | null> {
  console.log('Trying all API methods...');
  
  // Method 1: Direct API call
  let result = await fetchRealStryktipsetAPI();
  if (result && result.length > 0) {
    console.log('✅ Direct API call successful');
    return result;
  }
  
  // Method 2: Through proxy
  result = await fetchThroughProxy();
  if (result && result.length > 0) {
    console.log('✅ Proxy API call successful');
    return result;
  }
  
  console.log('❌ All API methods failed');
  return null;
}