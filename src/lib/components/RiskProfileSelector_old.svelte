<script lang="ts">
  import type { RiskProfile } from '$lib/types';
  
  export let selected: RiskProfile;
  
  const profiles = [
    {
      value: 'safe' as const,
      label: 'Säker',
      description: 'Väljer statistiska favoriter',
      color: 'green'
    },
    {
      value: 'balanced' as const,
      label: 'Balanserad',
      description: 'Blandar favoriter och värdetips',
      color: 'blue'
    },
    {
      value: 'risky' as const,
      label: 'Riskabel',
      description: 'Satsar på höga odds underdog',
      color: 'red'
    }
  ];
</script>

<div class="space-y-3">
  {#each profiles as profile}
    <button
      class="w-full p-4 rounded-lg transition-all duration-200 text-left border-2 {
        selected === profile.value
          ? getSelectedStyle(profile.color)
          : 'ss-card border-gray-200 hover:border-gray-300 hover:shadow-md'
      }"
      on:click={() => selected = profile.value}
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-4 h-4 rounded-full {getColorDot(profile.color)}"></div>
          <div>
            <div class="ss-body font-semibold text-gray-800">{profile.label}</div>
            <div class="ss-body-small text-gray-600">{profile.description}</div>
          </div>
        </div>
        {#if selected === profile.value}
          <div class="w-5 h-5 rounded-full bg-current flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
        {/if}
      </div>
    </button>
  {/each}
</div>
      class="w-full p-4 rounded-lg border-2 transition-all duration-200 text-left {
        selected === profile.value
          ? 'border-white bg-white/20 text-white'
          : 'border-white/20 hover:border-white/40 text-blue-100 hover:text-white'
      }"
      on:click={() => selected = profile.value}
    >
      <div class="flex items-center space-x-3">
        <div class="w-4 h-4 rounded-full {
          profile.color === 'green' ? 'bg-green-500' :
          profile.color === 'blue' ? 'bg-blue-500' :
          'bg-red-500'
        }"></div>
        <div class="flex-1">
          <div class="font-bold text-lg">{profile.label}</div>
          <div class="text-sm opacity-80">{profile.description}</div>
        </div>
        {#if selected === profile.value}
          <div class="w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        {/if}
      </div>
    </button>
  {/each}
</div>

<div class="mt-4 p-3 rounded-lg bg-white/10 text-blue-100 text-sm">
  <div class="font-medium mb-1">Nuvarande val:</div>
  <div class="opacity-90">
    {profiles.find(p => p.value === selected)?.description}
  </div>
</div>