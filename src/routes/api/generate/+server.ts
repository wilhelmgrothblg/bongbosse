import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { MatchWithOdds, GeneratorConfig } from '../../../lib/types';
import { generateMultipleRows } from '../../../lib/utils/rowGenerator';

export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    const config: GeneratorConfig = await request.json();
    
    // Fetch current matches
    const matchesResponse = await fetch('/api/stryktipset');
    const matchesData = await matchesResponse.json();
    const matches: MatchWithOdds[] = matchesData.matches;
    
    // Validate config
    if (!config.riskProfile || !['safe', 'balanced', 'risky'].includes(config.riskProfile)) {
      return json({ error: 'Invalid risk profile' }, { status: 400 });
    }
    
    if (!config.numRows || config.numRows < 1 || config.numRows > 20) {
      return json({ error: 'Number of rows must be between 1 and 20' }, { status: 400 });
    }
    
    // Generate rows
    const rows = generateMultipleRows(matches, config);
    
    if (rows.length === 0) {
      return json({ 
        error: 'Could not generate any rows that meet the specified criteria. Try relaxing your filters.' 
      }, { status: 400 });
    }
    
    return json({
      success: true,
      rows,
      config,
      generated: rows.length,
      requested: config.numRows
    });
    
  } catch (error) {
    console.error('Error generating rows:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};