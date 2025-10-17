<script lang="ts">
  import type { GeneratedSystem, SystemMatch, SystemOutcome } from '$lib/types/system';
  import { createEventDispatcher } from 'svelte';
  
  export let generatedSystem: GeneratedSystem;
  export let editable: boolean = false;
  
  const dispatch = createEventDispatcher();
  
  let systemMatches: SystemMatch[] = generatedSystem.matches;
  
  function updateSystemOutcome(matchIndex: number, newOutcome: SystemOutcome) {
    systemMatches[matchIndex] = {
      ...systemMatches[matchIndex],
      systemOutcome: newOutcome
    };
    // Trigger reactivity
    systemMatches = [...systemMatches];
    
    // Dispatch the change to parent
    dispatch('systemUpdated', {
      matches: systemMatches,
      matchIndex,
      newOutcome
    });
  }
  
  function isOutcomeSelected(systemOutcome: SystemOutcome, outcome: '1' | 'X' | '2'): boolean {
    switch (systemOutcome) {
      case '1': return outcome === '1';
      case 'X': return outcome === 'X';
      case '2': return outcome === '2';
      case '1X': return outcome === '1' || outcome === 'X';
      case '12': return outcome === '1' || outcome === '2';
      case 'X2': return outcome === 'X' || outcome === '2';
      case '1X2': return true;
      default: return false;
    }
  }
  
  function getOutcomeCount(systemOutcome: SystemOutcome): number {
    switch (systemOutcome) {
      case '1':
      case 'X':
      case '2':
        return 1;
      case '1X':
      case '12':
      case 'X2':
        return 2;
      case '1X2':
        return 3;
      default:
        return 1;
    }
  }
  
  function toggleOutcome(matchIndex: number, outcome: '1' | 'X' | '2') {
    if (!editable) return;
    
    const currentOutcome = systemMatches[matchIndex].systemOutcome;
    const isSelected = isOutcomeSelected(currentOutcome, outcome);
    
    if (isSelected && getOutcomeCount(currentOutcome) === 1) {
      // Can't deselect the only selected outcome
      return;
    }
    
    let newOutcome: SystemOutcome;
    
    if (isSelected) {
      // Remove this outcome
      if (currentOutcome === '1X') {
        newOutcome = outcome === '1' ? 'X' : '1';
      } else if (currentOutcome === '12') {
        newOutcome = outcome === '1' ? '2' : '1';
      } else if (currentOutcome === 'X2') {
        newOutcome = outcome === 'X' ? '2' : 'X';
      } else if (currentOutcome === '1X2') {
        if (outcome === '1') newOutcome = 'X2';
        else if (outcome === 'X') newOutcome = '12';
        else newOutcome = '1X';
      } else {
        return; // Single outcome, can't remove
      }
    } else {
      // Add this outcome
      if (currentOutcome === '1') {
        newOutcome = outcome === 'X' ? '1X' : '12';
      } else if (currentOutcome === 'X') {
        newOutcome = outcome === '1' ? '1X' : 'X2';
      } else if (currentOutcome === '2') {
        newOutcome = outcome === '1' ? '12' : 'X2';
      } else if (currentOutcome === '1X') {
        newOutcome = '1X2';
      } else if (currentOutcome === '12') {
        newOutcome = '1X2';
      } else if (currentOutcome === 'X2') {
        newOutcome = '1X2';
      } else {
        newOutcome = outcome;
      }
    }
    
    updateSystemOutcome(matchIndex, newOutcome);
  }
  
  function getSystemTypeLabel(systemOutcome: SystemOutcome): string {
    const count = getOutcomeCount(systemOutcome);
    if (count === 1) return 'Spik';
    if (count === 2) return 'Halvgardering';
    return 'Helgardering';
  }
  
  function getSystemTypeColor(systemOutcome: SystemOutcome): string {
    const count = getOutcomeCount(systemOutcome);
    if (count === 1) return 'bg-green-500';
    if (count === 2) return 'bg-yellow-500';
    return 'bg-purple-500';
  }
</script>

