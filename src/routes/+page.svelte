<script lang="ts">
  import type { PageData } from './$types';
  import type { MatchWithOdds, GeneratedRow, RiskProfile, GeneratorConfig, GeneratedSystem } from '$lib/types';
  import type { SYSTEM_PRESETS, SystemConfiguration } from '$lib/types/system';
  import '$lib/utils/mockDataGenerator.js'; // Initialize mock data in development
  import MatchTable from '$lib/components/MatchTable.svelte';
  import RiskProfileSelector from '$lib/components/RiskProfileSelector.svelte';
  import SystemConfigSelector from '$lib/components/SystemConfigSelector.svelte';
  import StryktipsetGrid from '$lib/components/StryktipsetGrid.svelte';
  import SystemFooter from '$lib/components/SystemFooter.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { supabase } from '$lib/supabase';
  
  export let data: PageData;
  
  let matches: MatchWithOdds[] = data.matches;
  let generatedSystem: GeneratedSystem | null = null;
  let isGenerating = false;
  let isGenerationAvailable = true;
  
  let riskProfile: RiskProfile = 'balanced';
  let selectedSystemType: keyof typeof SYSTEM_PRESETS = 'system-96';
  let currentSystemConfig: SystemConfiguration | undefined = undefined;

  $: if (riskProfile || currentSystemConfig) {
    generatedSystem = null;
  }

  // System generation is always available now (no artificial throttling)
  $: isGenerationAvailable = true;
  
  async function generateSystem() {
    isGenerating = true;
    try {
      const response = await fetch('/api/generate-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemConfig: currentSystemConfig,
          riskProfile
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        generatedSystem = result.system;
        
        // Automatically save the generated system to Supabase
        try {
          const { data: savedSystem, error } = await supabase
            .from('generated_systems')
            .insert([
              {
                risk_profile: riskProfile,
                total_rows: result.system.configuration?.totalRows || 0,
                cost: result.system.configuration?.cost || 0,
                cost_per_row: 1,
                description: result.system.configuration?.description || '',
                system_data: result.system,
                original_odds: matches, // Store original match odds
                intelligence_data: result.intelligenceData || null,
                status: 'pending'
              }
            ])
            .select()
            .single();

          if (error) {
            console.error('Error saving system to Supabase:', error);
          } else {
            console.log('System automatically saved to Supabase:', savedSystem.id);
          }
        } catch (error) {
          console.error('Error saving system to database:', error);
        }
      } else {
        alert(result.error || 'Misslyckades att generera system');
      }
    } catch (error) {
      console.error('Error generating system:', error);
      alert('Misslyckades att generera system');
    } finally {
      isGenerating = false;
    }
  }
  
  function handleSystemUpdate(event: any) {
    if (generatedSystem) {
      generatedSystem = {
        ...generatedSystem,
        matches: event.detail.matches
      };
    }
  }
</script>

<div class="min-h-screen ss-gradient-bg">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="text-center mb-8">
            <!-- Navigation -->
            <div class="flex justify-center space-x-4 mb-8">
                <a href="/system-history" 
                   class="inline-flex items-center px-6 py-3 ss-button-secondary bg-white/10 border-blue-400 text-blue-100 hover:bg-blue-400 hover:text-white transition-all duration-200 backdrop-blur-sm">
                    <span class="font-semibold">Systemhistorik</span>
                    <span class="ml-2 ss-caption bg-blue-500/30 px-2 py-1 rounded">Historik</span>
                </a>
                <a href="/mattes-tankar" 
                   class="inline-flex items-center px-6 py-3 ss-button-secondary bg-white/10 border-purple-400 text-purple-100 hover:bg-purple-400 hover:text-white transition-all duration-200 backdrop-blur-sm">
                    <span class="font-semibold">Dalles Tankar</span>
                    <span class="ml-2 ss-caption bg-purple-500/30 px-2 py-1 rounded">Veckans Tips</span>
                </a>
            </div>

            <!-- Main Title Section -->
            <div class="ss-glass-effect rounded-2xl p-8 mx-auto max-w-4xl">
                <div class="flex items-center justify-center space-x-6 mb-4">
                    <img src="/images/bongen.png" alt="BongBosse Logo" class="w-20 h-20 md:w-24 md:h-24" />
                    <div class="text-left">
                        <h1 class="ss-heading-1 text-white font-bold mb-2">Bong Bosse</h1>
                        <p class="ss-body text-blue-100">Låt Bosse fixa bongen</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid lg:grid-cols-4 gap-8">
            <!-- Left Column: Configuration -->
            <div class="lg:col-span-1 space-y-6">
                <!-- Risk Profile -->
                <div class="ss-glass-effect rounded-xl p-6">
                    <h2 class="ss-heading-2 text-white mb-4 flex items-center space-x-2">
                        <Icon name="settings" size={20} className="text-blue-300" />
                        <span>Riskprofil</span>
                    </h2>
                    <RiskProfileSelector bind:selected={riskProfile} />
                </div>

                <!-- System Configuration -->
                <SystemConfigSelector 
                    bind:selectedSystem={selectedSystemType} 
                    bind:currentSystemConfig={currentSystemConfig} 
                />

                <!-- Generate Button -->
                <button 
                    on:click={generateSystem}
                    disabled={isGenerating || !isGenerationAvailable}
                    class="w-full ss-button-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {#if isGenerating}
                        Genererar system...
                    {:else if !isGenerationAvailable}
                        🔒 System låst (Mån-Ons)
                    {:else}
                        Generera system
                    {/if}
                </button>
                
                {#if !isGenerationAvailable}
                    <div class="text-center text-sm text-blue-300 mt-2">
                        System kan genereras: Tor-Lör
                    </div>
                {/if}
            </div>
            
            <!-- Center Columns: Matches & System View -->
            <div class="lg:col-span-3">
                {#if generatedSystem}
                    <!-- Stryktipset Grid View -->
                    <div class="space-y-6">
                        <StryktipsetGrid {generatedSystem} editable={true} on:systemUpdated={handleSystemUpdate} />
                    </div>
                {:else}
                    <!-- Matches Preview -->
                    <div class="ss-glass-effect rounded-xl p-6">
                        <h2 class="ss-heading-2 text-white mb-4 flex items-center space-x-2">
                            <Icon name="game-soccer" size={20} className="text-blue-300" />
                            <span>Denna Veckans Matcher</span>
                        </h2>
                        <MatchTable {matches} />
                    </div>
                {/if}
            </div>
        </div>
    </div>
    
    <!-- System Footer -->
    <SystemFooter />
</div>
