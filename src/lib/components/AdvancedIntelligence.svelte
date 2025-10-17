<!-- Advanced System Intelligence Panel for Stryktipset -->
<script lang="ts">
  import type { MatchWithOdds, RiskProfile } from '$lib/types';
  import { EnhancedSystemGenerator, type EnhancedGeneratorConfig, type SystemAnalysis } from '$lib/utils/enhancedsystemgenerator.js';
  import { KellyCriterion, type KellyResult } from '$lib/utils/kellycriterion.js';
  import { MarketAnalyzer, type MarketAnalysisResult } from '$lib/utils/marketanalysis.js';
  import { PatternRecognizer, type PatternAnalysisResult } from '$lib/utils/patternrecognition.js';

  export let matches: MatchWithOdds[] = [];
  export let systemConfig: { riskProfile: RiskProfile; numRows: number } = { riskProfile: 'balanced', numRows: 13 };

  let isAnalyzing = false;
  let analysisResults: {
    kelly?: KellyResult;
    market?: MarketAnalysisResult;
    patterns?: PatternAnalysisResult;
    system?: SystemAnalysis;
  } = {};

  let enhancedConfig: EnhancedGeneratorConfig = {
    riskProfile: 'balanced',
    numRows: 13,
    bankroll: 10000,
    minValueThreshold: 0.03,
    confidenceThreshold: 0.6,
    diversificationLevel: 'medium',
    useMarketIntelligence: true,
    usePatternAnalysis: true,
    useKellyCriterion: true
  };

  let generatedRows: any[] = [];
  let activeTab: 'kelly' | 'market' | 'patterns' | 'system' | 'generated' = 'kelly';

  $: enhancedConfig.riskProfile = systemConfig.riskProfile;
  $: enhancedConfig.numRows = systemConfig.numRows;

  async function runAdvancedAnalysis() {
    if (matches.length === 0) return;
    
    isAnalyzing = true;
    analysisResults = {};

    try {
      // Run individual analyses
      const [kellyResults, marketResults, patternResults] = await Promise.all([
        enhancedConfig.useKellyCriterion ? KellyCriterion.findValueBets(matches, enhancedConfig.bankroll) : null,
        enhancedConfig.useMarketIntelligence ? new MarketAnalyzer().analyzeMarket(matches) : null,
        enhancedConfig.usePatternAnalysis ? new PatternRecognizer().analyzePatterns(matches) : null
      ]);

      analysisResults = {
        kelly: kellyResults || undefined,
        market: marketResults || undefined,
        patterns: patternResults || undefined
      };

      // Generate enhanced system
      const generator = new EnhancedSystemGenerator();
      const { rows, analysis } = await generator.generateEnhancedSystem(matches, enhancedConfig);
      
      generatedRows = rows;
      analysisResults.system = analysis;

    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      isAnalyzing = false;
    }
  }

  function formatPercentage(value: number): string {
    return (value * 100).toFixed(1) + '%';
  }

  function formatCurrency(value: number): string {
    return value.toFixed(0) + ' kr';
  }
</script>

