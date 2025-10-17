import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { MatchWithOdds, RiskProfile } from '../../../lib/types';
import type { SystemConfiguration } from '../../../lib/types/system';
import { generateSystem } from '../../../lib/utils/systemGenerator';

export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    const { systemConfig, riskProfile }: { 
      systemConfig: SystemConfiguration;
      riskProfile: RiskProfile;
    } = await request.json();
    
    // Fetch current matches
    const matchesResponse = await fetch('/api/stryktipset');
    const matchesData = await matchesResponse.json();
    const matches: MatchWithOdds[] = matchesData.matches;
    
    // Validate input
    if (!systemConfig || !riskProfile) {
      return json({ error: 'Missing systemConfig or riskProfile' }, { status: 400 });
    }
    
    if (!['safe', 'balanced', 'risky'].includes(riskProfile)) {
      return json({ error: 'Invalid risk profile' }, { status: 400 });
    }
    
    // Generate system
    const system = generateSystem(matches, systemConfig, riskProfile);
    
    // Create lightweight response - only include essential data for StryktipsetGrid
    const lightweightSystem = {
      id: system.id,
      matches: system.matches,
      configuration: system.configuration,
      expectedCorrect: system.expectedCorrect,
      expectedPayout: system.expectedPayout,
      riskProfile: system.riskProfile,
      createdAt: system.createdAt,
      // For StryktipsetGrid, we only need the count, not the actual rows
      allRows: { length: system.allRows.length }
    };
    
    console.log(`📡 API Response size optimized: ${system.allRows.length} rows → count only`);
    
    return json({
      success: true,
      system: lightweightSystem,
      generated: system.allRows.length,
      cost: system.configuration.cost
    });
    
  } catch (error) {
    console.error('Error generating system:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};