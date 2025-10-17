<!-- Top Performing Systems Display Component -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { SystemHistoryManager, type SystemPerformance } from '$lib/utils/systemHistory.js';
  
  let topSystems: SystemPerformance[] = [];
  let performanceStats = {
    totalSystems: 0,
    averageROI: 0,
    winRate: 0,
    totalProfit: 0
  };
  let isLoading = true;

  onMount(() => {
    // Simulate loading
    setTimeout(() => {
      isLoading = false;
    }, 500);
  });

  function formatCurrency(amount: number): string {
    return `${amount > 0 ? '+' : ''}${amount} kr`;
  }

  function formatROI(roi: number): string {
    return `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`;
  }

  function formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('sv-SE', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getRiskProfileColor(profile: string): string {
    switch (profile) {
      case 'safe': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'balanced': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'risky': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  }

  function getRiskProfileLabel(profile: string): string {
    switch (profile) {
      case 'safe': return 'Säker';
      case 'balanced': return 'Balanserad';
      case 'risky': return 'Riskfylld';
      default: return profile;
    }
  }
</script>

<div class="top-systems-panel">
  <div class="panel-header">
    <h2 class="panel-title">🏆 Veckans Bästa System</h2>
    <p class="panel-subtitle">De mest lönsamma systemen från senaste veckan</p>
  </div>

  {#if isLoading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Laddar systemresultat...</p>
    </div>
  {:else}
    <div class="empty-state">
      <div class="empty-icon">�</div>
      <h3>Ny och förbättrad datalagring!</h3>
      <p>Vi har uppgraderat till Supabase för bättre prestanda och tillförlitlighet.</p>
      <div class="next-results">
        <p class="text-sm text-blue-300">
          <strong>Fördelar med Supabase:</strong><br>
          ✅ Aldrig mer förlorad data<br>
          ✅ Snabbare laddning<br>
          ✅ Bättre prestanda-statistik<br>
          ✅ Realtidsuppdateringar
        </p>
        <div style="margin-top: 16px;">
          <p class="text-sm text-green-300">
            <strong>📊 Systemhistorik:</strong> Besök systemhistorik-sidan för att se dina sparade system!
          </p>
        </div>
      </div>
    </div>
  {:else}
    <!-- Performance Overview -->
    <div class="performance-overview">
      <div class="stat-card">
        <span class="stat-label">Totalt system</span>
        <span class="stat-value">{performanceStats.totalSystems}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Genomsnittlig avkastning</span>
        <span class="stat-value" class:positive={performanceStats.averageROI > 0} class:negative={performanceStats.averageROI < 0}>
          {formatROI(performanceStats.averageROI)}
        </span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Vinstprocent</span>
        <span class="stat-value">{performanceStats.winRate}%</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Total vinst</span>
        <span class="stat-value" class:positive={performanceStats.totalProfit > 0} class:negative={performanceStats.totalProfit < 0}>
          {formatCurrency(performanceStats.totalProfit)}
        </span>
      </div>
    </div>

    <!-- Top Performing Systems -->
    <div class="top-systems-list">
      {#each topSystems as system, index}
        <div class="system-card" class:winner={system.profitLoss > 0}>
          <div class="system-header">
            <div class="rank-badge">
              <span class="rank-number">#{index + 1}</span>
              {#if index === 0 && system.profitLoss > 0}
                <span class="crown">👑</span>
              {/if}
            </div>
            
            <div class="system-info">
              <div class="system-meta">
                <span class="risk-badge {getRiskProfileColor(system.riskProfile)}">
                  {getRiskProfileLabel(system.riskProfile)}
                </span>
                <span class="system-size">{system.systemSize}</span>
              </div>
              <div class="generation-time">
                Genererad {formatDate(system.generatedDate)}
              </div>
            </div>

            <div class="profit-display">
              <div class="profit-amount" class:positive={system.profitLoss > 0} class:negative={system.profitLoss < 0}>
                {formatCurrency(system.profitLoss)}
              </div>
              <div class="roi-display" class:positive={system.roi > 0} class:negative={system.roi < 0}>
                {formatROI(system.roi)}
              </div>
            </div>
          </div>

          <div class="system-details">
            <div class="detail-item">
              <span class="detail-label">Rätt tips:</span>
              <span class="detail-value">{system.correctPredictions}/{system.totalMatches}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Träffsäkerhet:</span>
              <span class="detail-value">{system.winPercentage.toFixed(1)}%</span>
            </div>
          </div>

          {#if system.profitLoss > 0}
            <div class="success-indicator">
              ✅ Vinnande system!
            </div>
          {:else}
            <div class="loss-indicator">
              ❌ Förlorande system
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <div class="panel-footer">
      <p class="footer-note">
        💡 <strong>Tips:</strong> Säkra system vinner oftare men med lägre vinst. 
        Riskfyllda system har högre vinst men vinner mer sällan.
      </p>
    </div>
  {/if}
</div>

<style>
  .top-systems-panel {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
    border-radius: 16px;
    padding: 24px;
    margin: 20px 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .panel-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .panel-title {
    color: #ffffff;
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
  }

  .panel-subtitle {
    color: #a0a0a0;
    font-size: 14px;
    margin: 0;
  }

  .loading-state {
    text-align: center;
    padding: 40px 20px;
    color: #a0a0a0;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #4ade80;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty-state h3 {
    color: #ffffff;
    font-size: 20px;
    margin: 0 0 8px 0;
  }

  .empty-state p {
    color: #a0a0a0;
    margin: 0 0 16px 0;
  }

  .next-results {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    padding: 12px;
    margin-top: 16px;
  }

  .performance-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
  }

  .stat-label {
    display: block;
    color: #a0a0a0;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .stat-value {
    display: block;
    color: #ffffff;
    font-size: 18px;
    font-weight: 700;
  }

  .stat-value.positive {
    color: #4ade80;
  }

  .stat-value.negative {
    color: #f87171;
  }

  .top-systems-list {
    space-y: 12px;
  }

  .system-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    transition: all 0.3s ease;
  }

  .system-card.winner {
    border-color: rgba(74, 222, 128, 0.3);
    background: rgba(74, 222, 128, 0.05);
  }

  .system-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }

  .system-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
  }

  .rank-badge {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .rank-number {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
  }

  .crown {
    font-size: 16px;
  }

  .system-info {
    flex: 1;
    min-width: 0;
  }

  .system-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .risk-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid;
  }

  .system-size {
    color: #a0a0a0;
    font-size: 11px;
  }

  .generation-time {
    color: #a0a0a0;
    font-size: 12px;
  }

  .profit-display {
    text-align: right;
  }

  .profit-amount {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 2px;
  }

  .profit-amount.positive {
    color: #4ade80;
  }

  .profit-amount.negative {
    color: #f87171;
  }

  .roi-display {
    font-size: 12px;
    font-weight: 600;
  }

  .roi-display.positive {
    color: #4ade80;
  }

  .roi-display.negative {
    color: #f87171;
  }

  .system-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .detail-label {
    color: #a0a0a0;
    font-size: 11px;
    margin-bottom: 2px;
  }

  .detail-value {
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
  }

  .success-indicator {
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.3);
    color: #4ade80;
    padding: 6px 12px;
    border-radius: 6px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
  }

  .loss-indicator {
    background: rgba(248, 113, 113, 0.1);
    border: 1px solid rgba(248, 113, 113, 0.3);
    color: #f87171;
    padding: 6px 12px;
    border-radius: 6px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
  }

  .panel-footer {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .footer-note {
    color: #a0a0a0;
    font-size: 13px;
    text-align: center;
    margin: 0;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .performance-overview {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .system-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    
    .profit-display {
      text-align: left;
    }
    
    .system-details {
      justify-content: space-around;
    }
  }
</style>