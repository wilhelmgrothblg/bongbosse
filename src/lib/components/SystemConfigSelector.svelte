<script lang="ts">
  import type { SystemConfiguration } from '$lib/types/system';
  import { SYSTEM_PRESETS } from '$lib/types/system';
  import { StryktipsetSystemCalculator } from '$lib/utils/systemCalculator';
  
  export let selectedSystem: keyof typeof SYSTEM_PRESETS = 'system-96';
  export let currentSystemConfig: SystemConfiguration | undefined = undefined;
  
  let calculator = new StryktipsetSystemCalculator();
  let availableSizes = calculator.getAvailableSystemSizes(1000);
  let sliderValue = 96;
  
  // Find closest valid system size when slider changes
  $: actualSystemSize = findClosestValidSize(sliderValue);
  $: currentConfig = calculator.findClosestSystem(actualSystemSize);
  
  // Export the current configuration
  $: currentSystemConfig = {
    totalRows: currentConfig.totalRows,
    cost: currentConfig.cost,
    costPerRow: currentConfig.costPerRow,
    distribution: currentConfig.distribution,
    description: currentConfig.description
  };
  
  function findClosestValidSize(target: number): number {
    if (availableSizes.includes(target)) return target;
    
    // Find closest valid size
    let closest = availableSizes[0];
    let minDiff = Math.abs(availableSizes[0] - target);
    
    for (const size of availableSizes) {
      const diff = Math.abs(size - target);
      if (diff < minDiff) {
        minDiff = diff;
        closest = size;
      }
    }
    
    return closest;
  }
  
  function formatCost(cost: number): string {
    return `${cost} SEK`;
  }
  
  function getSystemColor(rows: number): string {
    if (rows <= 32) return 'border-green-500 bg-green-50';
    if (rows <= 64) return 'border-blue-500 bg-blue-50';
    if (rows <= 128) return 'border-yellow-500 bg-yellow-50';
    if (rows <= 256) return 'border-purple-500 bg-purple-50';
    return 'border-red-500 bg-red-50';
  }
  
  // Quick preset functions that set to exact valid sizes
  function setSystem(rows: number) {
    const validSize = findClosestValidSize(rows);
    sliderValue = validSize;
  }
</script>

<div class="ss-glass-effect rounded-xl p-6">
  <h2 class="ss-heading-2 text-white mb-6">Systemkonfiguration</h2>

  <!-- Slider Control -->
  <div class="space-y-4 mb-6">
    <div class="space-y-3">
      <div class="flex justify-between items-center">
        <label class="ss-body text-white font-semibold">Antal rader: {currentConfig.totalRows}</label>
        <span class="ss-body-small text-blue-100 font-medium">{formatCost(currentConfig.cost)}</span>
      </div>
      
      <input 
        type="range" 
        min="{Math.min(...availableSizes)}" 
        max="{Math.max(...availableSizes)}" 
        step="1"
        bind:value={sliderValue}
        class="w-full ss-slider"
      />
      
      <div class="flex justify-between ss-caption-system text-blue-200">
        <span>{Math.min(...availableSizes)}</span>
        <span>256</span>
        <span>512</span>
        <span>{Math.max(...availableSizes)}</span>
      </div>
    </div>
  </div>

  <!-- Current System Display -->
  <div class="p-5 rounded-lg border-2 {getSystemColor(currentConfig.totalRows)} ss-card bg-white/95">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="ss-heading-3 text-gray-800 mb-2">{currentConfig.totalRows} Rader</h3>
        <div class="ss-caption-system text-gray-500 space-y-1">
          {#if currentConfig.distribution.halves > 0}
            <div class="flex items-center">
              <div class="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span>Halvgarderingar: {currentConfig.distribution.halves}</span>
            </div>
          {/if}
          {#if currentConfig.distribution.fulls > 0}
            <div class="flex items-center">
              <div class="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span>Helgarderingar: {currentConfig.distribution.fulls}</span>
            </div>
          {/if}
          {#if currentConfig.distribution.singles > 0}
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Enkeltecken: {currentConfig.distribution.singles}</span>
            </div>
          {/if}
        </div>
      </div>
      <div class="text-right">
        <div class="ss-heading-4 ss-text-primary font-bold">{formatCost(currentConfig.cost)}</div>
      </div>
    </div>
  </div>

  <!-- Quick Presets -->
  <div class="mt-6">
    <h4 class="ss-body text-white font-medium mb-3">Snabbval:</h4>
    <div class="flex gap-2 flex-wrap">
      <button 
        on:click={() => setSystem(8)}
        class="ss-button-secondary bg-white/10 border-green-400 text-white hover:bg-white hover:text-white transition-all duration-200"
      >
        8 rader
      </button>
      <button 
        on:click={() => setSystem(36)}
        class="ss-button-secondary bg-white/10 border-blue-400 text-blue-100 hover:bg-blue-400 hover:text-white transition-all duration-200"
      >
        36 rader
      </button>
      <button 
        on:click={() => setSystem(64)}
        class="ss-button-secondary bg-white/10 border-yellow-400 text-yellow-100 hover:bg-yellow-400 hover:text-white transition-all duration-200"
      >
        64 rader
      </button>
      <button 
        on:click={() => setSystem(216)}
        class="ss-button-secondary bg-white/10 border-purple-400 text-purple-100 hover:bg-purple-400 hover:text-white transition-all duration-200"
      >
        216 rader
      </button>
      <button 
        on:click={() => setSystem(512)}
        class="ss-button-secondary bg-white/10 border-red-400 text-red-100 hover:bg-red-400 hover:text-white transition-all duration-200"
      >
        512 rader
      </button>
    </div>
  </div>
</div>

<style>
  /* Use the new SS slider styles from app.css */
  .ss-slider {
    appearance: none;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(to right, var(--ss-accent-blue), var(--ss-primary-blue));
    outline: none;
    opacity: 0.9;
    transition: opacity 0.2s;
  }
  
  .ss-slider:hover {
    opacity: 1;
  }
  
  .ss-slider::-webkit-slider-thumb {
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border: 3px solid var(--ss-primary-blue);
    transition: transform 0.1s ease;
  }
  
  .ss-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  
  .ss-slider::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border: 3px solid var(--ss-primary-blue);
    border: none;
  }
</style>