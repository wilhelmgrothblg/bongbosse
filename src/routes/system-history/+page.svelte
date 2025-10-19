<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase, type GeneratedSystem as SupabaseGeneratedSystem } from '$lib/supabase';

  let systems: SupabaseGeneratedSystem[] = [];
  let loading = true;
  let error: string | null = null;
  let selectedWeek = 'current'; // 'current', 'all', or specific week like '2025-42'
  let availableWeeks: string[] = [];

  // Get current week in YYYY-WW format
  function getCurrentWeek(): string {
    const now = new Date();
    const year = now.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-${weekNumber.toString().padStart(2, '0')}`;
  }

  // Get week from date string
  function getWeekFromDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-${weekNumber.toString().padStart(2, '0')}`;
  }

  // Format week for display
  function formatWeek(weekString: string): string {
    const [year, week] = weekString.split('-');
    return `Vecka ${week}, ${year}`;
  }

  // Filter systems based on selected week
  $: filteredSystems = (() => {
    if (selectedWeek === 'all') {
      return systems;
    } else if (selectedWeek === 'current') {
      const currentWeek = getCurrentWeek();
      // For current week, show:
      // 1. All pending systems (regardless of creation date)
      // 2. Completed systems created this week
      return systems.filter(s => 
        s.status === 'pending' || 
        (s.status === 'completed' && getWeekFromDate(s.created_at || '') === currentWeek)
      );
    } else {
      // For historical weeks, show systems created in that week
      return systems.filter(s => getWeekFromDate(s.created_at || '') === selectedWeek);
    }
  })();

  $: sortedSystems = filteredSystems.sort((a, b) => {
    // First sort by completed status, then by profit/loss
    if (a.status === 'completed' && b.status !== 'completed') return -1;
    if (a.status !== 'completed' && b.status === 'completed') return 1;
    
    if (a.status === 'completed' && b.status === 'completed') {
      const profitA = a.profit_loss || 0;
      const profitB = b.profit_loss || 0;
      return profitB - profitA; // Highest profit first
    }
    
    // For non-completed, sort by creation date (newest first)
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  $: topPerformers = filteredSystems
    .filter(s => s.status === 'completed' && (s.profit_loss || 0) > 0)
    .sort((a, b) => (b.profit_loss || 0) - (a.profit_loss || 0))
    .slice(0, 3);

  onMount(async () => {
    await loadSystems();
  });

  async function loadSystems() {
    loading = true;
    error = null;
    
    try {
      // Check if Supabase is configured
      if (!supabase) {
        error = 'Databasanslutning inte konfigurerad';
        console.error('Supabase client not initialized');
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from('generated_systems')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        error = 'Databasfel: ' + supabaseError.message;
        console.error('Supabase error:', supabaseError);
      } else {
        systems = data || [];
        
        // Extract available weeks from systems
        const weeks = new Set<string>();
        systems.forEach(system => {
          if (system.created_at) {
            const week = getWeekFromDate(system.created_at);
            weeks.add(week);
          }
        });
        availableWeeks = Array.from(weeks).sort().reverse(); // Most recent first
        
        console.log('Loaded systems:', systems.length);
        console.log('Available weeks:', availableWeeks);
      }
    } catch (err) {
      error = 'Ett oväntat fel uppstod vid laddning av systemhistorik';
      console.error('Unexpected error loading systems:', err);
    } finally {
      loading = false;
    }
  }

  function formatDate(dateString: string): string {
    if (!dateString) return 'Okänt datum';
    return new Date(dateString).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Function to reset a system back to pending (for testing cleanup)
  async function resetSystemToPending(systemId: string) {
    try {
      const { error } = await supabase
        .from('generated_systems')
        .update({
          status: 'pending',
          actual_correct: null,
          actual_payout: null,
          profit_loss: null,
          roi: null
        })
        .eq('id', systemId);

      if (error) {
        console.error('Error resetting system:', error);
        alert('Fel vid återställning av system');
      } else {
        // Reload systems to reflect changes
        await loadSystems();
        alert('System återställt till väntande status');
      }
    } catch (error) {
      console.error('Error resetting system:', error);
      alert('Ett fel uppstod vid återställning');
    }
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
      <h1 class="text-4xl font-bold text-gray-800 mb-4">📊 Systemhistorik</h1>
      <p class="text-lg text-gray-600">Översikt över alla dina genererade system och deras prestanda</p>
    </div>

    <!-- Week Filter -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-800 mb-2">Filtrera efter vecka</h2>
          <p class="text-sm text-gray-600">Visa system för en specifik vecka eller alla system</p>
        </div>
        
        <div class="flex flex-wrap gap-2">
          <button 
            on:click={() => selectedWeek = 'current'}
            class="px-4 py-2 rounded-lg transition-colors {selectedWeek === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            📅 Aktuell vecka
          </button>
          
          <button 
            on:click={() => selectedWeek = 'all'}
            class="px-4 py-2 rounded-lg transition-colors {selectedWeek === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          >
            📋 Alla system
          </button>
          
          {#if availableWeeks.length > 0}
            <select 
              bind:value={selectedWeek}
              class="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-gray-400 transition-colors"
            >
              <option value="current">Aktuell vecka</option>
              <option value="all">Alla system</option>
              <optgroup label="Historiska veckor">
                {#each availableWeeks as week}
                  <option value={week}>{formatWeek(week)}</option>
                {/each}
              </optgroup>
            </select>
          {/if}
        </div>
      </div>
      
      <!-- Current Selection Info -->
      <div class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div class="text-sm text-gray-600">
            {#if selectedWeek === 'current'}
              Visar: Väntande system + system från {formatWeek(getCurrentWeek())}
            {:else if selectedWeek === 'all'}
              Visar: Alla system ({systems.length} totalt)
            {:else}
              Visar: System från {formatWeek(selectedWeek)}
            {/if}
          </div>
          <div class="text-sm font-medium text-gray-800">
            {filteredSystems.length} system visas
          </div>
        </div>
      </div>
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
    {:else if filteredSystems.length === 0}
      <!-- Empty State -->
      <div class="bg-white rounded-lg shadow-lg p-8 text-center">
        <div class="text-gray-400 text-6xl mb-4">
          {#if selectedWeek === 'all'}
            📋
          {:else if selectedWeek === 'current'}
            📅
          {:else}
            📊
          {/if}
        </div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">
          {#if selectedWeek === 'all'}
            Inga system än
          {:else if selectedWeek === 'current'}
            Inga system denna vecka
          {:else}
            Inga system för {formatWeek(selectedWeek)}
          {/if}
        </h3>
        <p class="text-gray-600 mb-4">
          {#if selectedWeek === 'all'}
            Du har inte genererat några system ännu. Gå till startsidan för att skapa ditt första system!
          {:else if selectedWeek === 'current'}
            Du har inte genererat några system för aktuell vecka än. Skapa ett nytt system eller välj en annan vecka.
          {:else}
            Inga system hittades för denna vecka. Prova att välja en annan vecka eller skapa nya system.
          {/if}
        </p>
        <div class="flex gap-3 justify-center">
          <a 
            href="/"
            class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Skapa system
          </a>
          {#if selectedWeek !== 'all'}
            <button
              on:click={() => selectedWeek = 'all'}
              class="inline-block bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Visa alla system
            </button>
          {/if}
        </div>
      </div>
    {:else}
      <!-- Top Performers Section -->
      {#if topPerformers.length > 0}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span class="text-yellow-500 mr-2">🏆</span>
            Bästa Presterande System
          </h2>
          <div class="grid gap-4 md:grid-cols-3">
            {#each topPerformers as system, index}
              <div class="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg shadow-lg p-6 relative">
                <!-- Trophy Badge -->
                <div class="absolute -top-3 -right-3 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                
                <!-- System Header -->
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-lg font-bold text-gray-800">
                      System #{system.id}
                    </h3>
                    <p class="text-sm text-gray-600">
                      {formatDate(system.created_at || '')}
                    </p>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-600">Kostnad</div>
                    <div class="text-lg font-bold text-blue-600">{system.cost} kr</div>
                  </div>
                </div>

                <!-- Performance Highlight -->
                <div class="bg-white rounded-lg p-4 mb-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-600">Vinst:</span>
                    <span class="font-bold text-xl text-green-600">
                      +{(system.profit_loss || 0).toLocaleString()} kr
                    </span>
                  </div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-600">ROI:</span>
                    <span class="font-bold text-lg text-green-600">
                      +{(system.roi || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">Rätt tips:</span>
                    <span class="font-medium">{system.actual_correct}/{system.system_data?.matches?.length || 'N/A'}</span>
                  </div>
                </div>

                <!-- Quick Stats -->
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div class="text-center bg-gray-50 rounded p-2">
                    <div class="font-semibold text-gray-800">{system.total_rows}</div>
                    <div class="text-gray-600">rader</div>
                  </div>
                  <div class="text-center bg-gray-50 rounded p-2">
                    <div class="font-semibold text-gray-800 capitalize">{system.risk_profile}</div>
                    <div class="text-gray-600">risk</div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else if filteredSystems.filter(s => s.status === 'completed').length > 0}
        <!-- No Winners Message (when there are completed systems but no winners) -->
        <div class="mb-8">
          <div class="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-lg shadow-lg p-8 text-center">
            <div class="text-6xl mb-4">😔</div>
            <h2 class="text-2xl font-bold text-gray-700 mb-4">Inga Vinnande System</h2>
            <p class="text-gray-600 mb-4">
              Tyvärr gick inget av de {filteredSystems.filter(s => s.status === 'completed').length} beräknade systemen med vinst 
              {#if selectedWeek === 'all'}
                totalt.
              {:else if selectedWeek === 'current'}
                denna vecka.
              {:else}
                för {formatWeek(selectedWeek)}.
              {/if}
            </p>
            <p class="text-sm text-gray-500">
              Fortsätt generera fler system och lycka till nästa gång! 🍀
            </p>
          </div>
        </div>
      {/if}

      <!-- Systems Grid -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          {#if selectedWeek === 'all'}
            Alla System
          {:else if selectedWeek === 'current'}
            System för Aktuell Vecka
          {:else}
            System för {formatWeek(selectedWeek)}
          {/if}
        </h2>
        <div class="text-sm text-gray-600">
          Sorterat efter prestanda och status
        </div>
      </div>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each sortedSystems as system}
          <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow {(system.profit_loss || 0) > 0 ? 'ring-2 ring-green-200' : (system.profit_loss || 0) < 0 ? 'ring-2 ring-red-200' : ''}">
            <!-- System Header -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                  System #{system.id}
                  {#if (system.profit_loss || 0) > 0}
                    <span class="ml-2 text-green-500">✨</span>
                  {/if}
                </h3>
                <p class="text-sm text-gray-500">
                  {formatDate(system.created_at || '')}
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
                
                <!-- Reset button for completed systems (for cleanup) -->
                <div class="mt-3 pt-3 border-t border-gray-100">
                  <button
                    on:click={() => resetSystemToPending(system.id)}
                    class="w-full text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    title="Återställ till väntande status (för felsökning)"
                  >
                    🔄 Återställ till väntande
                  </button>
                </div>
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
      <div class="mt-12 grid gap-6 md:grid-cols-4">
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="text-3xl font-bold text-blue-600 mb-2">{filteredSystems.length}</div>
          <div class="text-gray-600">
            {#if selectedWeek === 'all'}
              Totalt antal system
            {:else if selectedWeek === 'current'}
              System denna vecka
            {:else}
              System {formatWeek(selectedWeek)}
            {/if}
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="text-3xl font-bold text-green-600 mb-2">
            {filteredSystems.reduce((sum, s) => sum + s.cost, 0).toLocaleString()} kr
          </div>
          <div class="text-gray-600">Investering</div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="text-3xl font-bold text-purple-600 mb-2">
            {filteredSystems.filter(s => s.status === 'completed').length}
          </div>
          <div class="text-gray-600">Slutförda system</div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="text-3xl font-bold text-yellow-600 mb-2">
            {filteredSystems.filter(s => s.status === 'completed' && (s.profit_loss || 0) > 0).length}
          </div>
          <div class="text-gray-600">Vinnande system</div>
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