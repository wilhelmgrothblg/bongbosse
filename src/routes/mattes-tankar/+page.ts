import type { PageLoad } from './$types';
import type { MatchWithOdds } from '$lib/types';

export const load: PageLoad = async ({ fetch }) => {
  try {
    const response = await fetch('/api/matches');
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch matches');
    }
    
    return {
      matches: data.matches as MatchWithOdds[]
    };
  } catch (error) {
    console.error('Error loading matches for Mattes tankar:', error);
    return {
      matches: [] as MatchWithOdds[]
    };
  }
};