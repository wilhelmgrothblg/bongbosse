// API configuration for various betting data sources
export const API_CONFIG = {
  svenskaSpel: {
    baseUrl: 'https://api.svenskaspel.se/external/stryktipset/v1',
    endpoints: {
      currentRound: '/public/currentround',
      rounds: '/public/rounds',
      matches: '/public/rounds/{roundId}/matches',
      odds: '/public/rounds/{roundId}/odds'
    },
    fallbackEnabled: true,
    timeout: 10000,
    retryAttempts: 3
  },
  
  // Placeholder for future bookmaker APIs
  bookmakers: {
    betfair: {
      enabled: false,
      apiUrl: 'https://api.betfair.com/exchange/betting/rest/v1.0',
      // Would need API keys in environment variables
    },
    pinnacle: {
      enabled: false,
      apiUrl: 'https://api.pinnacle.com/v1',
      // Would need API keys in environment variables
    },
    oddsapi: {
      enabled: false,
      apiUrl: 'https://api.the-odds-api.com/v4',
      // Free tier: 500 requests/month
      // Would need API key in environment variables
    }
  },
  
  // Rate limiting and caching
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    cacheTtl: 300000, // 5 minutes in milliseconds
  },
  
  // Data validation settings
  validation: {
    minOdds: 1.01,
    maxOdds: 50.0,
    maxMatchesPerRound: 20,
    requiredFields: ['matchId', 'homeTeam', 'awayTeam', 'kickoff']
  }
};

// Environment-specific overrides
export const getApiConfig = () => {
  const isDev = import.meta.env.DEV;
  
  return {
    ...API_CONFIG,
    svenskaSpel: {
      ...API_CONFIG.svenskaSpel,
      fallbackEnabled: isDev, // Always use fallback in development
      timeout: isDev ? 5000 : 10000
    }
  };
};

// API key management (would be moved to environment variables in production)
export const API_KEYS = {
  // These would be loaded from environment variables in production
  betfair: import.meta.env.VITE_BETFAIR_API_KEY || '',
  pinnacle: import.meta.env.VITE_PINNACLE_API_KEY || '',
  oddsapi: import.meta.env.VITE_ODDS_API_KEY || '',
  // Svenska Spel API is public, no key needed
};

// Error handling configuration
export const ERROR_CONFIG = {
  retryDelays: [1000, 2000, 5000], // Progressive backoff in milliseconds
  maxRetries: 3,
  circuitBreakerThreshold: 5, // Fail after 5 consecutive errors
  circuitBreakerTimeout: 60000, // 1 minute
  
  errorMessages: {
    'NETWORK_ERROR': 'Nätverksfel - kontrollera din internetanslutning',
    'API_TIMEOUT': 'API-anropet tog för lång tid',
    'INVALID_DATA': 'Ogiltig data från API',
    'RATE_LIMITED': 'För många förfrågningar - försök igen senare',
    'API_UNAVAILABLE': 'API:et är inte tillgängligt just nu'
  }
};

export type ApiErrorType = keyof typeof ERROR_CONFIG.errorMessages;