import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getThisWeeksStryktipset } from '$lib/utils/realSvenskaSpelAPI';

export const GET: RequestHandler = async () => {
  try {
    const matches = await getThisWeeksStryktipset();
    
    return json({
      success: true,
      matches
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    
    return json({
      success: false,
      error: 'Failed to fetch matches',
      matches: []
    }, { status: 500 });
  }
};