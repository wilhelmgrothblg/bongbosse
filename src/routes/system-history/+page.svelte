<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase, type GeneratedSystem as SupabaseGeneratedSystem } from '$lib/supabase';

  let systems: SupabaseGeneratedSystem[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    await loadSystems();
  });

  async function loadSystems() {
    loading = true;
    try {
      const { data, error: supabaseError } = await supabase
        .from('generated_systems')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        error = 'Kunde inte ladda systemhistorik: ' + supabaseError.message;
        console.error('Error loading systems:', supabaseError);
      } else {
        systems = data || [];
      }
    } catch (err) {
      error = 'Ett fel uppstod vid laddning av systemhistorik';
      console.error('Error loading systems:', err);
    } finally {
      loading = false;
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<svelte:head>
  <title>Systemhistorik - Bongbosse</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  <div class="container mx-auto px-4 py-8">
    <!-- Navigation -->
    <div class="flex justify-between items-center mb-8">
      <a 
        href="/"
        class="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        <span>Tillbaka till systemgenerator</span>
      </a>
      
      <button 
        on:click={loadSystems}
        class="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <span>Uppdatera</span>
      </button>
    </div>

    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">Systemhistorik</h1>
      <p class="text-lg text-gray-600">Här hittar du alla dina genererade system och deras prestanda</p>
    </div>

    <!-- Loading State -->
    {#if loading}
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Laddar systemhistorik...</span>
      </div>
    {:else if error}
      <!-- Error State -->
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div class="text-red-600 text-lg font-semibold mb-2">Ett fel uppstod</div>
        <p class="text-red-700">{error}</p>
        <button 
          on:click={loadSystems}
          class="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Försök igen
        </button>
      </div>
    {:else if systems.length === 0}
      <!-- Empty State -->
      <div class="bg-white rounded-lg shadow-lg p-8 text-center">
        <div class="text-gray-400 text-6xl mb-4">📋</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Inga system än</h3>
        <p class="text-gray-600 mb-4">Du har inte genererat några system ännu. Gå till startsidan för att skapa ditt första system!</p>
        <a 
          href="/"
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Skapa system
        </a>
      </div>
    {:else}
      <!-- Systems Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each systems as system}
          <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <!-- System Header -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-800">
                  System #{system.id}
                </h3>
                <p class="text-sm text-gray-500">
                  {formatDate(system.created_at)}
                </p>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-600">Kostnad</div>
                <div class="text-lg font-bold text-blue-600">{system.cost} kr</div>
              </div>
            </div>

            <!-- System Details -->
            <div class="space-y-2 mb-4">
              <div class="flex justify-between">
                <span class="text-gray-600">Riskprofil:</span>
                <span class="font-medium capitalize">{system.risk_profile}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Antal rader:</span>
                <span class="font-medium">{system.total_rows}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Kostnad per rad:</span>
                <span class="font-medium">{system.cost_per_row || 1} kr</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Status:</span>
                <span class="font-medium capitalize {system.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}">{system.status === 'completed' ? 'Slutfört' : 'Pågående'}</span>
              </div>
              {#if system.description}
                <div class="flex justify-between">
                  <span class="text-gray-600">Beskrivning:</span>
                  <span class="font-medium text-sm">{system.description}</span>
                </div>
              {/if}
            </div>

            <!-- Performance Metrics -->
            {#if system.profit_loss !== null && system.profit_loss !== undefined}
              <div class="border-t pt-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-600">Vinst/Förlust:</span>
                  <span class="font-bold text-lg {system.profit_loss > 0 ? 'text-green-600' : 'text-red-600'}">
                    {system.profit_loss > 0 ? '+' : ''}{system.profit_loss.toLocaleString()} kr
                  </span>
                </div>
                {#if system.roi !== null && system.roi !== undefined}
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">ROI:</span>
                    <span class="font-bold {system.profit_loss > 0 ? 'text-green-600' : 'text-red-600'}">
                      {system.roi > 0 ? '+' : ''}{system.roi.toFixed(1)}%
                    </span>
                  </div>
                {/if}
                {#if system.actual_correct !== null && system.actual_correct !== undefined}
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-gray-600">Rätt tips:</span>
                    <span class="font-medium">{system.actual_correct}/{system.system_data?.matches?.length || 'N/A'}</span>
                  </div>
                {/if}
                {#if system.actual_payout !== null && system.actual_payout !== undefined}
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-gray-600">Utbetalning:</span>
                    <span class="font-medium text-green-600">{system.actual_payout.toLocaleString()} kr</span>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="border-t pt-4 text-center">
                <span class="text-gray-500 text-sm">Väntar på matchresultat...</span>
              </div>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Summary Statistics -->
      <div class="mt-12 grid gap-6 md:grid-cols-3">
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="text-3xl font-bold text-blue-600 mb-2">{systems.length}</div>
          <div class="text-gray-600">Totalt antal system</div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="text-3xl font-bold text-green-600 mb-2">
            {systems.reduce((sum, s) => sum + s.cost, 0).toLocaleString()} kr
          </div>
          <div class="text-gray-600">Total investering</div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="text-3xl font-bold text-purple-600 mb-2">
            {systems.filter(s => s.status === 'completed').length}
          </div>
          <div class="text-gray-600">Slutförda system</div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
  }
</style>