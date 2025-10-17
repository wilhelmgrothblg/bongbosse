<script lang="ts">
  import type { GeneratedSystem, SystemMatch, SystemOutcome } from '$lib/types/system';
  import type { MatchWithOdds } from '$lib/types';
  
  export let generatedSystem: GeneratedSystem;
  
  let showAllRows = false;
  let selectedRowsToShow = 10;
  
  function getOutcomeDisplay(systemOutcome: SystemOutcome): { text: string; color: string; description: string } {
    switch (systemOutcome) {
      case '1': return { text: '1', color: 'bg-green-600', description: 'Home win only' };
      case 'X': return { text: 'X', color: 'bg-yellow-600', description: 'Draw only' };
      case '2': return { text: '2', color: 'bg-red-600', description: 'Away win only' };
      case '1X': return { text: '1X', color: 'bg-green-500', description: 'Home win OR Draw' };
      case '12': return { text: '12', color: 'bg-blue-500', description: 'Home win OR Away win' };
      case 'X2': return { text: 'X2', color: 'bg-orange-500', description: 'Draw OR Away win' };
      case '1X2': return { text: '1X2', color: 'bg-purple-600', description: 'Any outcome (full coverage)' };
    }
  }
  
  function getSystemTypeCount(systemOutcome: SystemOutcome): 'single' | 'half' | 'full' {
    if (['1', 'X', '2'].includes(systemOutcome)) return 'single';
    if (['1X', '12', 'X2'].includes(systemOutcome)) return 'half';
    return 'full';
  }
  
  function formatProbability(prob: number): string {
    return `${(prob * 100).toFixed(1)}%`;
  }
  
  function getMatchProbabilityForOutcome(match: SystemMatch, outcome: SystemOutcome): number {
    switch (outcome) {
      case '1': return match.probabilities.home;
      case 'X': return match.probabilities.draw;
      case '2': return match.probabilities.away;
      case '1X': return match.probabilities.home + match.probabilities.draw;
      case '12': return match.probabilities.home + match.probabilities.away;
      case 'X2': return match.probabilities.draw + match.probabilities.away;
      case '1X2': return 1.0;
    }
  }
  
  $: displayedRows = showAllRows ? generatedSystem.allRows : generatedSystem.allRows.slice(0, selectedRowsToShow);
  $: systemSummary = {
    singles: generatedSystem.matches.filter(m => getSystemTypeCount(m.systemOutcome) === 'single').length,
    halves: generatedSystem.matches.filter(m => getSystemTypeCount(m.systemOutcome) === 'half').length,
    fulls: generatedSystem.matches.filter(m => getSystemTypeCount(m.systemOutcome) === 'full').length
  };
</script>

