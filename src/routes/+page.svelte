<script lang="ts">
  import { onMount } from 'svelte';
  import WatchlistTable from '$lib/components/WatchlistTable.svelte';
  import AddSymbolForm from '$lib/components/AddSymbolForm.svelte';
  import StockChart from '$lib/components/StockChart.svelte';
  import { getMultipleStockData } from '$lib/utils/mock-stock-data';

  import type { StockDataPoint } from '$lib/utils/mock-stock-data';

  let selectedSymbols = ['AAPL']; // Start with one symbol selected
  let chartData: StockDataPoint[] = [];
  let availableSymbols = [
    'AAPL',
    'GOOGL',
    'MSFT',
    'TSLA',
    'AMZN',
    'META',
    'NVDA',
    'NFLX',
    'AMD',
    'INTC',
  ];
  let chartDays = 60;

  // Chart color scale matching StockChart.svelte
  const chartColors = [
    '#2563eb', // blue
    '#dc2626', // red
    '#059669', // green
    '#7c3aed', // purple
    '#ea580c', // orange
    '#0891b2', // cyan
    '#be185d', // pink
    '#4338f4', // indigo
  ];

  function getSymbolColor(symbol: string): string {
    const index = availableSymbols.indexOf(symbol);
    if (index === -1) return chartColors[0] || '#2563eb'; // fallback color with default
    return chartColors[index % chartColors.length] || '#2563eb';
  }

  onMount(() => {
    // Load initial chart data
    loadChartData();
  });

  function loadChartData() {
    if (selectedSymbols.length > 0) {
      chartData = getMultipleStockData(selectedSymbols, chartDays);
    } else {
      chartData = [];
    }
  }

  function toggleSymbol(symbol: string) {
    if (selectedSymbols.includes(symbol)) {
      selectedSymbols = selectedSymbols.filter((s) => s !== symbol);
    } else {
      selectedSymbols = [...selectedSymbols, symbol];
    }
    loadChartData();
  }

  function selectAllSymbols() {
    selectedSymbols = [...availableSymbols];
    loadChartData();
  }

  function clearAllSymbols() {
    selectedSymbols = [];
    loadChartData();
  }

  function updateDays(days: number) {
    chartDays = days;
    loadChartData();
  }
</script>

<svelte:head>
  <title>Stock Chart Dashboard - Tastytrade</title>
  <meta name="description" content="Interactive stock charts with real-time data visualization" />
</svelte:head>

<div class="w-full max-w-7xl mx-auto p-4">
  <header class="text-center mb-8">
    <h1 class="text-4xl font-bold mb-4 text-surface-900 dark:text-surface-50">
      Stock Chart Dashboard
    </h1>
    <p class="text-surface-600 dark:text-surface-400 text-lg">
      Interactive multi-symbol stock charts with brush and zoom functionality
    </p>
  </header>

  <!-- Symbol Selector -->
  <div class="mb-8">
    <div class="card p-6 max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Select Stocks to Compare</h3>
        <div class="flex gap-3 items-center">
          <div class="flex gap-2">
            <button class="btn variant-ghost-surface btn-sm" on:click={selectAllSymbols}>
              Select All
            </button>
            <button class="btn variant-ghost-surface btn-sm" on:click={clearAllSymbols}>
              Clear All
            </button>
          </div>
          <div class="flex gap-2 items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">Time Period:</span>
            <button
              class="btn btn-sm {chartDays === 30
                ? 'variant-filled-primary'
                : 'variant-ghost-surface'}"
              on:click={() => updateDays(30)}
            >
              30D
            </button>
            <button
              class="btn btn-sm {chartDays === 60
                ? 'variant-filled-primary'
                : 'variant-ghost-surface'}"
              on:click={() => updateDays(60)}
            >
              60D
            </button>
            <button
              class="btn btn-sm {chartDays === 90
                ? 'variant-filled-primary'
                : 'variant-ghost-surface'}"
              on:click={() => updateDays(90)}
            >
              90D
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 mb-4">
        {#each availableSymbols as symbol}
          <button
            class="symbol-chip {selectedSymbols.includes(symbol) ? 'selected' : 'unselected'}"
            style="--symbol-color: {getSymbolColor(symbol)}"
            on:click={() => toggleSymbol(symbol)}
          >
            <span class="chip-indicator"></span>
            <span class="font-medium text-sm">{symbol}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Stock Chart -->
  <div class="mb-8">
    <div class="card p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">
          {#if selectedSymbols.length === 0}
            Stock Chart
          {:else if selectedSymbols.length === 1}
            {selectedSymbols[0]} Stock Chart
          {:else}
            Stock Comparison ({selectedSymbols.length} symbols)
          {/if}
        </h2>
        <div class="flex gap-2">
          <button class="btn variant-ghost-surface btn-sm" on:click={loadChartData}>
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {#if selectedSymbols.length > 0}
        <div class="chart-wrapper">
          <StockChart data={chartData} height={500} />
        </div>
      {:else}
        <div class="text-center py-16">
          <div class="text-6xl mb-4">📊</div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Select Symbols to View Chart
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            Choose one or more stock symbols above to display their price comparison chart.
          </p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Additional Features -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="w-full">
      <div data-testid="add-symbol-form">
        <AddSymbolForm />
      </div>
    </div>

    <div class="w-full">
      <div data-testid="watchlist-section">
        <WatchlistTable />
      </div>
    </div>
  </div>
</div>

<style>
  .chart-wrapper {
    width: 100%;
    height: 500px;
    overflow: hidden;
    position: relative;
    margin: 0;
    padding: 0;
  }

  .symbol-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 12px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    font-size: 0.75rem; /* text-xs */
  }

  .symbol-chip.unselected {
    background: #f3f4f6;
    color: #6b7280;
    border-color: #e5e7eb;
  }

  .symbol-chip.unselected:hover {
    background: #e5e7eb;
    color: #374151;
  }

  .symbol-chip.selected {
    background: var(--symbol-color);
    color: white;
    border-color: var(--symbol-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .symbol-chip.selected:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .chip-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .symbol-chip.unselected .chip-indicator {
    background: #9ca3af;
  }

  .symbol-chip.selected .chip-indicator {
    background: white;
  }

  /* Dark mode support */
  :global(.dark) .symbol-chip.unselected {
    background: #374151;
    color: #9ca3af;
    border-color: #4b5563;
  }

  :global(.dark) .symbol-chip.unselected:hover {
    background: #4b5563;
    color: #d1d5db;
  }

  :global(.dark) .symbol-chip.unselected .chip-indicator {
    background: #6b7280;
  }
</style>
