<script lang="ts">
  import type { GeneratedRow, MatchWithOdds, Outcome } from '$lib/types';
  
  export let rows: GeneratedRow[];
  export let matches: MatchWithOdds[];
  
  function getOutcomeLabel(outcome: Outcome): string {
    switch (outcome) {
      case '1': return 'H';
      case 'X': return 'D';
      case '2': return 'A';
    }
  }
  
  function getOutcomeColor(outcome: Outcome): string {
    switch (outcome) {
      case '1': return 'bg-green-500';
      case 'X': return 'bg-yellow-500';
      case '2': return 'bg-red-500';
    }
  }
  
  function getMatchProbability(matchIndex: number, outcome: Outcome): number {
    const match = matches[matchIndex];
    switch (outcome) {
      case '1': return match.probabilities.home;
      case 'X': return match.probabilities.draw;
      case '2': return match.probabilities.away;
    }
  }
  
  function formatProbability(prob: number): string {
    return `${(prob * 100).toFixed(0)}%`;
  }
  
  function formatExpectedCorrect(expected: number): string {
    return expected.toFixed(1);
  }
  
  function calculateRowProbability(row: GeneratedRow): number {
    return row.outcomes.reduce((acc, outcome, index) => {
      return acc * getMatchProbability(index, outcome);
    }, 1);
  }
  
  function getRowRiskLevel(row: GeneratedRow): { level: string; class: string } {
    const avgProb = row.expectedCorrect / 13;
    if (avgProb > 0.6) return { level: 'Safe', class: 'text-green-400' };
    if (avgProb > 0.4) return { level: 'Balanced', class: 'text-yellow-400' };
    return { level: 'Risky', class: 'text-red-400' };
  }
</script>

<div class="space-y-4">
  {#each rows as row, rowIndex}
    <div class="bg-white/5 rounded-lg p-4 border border-white/10">
      <!-- Row Header -->
      <div class="flex justify-between items-center mb-3">
        <div class="flex items-center space-x-3">
          <h3 class="font-bold text-white">Row {rowIndex + 1}</h3>
          <span class="px-2 py-1 rounded text-xs {getRowRiskLevel(row).class} bg-white/10">
            {getRowRiskLevel(row).level}
          </span>
        </div>
        <div class="text-right">
          <div class="text-sm text-blue-200">Expected: {formatExpectedCorrect(row.expectedCorrect)}/13</div>
          <div class="text-xs text-blue-300">
            Row probability: {formatProbability(calculateRowProbability(row))}
          </div>
        </div>
      </div>

      <!-- Outcomes Grid -->
      <div class="grid grid-cols-13 gap-1 mb-3">
        {#each row.outcomes as outcome, matchIndex}
          <div class="relative group">
            <div 
              class="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold {getOutcomeColor(outcome)} cursor-help"
            >
              {getOutcomeLabel(outcome)}
            </div>
            
            <!-- Tooltip -->
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              <div class="font-medium">{matches[matchIndex].home} vs {matches[matchIndex].away}</div>
              <div>Probability: {formatProbability(getMatchProbability(matchIndex, outcome))}</div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Row Stats -->
      <div class="grid grid-cols-3 gap-4 text-xs text-blue-200">
        <div>
          <span class="font-medium">Home wins:</span>
          {row.outcomes.filter(o => o === '1').length}
        </div>
        <div>
          <span class="font-medium">Draws:</span>
          {row.outcomes.filter(o => o === 'X').length}
        </div>
        <div>
          <span class="font-medium">Away wins:</span>
          {row.outcomes.filter(o => o === '2').length}
        </div>
      </div>
    </div>
  {/each}
</div>

<!-- Legend -->
<div class="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
  <div class="text-sm font-medium text-white mb-2">Legend:</div>
  <div class="flex items-center space-x-4 text-xs text-blue-200">
    <div class="flex items-center space-x-1">
      <div class="w-3 h-3 rounded bg-green-500"></div>
      <span>H = Home win</span>
    </div>
    <div class="flex items-center space-x-1">
      <div class="w-3 h-3 rounded bg-yellow-500"></div>
      <span>D = Draw</span>
    </div>
    <div class="flex items-center space-x-1">
      <div class="w-3 h-3 rounded bg-red-500"></div>
      <span>A = Away win</span>
    </div>
  </div>
</div>

<style>
  .grid-cols-13 {
    grid-template-columns: repeat(13, minmax(0, 1fr));
  }
</style>