import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentStryktipsetData } from '../../../lib/utils/stryktipsetData';

export const GET: RequestHandler = async () => {
  try {
    console.log('Fetching consistent Saturday Stryktipset data...');
    
    // Get consistent Saturday Stryktipset data
    const stryktipsetData = await getCurrentStryktipsetData();
    
    console.log(`Fetched ${stryktipsetData.matches.length} matches for ${stryktipsetData.poolId} (source: ${stryktipsetData.source})`);
    
    return json({
      poolId: stryktipsetData.poolId,
      matches: stryktipsetData.matches,
      lastUpdated: stryktipsetData.lastUpdated,
      closeDateTime: stryktipsetData.closeDateTime,
      source: stryktipsetData.source
    });
    
  } catch (error) {
    console.error('Error in Stryktipset API endpoint:', error);
    
    // Return error response
    return json({
      error: 'Failed to fetch Stryktipset data',
      message: error instanceof Error ? error.message : 'Unknown error',
      source: 'error'
    }, { status: 500 });
  }
};