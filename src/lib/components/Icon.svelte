<script lang="ts">
  export let name: string;
  export let size: number = 24;
  export let className: string = '';
  
  // Professional icons following Svenska Spel's design principles:
  // - Geometric shapes
  // - Clean lines
  // - Consistent stroke width
  // - No fills, only outlines
  const icons: Record<string, string> = {
    'statistics': `
      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    `,
    'odds': `
      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    `,
    'tips': `
      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
    `,
    'settings': `
      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    `,
    'info': `
      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    `,
    'calendar': `
      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    `,
    'systemspel': `
      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM9 16h6M9 12h6"/>
    `,
    'game-soccer': `
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            d="M12 2v4m0 12v4M2 12h4m12 0h4M6.343 6.343l2.829 2.829M14.828 14.828l2.829 2.829M6.343 17.657l2.829-2.829M14.828 9.172l2.829-2.829"/>
    `,
    'arrow-right': `
      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            d="M13 7l5 5m0 0l-5 5m5-5H6"/>
    `
  };
</script>

<svg 
  width={size} 
  height={size} 
  viewBox="0 0 24 24" 
  fill="none" 
  class={className}
  aria-hidden="true"
>
  {#if icons[name]}
    {@html icons[name]}
  {:else}
    <!-- Fallback for unknown icons -->
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
    <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
          d="M12 8v4m0 4h.01"/>
  {/if}
</svg>