<div class="advanced-intelligence-panel">
  <div class="panel-header">
    <h2>🧠 Advanced System Intelligence</h2>
    <p class="subtitle">Kelly Criterion • Market Analysis • Pattern Recognition</p>
  </div>

  <!-- Configuration Panel -->
  <div class="config-section">
    <h3>Intelligence Configuration</h3>
    <div class="config-grid">
      <div class="config-group">
        <label>
          Bankroll (kr)
          <input type="number" bind:value={enhancedConfig.bankroll} min="1000" max="100000" step="1000" />
        </label>
      </div>
      
      <div class="config-group">
        <label>
          Value Threshold
          <input type="range" bind:value={enhancedConfig.minValueThreshold} min="0.01" max="0.10" step="0.01" />
          <span class="range-value">{formatPercentage(enhancedConfig.minValueThreshold)}</span>
        </label>
      </div>

      <div class="config-group">
        <label>
          Confidence Threshold
          <input type="range" bind:value={enhancedConfig.confidenceThreshold} min="0.3" max="0.9" step="0.1" />
          <span class="range-value">{formatPercentage(enhancedConfig.confidenceThreshold)}</span>
        </label>
      </div>

      <div class="config-group">
        <label>
          Diversification Level
          <select bind:value={enhancedConfig.diversificationLevel}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>
    </div>

    <div class="toggle-section">
      <label class="toggle-label">
        <input type="checkbox" bind:checked={enhancedConfig.useKellyCriterion} />
        <span class="checkmark"></span>
        Kelly Criterion Analysis
      </label>

      <label class="toggle-label">
        <input type="checkbox" bind:checked={enhancedConfig.useMarketIntelligence} />
        <span class="checkmark"></span>
        Market Intelligence
      </label>

      <label class="toggle-label">
        <input type="checkbox" bind:checked={enhancedConfig.usePatternAnalysis} />
        <span class="checkmark"></span>
        Pattern Recognition
      </label>
    </div>

    <button class="analyze-button" on:click={runAdvancedAnalysis} disabled={isAnalyzing || matches.length === 0}>
      {#if isAnalyzing}
        <div class="loading-spinner"></div>
        Analyzing Market Intelligence...
      {:else}
        🚀 Run Advanced Analysis
      {/if}
    </button>
  </div>

  {#if Object.keys(analysisResults).length > 0}
    <!-- Analysis Results Tabs -->
    <div class="results-section">
      <div class="tab-navigation">
        <button class="tab-button" class:active={activeTab === 'kelly'} on:click={() => activeTab = 'kelly'}>
          💰 Kelly Criterion
        </button>
        <button class="tab-button" class:active={activeTab === 'market'} on:click={() => activeTab = 'market'}>
          📊 Market Analysis
        </button>
        <button class="tab-button" class:active={activeTab === 'patterns'} on:click={() => activeTab = 'patterns'}>
          🔍 Pattern Recognition
        </button>
        <button class="tab-button" class:active={activeTab === 'system'} on:click={() => activeTab = 'system'}>
          ⚙️ System Analysis
        </button>
        <button class="tab-button" class:active={activeTab === 'generated'} on:click={() => activeTab = 'generated'}>
          📋 Generated Rows
        </button>
      </div>

      <div class="tab-content">
        {#if activeTab === 'kelly' && analysisResults.kelly}
          <div class="kelly-analysis">
            <h3>Value Betting Opportunities</h3>
            <div class="summary-stats">
              <div class="stat-card">
                <span class="stat-label">Total Value Bets</span>
                <span class="stat-value">{analysisResults.kelly.valueBets.length}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Total Expected Value</span>
                <span class="stat-value positive">{formatPercentage(analysisResults.kelly.totalValue)}</span>
              </div>
            </div>

            {#if analysisResults.kelly.valueBets.length > 0}
              <div class="value-bets-list">
                {#each analysisResults.kelly.valueBets.slice(0, 10) as bet}
                  <div class="value-bet-card">
                    <div class="bet-header">
                      <span class="match-id">{bet.matchId.slice(-6)}</span>
                      <span class="outcome-badge outcome-{bet.outcome}">{bet.outcome}</span>
                      <span class="value positive">+{formatPercentage(bet.value)}</span>
                    </div>
                    <div class="bet-details">
                      <span>Kelly: {formatPercentage(bet.kellyFraction)}</span>
                      <span>Stake: {formatCurrency(bet.recommendedStake)}</span>
                      <span>Confidence: {formatPercentage(bet.confidence)}</span>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="no-results">No value bets found with current threshold settings.</p>
            {/if}
          </div>

        {:else if activeTab === 'market' && analysisResults.market}
          <div class="market-analysis">
            <h3>Market Intelligence Report</h3>
            <div class="summary-stats">
              <div class="stat-card">
                <span class="stat-label">Market Efficiency</span>
                <span class="stat-value">{formatPercentage(analysisResults.market.overallEfficiency)}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Steam Moves</span>
                <span class="stat-value">{analysisResults.market.steamMoves.length}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Market Sentiment</span>
                <span class="stat-value sentiment-{analysisResults.market.marketSentiment}">
                  {analysisResults.market.marketSentiment.toUpperCase()}
                </span>
              </div>
            </div>

            <div class="intelligence-sections">
              {#if analysisResults.market.steamMoves.length > 0}
                <div class="intel-section">
                  <h4>🔥 Steam Moves</h4>
                  {#each analysisResults.market.steamMoves.slice(0, 5) as move}
                    <div class="intel-item">
                      <span class="match-ref">{move.matchId.slice(-6)}</span>
                      <span class="outcome-badge outcome-{move.outcome}">{move.outcome}</span>
                      <span class="direction direction-{move.direction}">{move.direction}</span>
                      <span class="strength strength-{move.strength}">{move.strength}</span>
                      <span class="confidence">{formatPercentage(move.confidence)}</span>
                    </div>
                  {/each}
                </div>
              {/if}

              {#if analysisResults.market.contrarianSignals.length > 0}
                <div class="intel-section">
                  <h4>🎯 Contrarian Signals</h4>
                  {#each analysisResults.market.contrarianSignals.slice(0, 5) as signal}
                    <div class="intel-item">
                      <span class="match-ref">{signal.matchId.slice(-6)}</span>
                      <span class="outcome-badge outcome-{signal.outcome}">{signal.outcome}</span>
                      <span class="action action-{signal.recommendedAction}">{signal.recommendedAction}</span>
                      <span class="public-pct">{Math.round(signal.publicPercentage)}%</span>
                      <span class="strength">{formatPercentage(signal.strength)}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

        {:else if activeTab === 'patterns' && analysisResults.patterns}
          <div class="pattern-analysis">
            <h3>Pattern Recognition Results</h3>
            <div class="summary-stats">
              <div class="stat-card">
                <span class="stat-label">Pattern Strength</span>
                <span class="stat-value">{formatPercentage(analysisResults.patterns.overallPatternStrength)}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Pattern Consistency</span>
                <span class="stat-value">{formatPercentage(analysisResults.patterns.patternConsistency)}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Strong Patterns</span>
                <span class="stat-value">{analysisResults.patterns.matchPatterns.filter(p => p.confidence > 0.7).length}</span>
              </div>
            </div>

            <div class="pattern-sections">
              <div class="pattern-section">
                <h4>🎯 Match Patterns</h4>
                {#each analysisResults.patterns.matchPatterns.slice(0, 8) as pattern}
                  <div class="pattern-item" class:high-confidence={pattern.confidence > 0.7}>
                    <div class="pattern-header">
                      <span class="match-ref">{pattern.matchId.slice(-6)}</span>
                      <span class="outcome-badge outcome-{pattern.recommendedOutcome}">{pattern.recommendedOutcome}</span>
                      <span class="confidence">{formatPercentage(pattern.confidence)}</span>
                    </div>
                    <div class="pattern-details">
                      <div class="primary-pattern">{pattern.primaryPattern}</div>
                      {#if pattern.supportingFactors.length > 0}
                        <div class="supporting-factors">
                          ✓ {pattern.supportingFactors.slice(0, 2).join(' • ')}
                        </div>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>

        {:else if activeTab === 'system' && analysisResults.system}
          <div class="system-analysis">
            <h3>System Performance Analysis</h3>
            <div class="summary-stats">
              <div class="stat-card" class:positive={analysisResults.system.totalExpectedValue > 0}>
                <span class="stat-label">Total Expected Value</span>
                <span class="stat-value">{analysisResults.system.totalExpectedValue.toFixed(3)}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Average Confidence</span>
                <span class="stat-value">{formatPercentage(analysisResults.system.avgConfidence)}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Diversification Score</span>
                <span class="stat-value">{formatPercentage(analysisResults.system.diversificationScore)}</span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Kelly Optimization</span>
                <span class="stat-value">{formatPercentage(analysisResults.system.kellyOptimization)}</span>
              </div>
            </div>

            <div class="system-feedback">
              {#if analysisResults.system.recommendations.length > 0}
                <div class="feedback-section recommendations">
                  <h4>✅ Recommendations</h4>
                  {#each analysisResults.system.recommendations as rec}
                    <div class="feedback-item">{rec}</div>
                  {/each}
                </div>
              {/if}

              {#if analysisResults.system.warnings.length > 0}
                <div class="feedback-section warnings">
                  <h4>⚠️ Warnings</h4>
                  {#each analysisResults.system.warnings as warning}
                    <div class="feedback-item">{warning}</div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

        {:else if activeTab === 'generated' && generatedRows.length > 0}
          <div class="generated-rows">
            <h3>Enhanced System Rows</h3>
            <div class="rows-container">
              {#each generatedRows.slice(0, 10) as row, index}
                <div class="row-card" class:kelly-optimal={row.kellyOptimal}>
                  <div class="row-header">
                    <span class="row-number">Row {index + 1}</span>
                    <span class="intelligence-score">IQ: {(row.intelligenceScore * 100).toFixed(0)}</span>
                    {#if row.kellyOptimal}
                      <span class="kelly-badge">KELLY ✓</span>
                    {/if}
                  </div>
                  <div class="row-outcomes">
                    {#each row.outcomes as outcome, i}
                      <span class="outcome-cell outcome-{outcome}">{outcome}</span>
                    {/each}
                  </div>
                  <div class="row-stats">
                    <span>Expected: {row.expectedCorrect.toFixed(1)}</span>
                    <span>Payout: {row.expectedPayout.toFixed(1)}x</span>
                    {#if row.patternStrength}
                      <span>Pattern: {formatPercentage(row.patternStrength)}</span>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .advanced-intelligence-panel {
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

  .panel-header h2 {
    color: #ffffff;
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
  }

  .subtitle {
    color: #a0a0a0;
    font-size: 14px;
    margin: 0;
  }

  .config-section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .config-section h3 {
    color: #ffffff;
    margin: 0 0 16px 0;
    font-size: 18px;
  }

  .config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .config-group label {
    display: flex;
    flex-direction: column;
    color: #ffffff;
    font-size: 14px;
    gap: 6px;
  }

  .config-group input, .config-group select {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 8px 12px;
    color: #ffffff;
    font-size: 14px;
  }

  .config-group input[type="range"] {
    padding: 0;
  }

  .range-value {
    color: #4ade80;
    font-weight: 600;
    font-size: 12px;
  }

  .toggle-section {
    display: flex;
    gap: 20px;
    margin: 16px 0;
    flex-wrap: wrap;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    color: #ffffff;
    cursor: pointer;
    gap: 8px;
  }

  .checkmark {
    width: 18px;
    height: 18px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    position: relative;
  }

  input[type="checkbox"]:checked + .checkmark {
    background: #4ade80;
    border-color: #4ade80;
  }

  input[type="checkbox"]:checked + .checkmark::after {
    content: '✓';
    position: absolute;
    top: -2px;
    left: 3px;
    color: white;
    font-size: 12px;
    font-weight: bold;
  }

  input[type="checkbox"] {
    display: none;
  }

  .analyze-button {
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
  }

  .analyze-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(74, 222, 128, 0.3);
  }

  .analyze-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .tab-navigation {
    display: flex;
    gap: 2px;
    margin-bottom: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 4px;
  }

  .tab-button {
    flex: 1;
    padding: 12px 16px;
    background: transparent;
    border: none;
    color: #a0a0a0;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .tab-button.active {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  .summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
  }

  .stat-card.positive {
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.3);
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

  .value-bet-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
  }

  .bet-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .bet-details {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #a0a0a0;
  }

  .outcome-badge {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }

  .outcome-badge.outcome-1 { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
  .outcome-badge.outcome-X { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
  .outcome-badge.outcome-2 { background: rgba(239, 68, 68, 0.2); color: #f87171; }

  .outcome-cell {
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 12px;
    margin: 1px;
  }

  .outcome-cell.outcome-1 { background: #22c55e; color: white; }
  .outcome-cell.outcome-X { background: #3b82f6; color: white; }
  .outcome-cell.outcome-2 { background: #ef4444; color: white; }

  .row-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
  }

  .row-card.kelly-optimal {
    border: 1px solid rgba(74, 222, 128, 0.3);
    background: rgba(74, 222, 128, 0.05);
  }

  .row-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .row-number {
    color: #ffffff;
    font-weight: 600;
  }

  .intelligence-score {
    background: rgba(147, 51, 234, 0.2);
    color: #a78bfa;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
  }

  .kelly-badge {
    background: rgba(74, 222, 128, 0.2);
    color: #4ade80;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }

  .row-outcomes {
    display: flex;
    gap: 2px;
    margin-bottom: 8px;
  }

  .row-stats {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #a0a0a0;
  }

  .intel-item, .pattern-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .pattern-item.high-confidence {
    border: 1px solid rgba(74, 222, 128, 0.3);
    background: rgba(74, 222, 128, 0.05);
  }

  .pattern-details {
    flex: 1;
  }

  .primary-pattern {
    color: #ffffff;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .supporting-factors {
    color: #4ade80;
    font-size: 11px;
  }

  .feedback-section {
    margin-bottom: 16px;
  }

  .feedback-section h4 {
    color: #ffffff;
    margin: 0 0 8px 0;
    font-size: 14px;
  }

  .feedback-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 4px;
    color: #ffffff;
    font-size: 13px;
  }

  .recommendations .feedback-item {
    border-left: 3px solid #4ade80;
  }

  .warnings .feedback-item {
    border-left: 3px solid #f59e0b;
  }

  .match-id, .match-ref {
    font-family: 'Monaco', 'Menlo', monospace;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
  }

  .no-results {
    color: #a0a0a0;
    text-align: center;
    padding: 20px;
    font-style: italic;
  }

  .sentiment-bullish { color: #4ade80; }
  .sentiment-bearish { color: #f87171; }
  .sentiment-neutral { color: #a0a0a0; }

  .direction-steam { color: #4ade80; }
  .direction-reverse-steam { color: #f87171; }

  .strength-strong { color: #ef4444; }
  .strength-moderate { color: #f59e0b; }
  .strength-weak { color: #6b7280; }

  .action-fade { color: #f87171; }
  .action-follow { color: #4ade80; }
  .action-neutral { color: #a0a0a0; }

  @media (max-width: 768px) {
    .config-grid {
      grid-template-columns: 1fr;
    }
    
    .tab-navigation {
      flex-direction: column;
    }
    
    .summary-stats {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .toggle-section {
      flex-direction: column;
      gap: 12px;
    }
  }
</style>