<div class="space-y-6">
  <!-- System Overview -->
  <div class="glass-effect rounded-xl p-6">
    <div class="flex justify-between items-start mb-4">
      <div>
        <h2 class="text-xl font-bold text-white mb-2">Genererat System</h2>
        <p class="text-blue-200">{generatedSystem.configuration.description}</p>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold text-white">{generatedSystem.allRows.length} Rows</div>
        <div class="text-lg text-green-400">{generatedSystem.configuration.cost} SEK</div>
        <div class="text-sm text-blue-300">Expected: {generatedSystem.expectedCorrect.toFixed(1)}/13</div>
      </div>
    </div>

    <!-- System Summary -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
        <div class="text-green-100 text-center">
          <div class="text-xl font-bold">{systemSummary.singles}</div>
          <div class="text-sm">Spikar</div>
        </div>
      </div>
      <div class="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
        <div class="text-yellow-100 text-center">
          <div class="text-xl font-bold">{systemSummary.halves}</div>
          <div class="text-sm">Halvgarderingar</div>
        </div>
      </div>
      <div class="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
        <div class="text-purple-100 text-center">
          <div class="text-xl font-bold">{systemSummary.fulls}</div>
          <div class="text-sm">Helgarderingar</div>
        </div>
      </div>
    </div>

    <!-- System Configuration Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/20">
            <th class="text-left py-2 text-blue-100 font-medium">#</th>
            <th class="text-left py-2 text-blue-100 font-medium">Match</th>
            <th class="text-center py-2 text-blue-100 font-medium">System</th>
            <th class="text-center py-2 text-blue-100 font-medium">Coverage</th>
            <th class="text-center py-2 text-blue-100 font-medium">Probability</th>
          </tr>
        </thead>
        <tbody class="text-white">
          {#each generatedSystem.matches as match, index}
            {@const outcomeDisplay = getOutcomeDisplay(match.systemOutcome)}
            {@const probability = getMatchProbabilityForOutcome(match, match.systemOutcome)}
            <tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
              <td class="py-3 text-blue-200 font-medium">{index + 1}</td>
              <td class="py-3">
                <div class="font-medium">{match.home}</div>
                <div class="text-blue-200 text-xs">vs {match.away}</div>
              </td>
              <td class="py-3 text-center">
                <div 
                  class="inline-block px-3 py-1 rounded-lg text-white font-bold text-sm {outcomeDisplay.color}"
                  title={outcomeDisplay.description}
                >
                  {outcomeDisplay.text}
                </div>
              </td>
              <td class="py-3 text-center">
                <div class="text-xs text-blue-200">{outcomeDisplay.description}</div>
              </td>
              <td class="py-3 text-center">
                <div class="font-medium">{formatProbability(probability)}</div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Generated Rows Preview -->
  <div class="glass-effect rounded-xl p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-white">Genererade Rader Preview</h3>
      <div class="flex items-center space-x-3">
        {#if !showAllRows}
          <select bind:value={selectedRowsToShow} class="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
            <option value={5}>Show 5 rows</option>
            <option value={10}>Show 10 rows</option>
            <option value={20}>Show 20 rows</option>
          </select>
        {/if}
        <button 
          on:click={() => showAllRows = !showAllRows}
          class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
        >
          {showAllRows ? 'Show Less' : `Show All ${generatedSystem.allRows.length}`}
        </button>
      </div>
    </div>

    <div class="space-y-2">
      {#each displayedRows as row, rowIndex}
        <div class="p-3 bg-white/5 rounded-lg border border-white/10">
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium text-white">Row {rowIndex + 1}</span>
            <div class="text-sm text-blue-200">
              Expected: {row.expectedCorrect.toFixed(1)}/13
            </div>
          </div>
          
          <!-- Row outcomes -->
          <div class="grid grid-cols-13 gap-1">
            {#each row.outcomes as outcome, matchIndex}
              {@const outcomeColor = outcome === '1' ? 'bg-green-500' : outcome === 'X' ? 'bg-yellow-500' : 'bg-red-500'}
              <div 
                class="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold {outcomeColor}"
                title="{generatedSystem.matches[matchIndex].home} vs {generatedSystem.matches[matchIndex].away}: {outcome}"
              >
                {outcome}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    {#if !showAllRows && generatedSystem.allRows.length > selectedRowsToShow}
      <div class="mt-4 text-center">
        <div class="text-sm text-blue-200">
          Showing {selectedRowsToShow} of {generatedSystem.allRows.length} total rows
        </div>
      </div>
    {/if}
  </div>

  <!-- System Statistics -->
  <div class="glass-effect rounded-xl p-6">
    <h3 class="text-lg font-bold text-white mb-4">Systemstatistik</h3>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="p-3 bg-white/5 rounded-lg text-center">
        <div class="text-2xl font-bold text-white">{generatedSystem.allRows.length}</div>
        <div class="text-sm text-blue-200">Total Rows</div>
      </div>
      
      <div class="p-3 bg-white/5 rounded-lg text-center">
        <div class="text-2xl font-bold text-green-400">{generatedSystem.configuration.cost}</div>
        <div class="text-sm text-blue-200">Cost (SEK)</div>
      </div>
      
      <div class="p-3 bg-white/5 rounded-lg text-center">
        <div class="text-2xl font-bold text-yellow-400">{generatedSystem.expectedCorrect.toFixed(1)}</div>
        <div class="text-sm text-blue-200">Avg Expected</div>
      </div>
      
      <div class="p-3 bg-white/5 rounded-lg text-center">
        <div class="text-2xl font-bold text-purple-400">{generatedSystem.expectedPayout.toFixed(0)}</div>
        <div class="text-sm text-blue-200">Est. Payout</div>
      </div>
    </div>
  </div>
</div>

<style>
  .grid-cols-13 {
    grid-template-columns: repeat(13, minmax(0, 1fr));
  }
</style>