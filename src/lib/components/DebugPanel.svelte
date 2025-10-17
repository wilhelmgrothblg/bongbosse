<!-- Development Debug Panel for System Management -->
<script lang="ts">
  import { SystemHistoryManager } from '$lib/utils/systemHistory.js';
  import { MockDataGenerator } from '$lib/utils/mockDataGenerator.js';
  
  let showDebugPanel = false;
  let debugStats = {
    totalSystems: 0,
    pendingSystems: 0,
    completedSystems: 0
  };

  function updateDebugStats() {
    const allSystems = SystemHistoryManager.getAllSystems();
    const pending = SystemHistoryManager.getSystemsByStatus('pending');
    const completed = SystemHistoryManager.getSystemsByStatus('completed');
    
    debugStats = {
      totalSystems: allSystems.length,
      pendingSystems: pending.length,
      completedSystems: completed.length
    };
  }

  function simulateWeekendResults() {
    SystemHistoryManager.simulateWeekendResults();
    updateDebugStats();
    alert('Weekend results simulated! Check the top systems panel.');
  }

  function generateMockData() {
    MockDataGenerator.generateMockCompletedSystems();
    updateDebugStats();
    alert('Mock completed systems generated!');
  }

  function clearAllData() {
    if (confirm('Are you sure you want to clear all system data?')) {
      MockDataGenerator.clearMockData();
      updateDebugStats();
      alert('All system data cleared!');
    }
  }

  function generatePendingSystems() {
    MockDataGenerator.generateMockPendingSystems();
    updateDebugStats();
    alert('Mock pending systems generated!');
  }

  // Update stats when panel opens
  $: if (showDebugPanel) {
    updateDebugStats();
  }
</script>

{#if import.meta.env.DEV}
  <div class="debug-panel-container">
    <!-- Toggle Button -->
    <button 
      class="debug-toggle"
      on:click={() => showDebugPanel = !showDebugPanel}
      title="Development Debug Panel"
    >
      🛠️
    </button>

    {#if showDebugPanel}
      <div class="debug-panel">
        <div class="debug-header">
          <h3>🛠️ Development Debug Panel</h3>
          <button class="close-btn" on:click={() => showDebugPanel = false}>×</button>
        </div>

        <div class="debug-stats">
          <div class="stat-item">
            <span class="stat-label">Total Systems:</span>
            <span class="stat-value">{debugStats.totalSystems}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Pending:</span>
            <span class="stat-value">{debugStats.pendingSystems}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Completed:</span>
            <span class="stat-value">{debugStats.completedSystems}</span>
          </div>
        </div>

        <div class="debug-actions">
          <button class="debug-btn primary" on:click={simulateWeekendResults}>
            ⚽ Simulate Weekend Results
          </button>
          
          <button class="debug-btn secondary" on:click={generateMockData}>
            📊 Generate Mock Completed Systems
          </button>
          
          <button class="debug-btn secondary" on:click={generatePendingSystems}>
            ⏳ Generate Mock Pending Systems
          </button>
          
          <button class="debug-btn danger" on:click={clearAllData}>
            🗑️ Clear All Data
          </button>
        </div>

        <div class="debug-info">
          <p><strong>How to test:</strong></p>
          <ol>
            <li>Click "Generate Mock Completed Systems" to create example winners</li>
            <li>Check the "Top Performing Systems" panel on the main page</li>
            <li>Generate new systems (they'll be saved automatically)</li>
            <li>Click "Simulate Weekend Results" to process pending systems</li>
          </ol>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .debug-panel-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  }

  .debug-toggle {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border: 2px solid #4ade80;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .debug-toggle:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(74, 222, 128, 0.3);
  }

  .debug-panel {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 20px;
    margin-top: 12px;
    width: 320px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    max-height: 80vh;
    overflow-y: auto;
  }

  .debug-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .debug-header h3 {
    color: #ffffff;
    margin: 0;
    font-size: 16px;
  }

  .close-btn {
    background: none;
    border: none;
    color: #a0a0a0;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    color: #ffffff;
  }

  .debug-stats {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 16px;
    background: rgba(255, 255, 255, 0.05);
    padding: 12px;
    border-radius: 8px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-label {
    color: #a0a0a0;
    font-size: 13px;
  }

  .stat-value {
    color: #ffffff;
    font-weight: 600;
    background: rgba(74, 222, 128, 0.2);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .debug-actions {
    display: grid;
    gap: 8px;
    margin-bottom: 16px;
  }

  .debug-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .debug-btn.primary {
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    color: white;
  }

  .debug-btn.secondary {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .debug-btn.danger {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .debug-btn:hover {
    transform: translateY(-1px);
  }

  .debug-info {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
    font-size: 12px;
    color: #a0a0a0;
  }

  .debug-info p {
    margin: 0 0 8px 0;
    color: #ffffff;
    font-weight: 600;
  }

  .debug-info ol {
    margin: 0;
    padding-left: 16px;
  }

  .debug-info li {
    margin-bottom: 4px;
    line-height: 1.4;
  }
</style>