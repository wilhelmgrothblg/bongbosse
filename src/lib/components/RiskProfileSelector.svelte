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

  function getSelectedStyle(color: string): string {
    switch (color) {
      case 'green': return 'border-green-500 bg-green-50 ss-text-success';
      case 'blue': return 'border-blue-500 bg-blue-50 ss-text-primary';
      case 'red': return 'border-red-500 bg-red-50 ss-text-error';
      default: return 'border-gray-500 bg-gray-50';
    }
  }

  function getColorDot(color: string): string {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }
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