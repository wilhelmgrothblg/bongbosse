import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { GeneratedRow, MatchWithOdds } from '../../../lib/types';
import { simulateMultipleRows, simulateWithConfidenceIntervals } from '../../../lib/utils/simulation';

export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    const { rows, withConfidenceIntervals = false, iterations = 100000 } = await request.json();
    
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return json({ error: 'No rows provided for simulation' }, { status: 400 });
    }
    
    // Validate iterations
    if (iterations < 1000 || iterations > 1000000) {
      return json({ error: 'Iterations must be between 1,000 and 1,000,000' }, { status: 400 });
    }
    
    // Fetch current matches
    const matchesResponse = await fetch('/api/stryktipset');
    const matchesData = await matchesResponse.json();
    const matches: MatchWithOdds[] = matchesData.matches;
    
    let results;
    
    if (withConfidenceIntervals && rows.length === 1) {
      // Detailed simulation with confidence intervals for single row
      results = [simulateWithConfidenceIntervals(rows[0], matches, iterations)];
    } else {
      // Standard simulation for multiple rows
      results = simulateMultipleRows(rows, matches, iterations);
    }
    
    return json({
      success: true,
      results,
      iterations,
      simulatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error running simulation:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};