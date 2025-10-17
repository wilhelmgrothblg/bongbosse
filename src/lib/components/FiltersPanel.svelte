<script lang="ts">
  import type { RowFilters } from '$lib/types';
  
  export let filters: RowFilters;
  
  let showAdvanced = false;
</script>

<div class="glass-effect rounded-xl p-6">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-bold text-white">Filter & Regler</h2>
    <button 
      on:click={() => showAdvanced = !showAdvanced}
      class="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors"
    >
      {showAdvanced ? 'Simple' : 'Advanced'}
    </button>
  </div>

  <div class="space-y-4">
    <!-- Basic Filters -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="max-draws" class="block text-sm font-medium text-blue-100 mb-2">
          Max Draws
        </label>
        <input 
          id="max-draws"
          type="number" 
          min="0" 
          max="13" 
          bind:value={filters.maxDraws}
          placeholder="No limit"
          class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200"
        />
      </div>
      
      <div>
        <label for="max-away-wins" class="block text-sm font-medium text-blue-100 mb-2">
          Max Away Wins
        </label>
        <input 
          id="max-away-wins"
          type="number" 
          min="0" 
          max="13" 
          bind:value={filters.maxAwayWins}
          placeholder="No limit"
          class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200"
        />
      </div>
    </div>

    {#if showAdvanced}
      <!-- Advanced Filters -->
      <div class="space-y-4 pt-4 border-t border-white/20">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="min-draws" class="block text-sm font-medium text-blue-100 mb-2">
              Min Draws
            </label>
            <input 
              id="min-draws"
              type="number" 
              min="0" 
              max="13" 
              bind:value={filters.minDraws}
              placeholder="No minimum"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200"
            />
          </div>
          
          <div>
            <label for="min-away-wins" class="block text-sm font-medium text-blue-100 mb-2">
              Min Away Wins
            </label>
            <input 
              id="min-away-wins"
              type="number" 
              min="0" 
              max="13" 
              bind:value={filters.minAwayWins}
              placeholder="No minimum"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="max-favorites" class="block text-sm font-medium text-blue-100 mb-2">
              Max Favorites
            </label>
            <input 
              id="max-favorites"
              type="number" 
              min="0" 
              max="13" 
              bind:value={filters.maxFavorites}
              placeholder="No limit"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200"
            />
          </div>
          
          <div>
            <label for="odds-threshold" class="block text-sm font-medium text-blue-100 mb-2">
              Favorite Odds Threshold
            </label>
            <input 
              id="odds-threshold"
              type="number" 
              step="0.1" 
              min="1.0" 
              max="3.0" 
              bind:value={filters.maxOddsBelow}
              placeholder="e.g., 1.5"
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200"
            />
          </div>
        </div>

        <!-- Personal Biases -->
        <div>
          <div class="block text-sm font-medium text-blue-100 mb-2">
            Personal Biases
          </div>
          <div class="text-sm text-blue-200 mb-2">
            Force specific outcomes for certain matches
          </div>
          <button class="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
            + Add Bias
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- Active Filters Summary -->
  <div class="mt-4 pt-4 border-t border-white/20">
    <div class="text-sm text-blue-100 mb-2">Active Filters:</div>
    <div class="flex flex-wrap gap-2">
      {#if filters.maxDraws !== undefined}
        <span class="px-2 py-1 bg-blue-500/30 text-blue-100 text-xs rounded">
          Max {filters.maxDraws} draws
        </span>
      {/if}
      {#if filters.maxAwayWins !== undefined}
        <span class="px-2 py-1 bg-blue-500/30 text-blue-100 text-xs rounded">
          Max {filters.maxAwayWins} away wins
        </span>
      {/if}
      {#if filters.minDraws !== undefined}
        <span class="px-2 py-1 bg-green-500/30 text-green-100 text-xs rounded">
          Min {filters.minDraws} draws
        </span>
      {/if}
      {#if filters.maxFavorites !== undefined && filters.maxOddsBelow !== undefined}
        <span class="px-2 py-1 bg-yellow-500/30 text-yellow-100 text-xs rounded">
          Max {filters.maxFavorites} below {filters.maxOddsBelow}
        </span>
      {/if}
    </div>
    {#if !filters.maxDraws && !filters.maxAwayWins && !filters.minDraws && !filters.maxFavorites}
      <span class="text-blue-200 text-xs">No filters active</span>
    {/if}
  </div>
</div>