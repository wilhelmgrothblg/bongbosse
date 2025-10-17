<script lang="ts">
  import type { SimulationResult } from '$lib/types';
  
  export let results: SimulationResult[];
  
  function formatProbability(prob: number): string {
    return `${(prob * 100).toFixed(2)}%`;
  }
  
  function formatCurrency(amount: number): string {
    return `${amount.toFixed(0)} SEK`;
  }
  
  function getProgressWidth(prob: number): string {
    return `${Math.max(2, prob * 100)}%`;
  }
  
  function getProbabilityColor(prob: number): string {
    if (prob > 0.1) return 'bg-green-500';
    if (prob > 0.05) return 'bg-yellow-500';
    if (prob > 0.01) return 'bg-orange-500';
    return 'bg-red-500';
  }
</script>

<div class="space-y-6">
  {#each results as result, index}
    <div class="bg-white/5 rounded-lg p-4 border border-white/10">
      <!-- Result Header -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-white">Row {index + 1} Simulation</h3>
        <div class="text-right">
          <div class="text-sm text-blue-200">
            {result.iterations.toLocaleString()} iterations
          </div>
          <div class="text-lg font-bold text-white">
            Avg: {result.averageCorrect.toFixed(2)}/13
          </div>
        </div>
      </div>

      <!-- Probability Bars -->
      <div class="space-y-3">
        <div>
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-blue-200">10+ Correct</span>
            <span class="text-sm font-medium text-white">
              {formatProbability(result.correctResults.atLeast10)}
            </span>
          </div>
          <div class="w-full bg-white/10 rounded-full h-3">
            <div 
              class="h-3 rounded-full transition-all duration-500 {getProbabilityColor(result.correctResults.atLeast10)}"
              style="width: {getProgressWidth(result.correctResults.atLeast10)}"
            ></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-blue-200">11+ Correct</span>
            <span class="text-sm font-medium text-white">
              {formatProbability(result.correctResults.atLeast11)}
            </span>
          </div>
          <div class="w-full bg-white/10 rounded-full h-3">
            <div 
              class="h-3 rounded-full transition-all duration-500 {getProbabilityColor(result.correctResults.atLeast11)}"
              style="width: {getProgressWidth(result.correctResults.atLeast11)}"
            ></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-blue-200">12+ Correct</span>
            <span class="text-sm font-medium text-white">
              {formatProbability(result.correctResults.atLeast12)}
            </span>
          </div>
          <div class="w-full bg-white/10 rounded-full h-3">
            <div 
              class="h-3 rounded-full transition-all duration-500 {getProbabilityColor(result.correctResults.atLeast12)}"
              style="width: {getProgressWidth(result.correctResults.atLeast12)}"
            ></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-blue-200">13 Correct (Jackpot!)</span>
            <span class="text-sm font-medium text-white">
              {formatProbability(result.correctResults.exactly13)}
            </span>
          </div>
          <div class="w-full bg-white/10 rounded-full h-3">
            <div 
              class="h-3 rounded-full transition-all duration-500 bg-purple-500"
              style="width: {getProgressWidth(result.correctResults.exactly13)}"
            ></div>
          </div>
        </div>
      </div>

      <!-- Expected Payout -->
      <div class="mt-4 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
        <div class="flex justify-between items-center">
          <span class="text-yellow-200 font-medium">Expected Payout:</span>
          <span class="text-yellow-100 font-bold text-lg">
            {formatCurrency(result.expectedPayout)}
          </span>
        </div>
      </div>

      <!-- Detailed Breakdown -->
      <div class="mt-4 pt-4 border-t border-white/10">
        <div class="text-sm text-blue-200 mb-2">Exact Results:</div>
        <div class="grid grid-cols-4 gap-2 text-xs">
          <div class="text-center">
            <div class="text-white font-medium">{formatProbability(result.correctResults.exactly10)}</div>
            <div class="text-blue-300">Exactly 10</div>
          </div>
          <div class="text-center">
            <div class="text-white font-medium">{formatProbability(result.correctResults.exactly11)}</div>
            <div class="text-blue-300">Exactly 11</div>
          </div>
          <div class="text-center">
            <div class="text-white font-medium">{formatProbability(result.correctResults.exactly12)}</div>
            <div class="text-blue-300">Exactly 12</div>
          </div>
          <div class="text-center">
            <div class="text-white font-medium">{formatProbability(result.correctResults.exactly13)}</div>
            <div class="text-blue-300">Exactly 13</div>
          </div>
        </div>
      </div>

      <!-- Confidence Intervals (if available) -->
      {#if 'confidenceIntervals' in result && result.confidenceIntervals}
        {@const ci = result.confidenceIntervals}
        <div class="mt-4 pt-4 border-t border-white/10">
          <div class="text-sm text-blue-200 mb-2">95% Confidence Intervals:</div>
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div class="text-blue-300">Average Correct:</div>
              <div class="text-white">
                {ci.averageCorrect.lower.toFixed(2)} - 
                {ci.averageCorrect.upper.toFixed(2)}
              </div>
            </div>
            <div>
              <div class="text-blue-300">Expected Payout:</div>
              <div class="text-white">
                {formatCurrency(ci.expectedPayout.lower)} - 
                {formatCurrency(ci.expectedPayout.upper)}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>

{#if results.length > 1}
  <!-- Summary for Multiple Rows -->
  <div class="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
    <h3 class="font-bold text-white mb-3">System Summary</h3>
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <div class="text-blue-200">Best Average:</div>
        <div class="text-white font-medium">
          {Math.max(...results.map(r => r.averageCorrect)).toFixed(2)}/13
        </div>
      </div>
      <div>
        <div class="text-blue-200">Best Expected Payout:</div>
        <div class="text-white font-medium">
          {formatCurrency(Math.max(...results.map(r => r.expectedPayout)))}
        </div>
      </div>
    </div>
  </div>
{/if}