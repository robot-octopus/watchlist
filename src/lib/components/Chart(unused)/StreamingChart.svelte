<!-- Streaming Chart Component -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { DXLinkStreamer } from '$lib/streaming/dxlink-streamer';
  import { MockDXLinkStreamer } from '$lib/streaming/mock-streamer';
  import StockChart from './StockChart.svelte';

  // Props
  export let symbols = []; // Array of symbol strings
  export let sessionToken = '';
  export let height = 400;

  // State
  let streamer = null;
  let chartData = [];
  let connectionStatus = 'disconnected'; // 'connecting', 'connected', 'disconnected', 'error'
  let priceHistory = new Map(); // symbol -> array of price points
  let lastUpdateTime = 0;
  let usingMockData = false;

  // Configuration
  const MAX_HISTORY_POINTS = 100; // Keep last 100 price points per symbol
  const UPDATE_INTERVAL = 1000; // Update chart every 1 second

  // Initialize streaming when component mounts
  onMount(async () => {
    if (sessionToken) {
      await initializeStreaming();
    }
  });

  // Cleanup on component destroy
  onDestroy(() => {
    if (streamer) {
      streamer.disconnect();
    }
  });

  // Watch for symbol changes
  $: if (streamer && streamer.connected && symbols.length > 0) {
    subscribeToSymbols();
  }

  // Watch for session token changes
  $: if (sessionToken && !streamer) {
    initializeStreaming();
  }

  async function initializeStreaming() {
    try {
      connectionStatus = 'connecting';

      // Try real streaming first
      streamer = new DXLinkStreamer({
        sessionToken,
        onData: handleMarketData,
        onConnect: () => {
          connectionStatus = 'connected';
          if (symbols.length > 0) {
            subscribeToSymbols();
          }
        },
        onDisconnect: () => {
          connectionStatus = 'disconnected';
        },
        onError: (error) => {
          console.error('Streaming error:', error);
          connectionStatus = 'error';
        },
      });

      await streamer.connect();
    } catch (error) {
      console.error('Failed to initialize real streaming:', error);

      // Check if it's the customer not found error
      if (
        error.message?.includes('quote_streamer.customer_not_found_error') ||
        error.message?.includes('You must be a customer to access a quote stream')
      ) {
        console.log('🎭 Customer account not found, switching to mock streaming for development');
        await initializeMockStreaming();
      } else {
        connectionStatus = 'error';
      }
    }
  }

  async function initializeMockStreaming() {
    try {
      connectionStatus = 'connecting';

      streamer = new MockDXLinkStreamer({
        onData: handleMarketData,
        onConnect: () => {
          connectionStatus = 'connected';
          if (symbols.length > 0) {
            subscribeToSymbols();
          }
        },
        onDisconnect: () => {
          connectionStatus = 'disconnected';
        },
        onError: (error) => {
          console.error('Mock streaming error:', error);
          connectionStatus = 'error';
        },
      });

      await streamer.connect();
      usingMockData = true;
    } catch (error) {
      console.error('Failed to initialize mock streaming:', error);
      connectionStatus = 'error';
    }
  }

  function subscribeToSymbols() {
    if (!streamer || !streamer.connected || symbols.length === 0) return;

    // Unsubscribe from old symbols
    const currentlySubscribed = streamer.subscribedSymbolsList;
    const toUnsubscribe = currentlySubscribed.filter((s) => !symbols.includes(s));
    if (toUnsubscribe.length > 0) {
      streamer.unsubscribeFromSymbols(toUnsubscribe);
    }

    // Subscribe to new symbols
    const toSubscribe = symbols.filter((s) => !currentlySubscribed.includes(s));
    if (toSubscribe.length > 0) {
      streamer.subscribeToSymbols(toSubscribe);
    }
  }

  function handleMarketData(marketDataArray) {
    const now = Date.now();

    // Process each market data point
    for (const data of marketDataArray) {
      if (!data.eventSymbol || data.price === undefined) continue;

      const symbol = data.eventSymbol;

      // Initialize history for this symbol if needed
      if (!priceHistory.has(symbol)) {
        priceHistory.set(symbol, []);
      }

      const history = priceHistory.get(symbol);

      // Add new price point
      const pricePoint = {
        date: new Date(data.timestamp || now),
        price: data.price,
        volume: data.dayVolume || 0,
        symbol: symbol,
      };

      history.push(pricePoint);

      // Keep only the last N points
      if (history.length > MAX_HISTORY_POINTS) {
        history.shift();
      }
    }

    // Update chart data periodically to avoid too frequent updates
    if (now - lastUpdateTime > UPDATE_INTERVAL) {
      updateChartData();
      lastUpdateTime = now;
    }
  }

  function updateChartData() {
    const allData = [];

    // Combine all symbol histories into a single array
    for (const [symbol, history] of priceHistory.entries()) {
      allData.push(...history);
    }

    // Sort by date
    allData.sort((a, b) => a.date.getTime() - b.date.getTime());

    chartData = allData;
  }

  function getStatusColor() {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600 dark:text-green-400';
      case 'connecting':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  function getStatusText() {
    switch (connectionStatus) {
      case 'connected':
        if (usingMockData) {
          return `Mock Data (${symbols.length} symbols)`;
        }
        return `Live (${symbols.length} symbols)`;
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  }

  function reconnect() {
    if (streamer) {
      streamer.disconnect();
      streamer = null;
    }
    usingMockData = false;
    initializeStreaming();
  }
</script>

<div class="streaming-chart-container">
  <!-- Status Header -->
  <div
    class="flex items-center justify-between mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
  >
    <div class="flex items-center space-x-3">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Real-Time Chart</h3>
      <div class="flex items-center space-x-2">
        <!-- Status Indicator -->
        <div class="flex items-center space-x-2">
          <div
            class={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}
          ></div>
          <span class={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center space-x-2">
      {#if connectionStatus === 'error' || connectionStatus === 'disconnected'}
        <button
          class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          on:click={reconnect}
        >
          Reconnect
        </button>
      {/if}

      {#if symbols.length === 0}
        <span class="text-sm text-gray-500 dark:text-gray-400">
          Add symbols to start streaming
        </span>
      {/if}
    </div>
  </div>

  <!-- Chart -->
  <div class="chart-wrapper">
    {#if chartData.length > 0}
      <StockChart data={chartData} {height} />
    {:else}
      <!-- Empty State -->
      <div
        class="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div class="text-center">
          <div class="text-4xl mb-4">📈</div>
          {#if symbols.length === 0}
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Symbols Selected
            </h4>
            <p class="text-gray-600 dark:text-gray-300">
              Add symbols to your watchlist to see real-time charts
            </p>
          {:else if connectionStatus === 'connecting'}
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Connecting...</h4>
            <p class="text-gray-600 dark:text-gray-300">Establishing connection to market data</p>
          {:else if connectionStatus === 'connected'}
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Waiting for Data
            </h4>
            <p class="text-gray-600 dark:text-gray-300">
              Subscribed to {symbols.length} symbol{symbols.length !== 1 ? 's' : ''}
            </p>
          {:else}
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Connection Error
            </h4>
            <p class="text-gray-600 dark:text-gray-300">Unable to connect to market data</p>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .streaming-chart-container {
    width: 100%;
  }

  .chart-wrapper {
    position: relative;
    width: 100%;
  }
</style>
