<!-- Watchlist Page -->
<script>
  import { currentUser } from '$lib/stores/auth';
  import WatchlistTable from '$lib/components/WatchlistTable.svelte';
  import AddSymbolForm from '$lib/components/AddSymbolForm.svelte';

  // Sample watchlist data for testing
  const watchlist = [
    { symbol: 'AAPL', price: 150.25, change: 2.15, changePercent: 1.45 },
    { symbol: 'GOOGL', price: 2750.8, change: -15.3, changePercent: -0.55 },
    { symbol: 'MSFT', price: 305.5, change: 5.25, changePercent: 1.75 },
    { symbol: 'TSLA', price: 195.75, change: -3.45, changePercent: -1.73 },
    { symbol: 'NVDA', price: 420.35, change: 12.8, changePercent: 3.14 },
  ];
</script>

<svelte:head>
  <title>Watchlist - Tastytrade</title>
  <meta name="description" content="Your personal stock watchlist" />
</svelte:head>

<div class="max-w-6xl mx-auto">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Watchlist</h1>
    <p class="text-gray-600 dark:text-gray-300">Track your favorite stocks and market movements</p>

    {#if $currentUser}
      <div
        class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-lg"
      >
        <p class="text-sm text-blue-700 dark:text-blue-300">
          Welcome back, <strong>{$currentUser.username}</strong>! This is your protected watchlist
          page.
        </p>
      </div>
    {/if}
  </div>

  <!-- Add Symbol Form -->
  <div class="mb-8">
    <AddSymbolForm />
  </div>

  <!-- Watchlist Table -->
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <WatchlistTable {watchlist} />
  </div>

  <!-- Info Card -->
  <div
    class="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg"
  >
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Route Protection Working! 🎉
    </h2>
    <p class="text-gray-600 dark:text-gray-300 mb-4">
      You can only see this page because you're authenticated. Try logging out and accessing
      <code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/watchlist</code> directly - you'll
      be redirected to the login page.
    </p>
    <div class="text-sm text-gray-500 dark:text-gray-400">
      <p><strong>Current User:</strong> {$currentUser?.username || 'Unknown'}</p>
      <p><strong>Email:</strong> {$currentUser?.email || 'Unknown'}</p>
    </div>
  </div>
</div>
