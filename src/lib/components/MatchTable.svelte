<script lang="ts">
  import type { MatchWithOdds } from '$lib/types';
  
  export let matches: MatchWithOdds[];
  
  function getProbabilityClass(probability: number): string {
    if (probability > 0.5) return 'probability-high';
    if (probability > 0.3) return 'probability-medium';
    return 'probability-low';
  }
  
  function formatProbability(prob: number): string {
    return `${(prob * 100).toFixed(1)}%`;
  }
  
  function formatOdds(odds: number): string {
    return odds.toFixed(2);
  }
  
  function formatSvenskaFolket(percentage: string | undefined): string {
    if (!percentage) return '-';
    return `${percentage}%`;
  }
  
  function getSvenskaFolketClass(percentage: string | undefined): string {
    if (!percentage) return '';
    const num = parseInt(percentage);
    if (num > 50) return 'svenska-folket-high';
    if (num > 30) return 'svenska-folket-medium';
    return 'svenska-folket-low';
  }
</script>

<div class="overflow-x-auto">
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b border-white/20">
        <th class="text-left py-2 text-blue-100 font-medium">#</th>
        <th class="text-left py-2 text-blue-100 font-medium">Match</th>
        <th class="text-center py-2 text-blue-100 font-medium">1</th>
        <th class="text-center py-2 text-blue-100 font-medium">X</th>
        <th class="text-center py-2 text-blue-100 font-medium">2</th>
        <th class="text-center py-2 text-blue-100 font-medium text-xs">Svenska Folket</th>
      </tr>
    </thead>
    <tbody class="text-white">
      {#each matches as match, index}
        <tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
          <td class="py-3 text-blue-200 font-medium">
            {index + 1}
          </td>
          <td class="py-3">
            <div class="font-medium">{match.home}</div>
            <div class="text-blue-200 text-xs">vs {match.away}</div>
          </td>
          <td class="py-3 text-center">
            <div class="probability-heatmap rounded-lg p-2 {getProbabilityClass(match.probabilities.home)}">
              <div class="font-bold">{formatOdds(match.odds.home)}</div>
              <div class="text-xs opacity-90">{formatProbability(match.probabilities.home)}</div>
            </div>
          </td>
          <td class="py-3 text-center">
            <div class="probability-heatmap rounded-lg p-2 {getProbabilityClass(match.probabilities.draw)}">
              <div class="font-bold">{formatOdds(match.odds.draw)}</div>
              <div class="text-xs opacity-90">{formatProbability(match.probabilities.draw)}</div>
            </div>
          </td>
          <td class="py-3 text-center">
            <div class="probability-heatmap rounded-lg p-2 {getProbabilityClass(match.probabilities.away)}">
              <div class="font-bold">{formatOdds(match.odds.away)}</div>
              <div class="text-xs opacity-90">{formatProbability(match.probabilities.away)}</div>
            </div>
          </td>
          <td class="py-3 text-center">
            {#if match.svenskaSpelData?.svenskaFolket}
              <div class="svenska-folket-container text-xs space-y-0.5">
                <div class="flex justify-center space-x-1">
                  <span class="svenska-folket-badge {getSvenskaFolketClass(match.svenskaSpelData.svenskaFolket.home)}">
                    {formatSvenskaFolket(match.svenskaSpelData.svenskaFolket.home)}
                  </span>
                  <span class="svenska-folket-badge {getSvenskaFolketClass(match.svenskaSpelData.svenskaFolket.draw)}">
                    {formatSvenskaFolket(match.svenskaSpelData.svenskaFolket.draw)}
                  </span>
                  <span class="svenska-folket-badge {getSvenskaFolketClass(match.svenskaSpelData.svenskaFolket.away)}">
                    {formatSvenskaFolket(match.svenskaSpelData.svenskaFolket.away)}
                  </span>
                </div>
                <div class="text-gray-400 text-xs">Folkets tips</div>
              </div>
            {:else}
              <span class="text-gray-500 text-xs">-</span>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<div class="mt-4 text-xs text-blue-200">
  <div class="flex items-center space-x-4">
    <div class="flex items-center space-x-1">
      <div class="w-3 h-3 rounded probability-high"></div>
      <span>Hög sannolikhet</span>
    </div>
    <div class="flex items-center space-x-1">
      <div class="w-3 h-3 rounded probability-medium"></div>
      <span>Medel sannolikhet</span>
    </div>
    <div class="flex items-center space-x-1">
      <div class="w-3 h-3 rounded probability-low"></div>
      <span>Låg sannolikhet</span>
    </div>
  </div>
</div>

<style>
  .svenska-folket-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    min-width: 2rem;
    display: inline-block;
    text-align: center;
    border: 1px solid;
  }
  
  .svenska-folket-high {
    background-color: rgba(34, 197, 94, 0.3);
    color: rgb(187, 247, 208);
    border-color: rgba(34, 197, 94, 0.4);
  }
  
  .svenska-folket-medium {
    background-color: rgba(234, 179, 8, 0.3);
    color: rgb(254, 240, 138);
    border-color: rgba(234, 179, 8, 0.4);
  }
  
  .svenska-folket-low {
    background-color: rgba(220, 38, 38, 0.3);
    color: rgb(254, 202, 202);
    border-color: rgba(220, 38, 38, 0.4);
  }
</style>