<div class="space-y-6">
  <!-- System Info Header -->
  <div class="glass-effect rounded-xl p-6 mb-6">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h2 class="text-2xl font-bold text-white">Genererat System</h2>
        <p class="text-blue-200">{generatedSystem.configuration.description}</p>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold text-green-400">{generatedSystem.configuration.cost} SEK</div>
        <div class="text-sm text-blue-300">{generatedSystem.allRows.length} rader</div>
        <div class="text-xs text-blue-200">Förväntat: {generatedSystem.expectedCorrect.toFixed(1)}/13</div>
      </div>
    </div>

    <!-- System Summary -->
    <div class="grid grid-cols-3 gap-4">
      <div class="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
        <div class="text-green-100 text-center">
          <div class="text-xl font-bold">{systemMatches.filter(m => getOutcomeCount(m.systemOutcome) === 1).length}</div>
          <div class="text-sm">Enkeltecken</div>
        </div>
      </div>
      <div class="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
        <div class="text-yellow-100 text-center">
          <div class="text-xl font-bold">{systemMatches.filter(m => getOutcomeCount(m.systemOutcome) === 2).length}</div>
          <div class="text-sm">Halvgardering</div>
        </div>
      </div>
      <div class="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
        <div class="text-purple-100 text-center">
          <div class="text-xl font-bold">{systemMatches.filter(m => getOutcomeCount(m.systemOutcome) === 3).length}</div>
          <div class="text-sm">Helgardering</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Classic Stryktipset Grid -->
  <div class="glass-effect rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
      <div class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center">
        <div class="w-8"></div>
        <div class="font-bold">MATCH</div>
        <div class="w-16 text-center font-bold">1</div>
        <div class="w-16 text-center font-bold">X</div>
        <div class="w-16 text-center font-bold">2</div>
        <div class="w-24 text-center font-bold text-xs">SYSTEM</div>
      </div>
    </div>

    <!-- Matches -->
    <div class="divide-y divide-white/10">
      {#each systemMatches as match, index}
        <div class="p-3 hover:bg-white/5 transition-colors">
          <div class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center">
            <!-- Match Number -->
            <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-200 font-bold text-sm border border-blue-500/30">
              {index + 1}
            </div>
            
            <!-- Match Info -->
            <div class="min-w-0">
              <div class="font-medium text-white truncate">{match.home}</div>
              <div class="text-sm text-blue-200 truncate">vs {match.away}</div>
            </div>
            
            <!-- Outcome Boxes -->
            {#each ['1', 'X', '2'] as outcome}
              {@const typedOutcome = outcome as '1' | 'X' | '2'}
              {@const isSelected = isOutcomeSelected(match.systemOutcome, typedOutcome)}
              <button
                class="w-16 h-12 border-2 border-white/20 rounded-lg flex items-center justify-center transition-all duration-200 {
                  isSelected 
                    ? 'bg-blue-500 border-blue-400 shadow-lg' 
                    : editable 
                      ? 'hover:border-blue-400 hover:bg-white/10' 
                      : ''
                } {editable ? 'cursor-pointer' : 'cursor-default'}"
                on:click={() => toggleOutcome(index, typedOutcome)}
                disabled={!editable}
              >
                {#if isSelected}
                  <div class="text-white font-bold text-xl">✗</div>
                {/if}
              </button>
            {/each}
            
            <!-- System Type -->
            <div class="w-24">
              <div class="px-2 py-1 rounded text-xs font-medium text-center {getSystemTypeColor(match.systemOutcome)} text-white">
                {getSystemTypeLabel(match.systemOutcome)}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Footer with System Summary -->
    <div class="bg-white/5 p-4 border-t border-white/10">
      <div class="flex justify-between items-center text-sm">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-green-500 rounded"></div>
            <span class="text-blue-200">Spik: {systemMatches.filter(m => getOutcomeCount(m.systemOutcome) === 1).length}</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-yellow-500 rounded"></div>
            <span class="text-blue-200">Halvgardering: {systemMatches.filter(m => getOutcomeCount(m.systemOutcome) === 2).length}</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-purple-500 rounded"></div>
            <span class="text-blue-200">Helgardering: {systemMatches.filter(m => getOutcomeCount(m.systemOutcome) === 3).length}</span>
          </div>
        </div>
        <div class="font-bold text-white">
          Totalt: {generatedSystem.allRows.length} rader × 1 SEK = {generatedSystem.configuration.cost} SEK
        </div>
      </div>
    </div>
  </div>
</div>