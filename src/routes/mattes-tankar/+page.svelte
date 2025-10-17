<script lang="ts">
  import type { PageData } from './$types';
  import type { MatchWithOdds } from '$lib/types';
  
  export let data: PageData;
  
  let matches: MatchWithOdds[] = data.matches;
  
  // Matte's weekly analysis
  const weeklyThoughts = {
    title: "Dalles tankar - Vecka 42, 2025",
    intro: "Här delar jag mina personliga tankar om veckans Stryktipset och hur jag skulle spela.",
    keyInsights: [
      {
        title: "Arsenal på bortaplan",
        content: "Arsenal har visat stark form på bortaplan denna säsong. Trots att de möter Fulham hemma, ser jag värde i tvåan eller helgardering 2X.",
        confidence: "Hög"
      },
      {
        title: "Manchester Citys dominans",
        content: "City mot Everton är veckans säkraste match. Everton har förlorat sina senaste fyra bortamatcher och City är nästan omöjligt att slå hemma.",
        confidence: "Mycket hög"
      },
      {
        title: "Brighton övervärderade",
        content: "Brighton får för mycket respekt av spelarna. Newcastle har bättre individuell kvalitet och motivation efter senaste veckans förlust.",
        confidence: "Medel"
      }
    ],
    mattesPicks: [
      { match: "Fulham - Arsenal", pick: "2X", reason: "Arsenal för stark på bortaplan" },
      { match: "Brighton - Newcastle", pick: "X2", reason: "Newcastle undervärderat" },
      { match: "Manchester City - Everton", pick: "1", reason: "City dominerar hemma" },
      { match: "Liverpool - Chelsea", pick: "1X", reason: "Jämn match, Liverpool hemmaplan" },
      { match: "Tottenham - West Ham", pick: "1", reason: "Tottenham revanschsugen" }
    ],
    systemStrategy: "Denna vecka kör jag ett 96-radssystem med fokus på säkra ettor och strategiska helgarderingar på de jämnare matcherna. Brighton-Newcastle och Arsenal-matchen är mina nyckelgarderingar."
  };
</script>

<svelte:head>
  <title>Dalle Tankar - BongBosse Stryktipset</title>
  <meta name="description" content="Dalles personliga analys och tips för veckans Stryktipset" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
  <!-- Header -->
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <a href="/" class="text-blue-200 hover:text-white transition-colors">
        ← Tillbaka till huvudsidan
      </a>
      <div class="text-center">
        <div class="flex items-center justify-center space-x-3 mb-2">
          <!-- Logo space -->
          <!-- <img src="/images/logo.png" alt="BongBosse Logo" class="w-8 h-8" /> -->
          <h1 class="text-4xl font-bold text-white">Dalles Tankar</h1>
        </div>
        <p class="text-blue-200">Experttips och analys för veckans Stryktipset</p>
      </div>
      <div></div>
    </div>

    <!-- Weekly Analysis -->
    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
      <h2 class="text-2xl font-bold text-white mb-4">{weeklyThoughts.title}</h2>
      <p class="text-blue-100 mb-6">{weeklyThoughts.intro}</p>

      <!-- Key Insights -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {#each weeklyThoughts.keyInsights as insight}
          <div class="bg-white/5 rounded-lg p-4 border border-white/10">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-white">{insight.title}</h3>
              <span class="text-xs px-2 py-1 rounded-full {
                insight.confidence === 'Mycket hög' ? 'bg-green-600/30 text-green-200' :
                insight.confidence === 'Hög' ? 'bg-blue-600/30 text-blue-200' :
                'bg-yellow-600/30 text-yellow-200'
              }">
                {insight.confidence}
              </span>
            </div>
            <p class="text-blue-100 text-sm">{insight.content}</p>
          </div>
        {/each}
      </div>

      <!-- Matte's Picks -->
      <div class="mb-8">
        <h3 class="text-xl font-bold text-white mb-4">Dalles Personliga Tips</h3>
        <div class="grid gap-3">
          {#each weeklyThoughts.mattesPicks as pick}
            <div class="bg-white/5 rounded-lg p-4 flex items-center justify-between">
              <div>
                <span class="font-medium text-white">{pick.match}</span>
                <p class="text-blue-200 text-sm">{pick.reason}</p>
              </div>
              <div class="text-right">
                <span class="text-lg font-bold text-green-300">{pick.pick}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- System Strategy -->
      <div class="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-6 border border-purple-400/30">
        <h3 class="text-xl font-bold text-white mb-3">Systemstrategi</h3>
        <p class="text-blue-100">{weeklyThoughts.systemStrategy}</p>
      </div>
    </div>

    <!-- Current Week's Matches Preview -->
    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <h3 class="text-xl font-bold text-white mb-4">Veckans Matcher - Översikt</h3>
      <div class="grid gap-3">
        {#each matches.slice(0, 5) as match, index}
          <div class="bg-white/5 rounded-lg p-4 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <span class="text-blue-300 font-medium">#{index + 1}</span>
              <div>
                <div class="font-medium text-white">{match.home} - {match.away}</div>
                <div class="text-xs text-blue-200">
                  {#if match.svenskaSpelData?.svenskaFolket}
                    Svenska Folket: {match.svenskaSpelData.svenskaFolket.home}% | {match.svenskaSpelData.svenskaFolket.draw}% | {match.svenskaSpelData.svenskaFolket.away}%
                  {/if}
                </div>
              </div>
            </div>
            <div class="flex space-x-2 text-sm">
              <span class="text-green-300">{match.odds.home}</span>
              <span class="text-yellow-300">{match.odds.draw}</span>
              <span class="text-red-300">{match.odds.away}</span>
            </div>
          </div>
        {/each}
      </div>
      
      <div class="mt-6 text-center">
        <a href="/" class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Se alla matcher och generera system →
        </a>
      </div>
    </div>
  </div>
</div>