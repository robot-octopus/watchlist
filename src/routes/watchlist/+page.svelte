<!-- Watchlist Page -->
<script>
  import { currentUser } from '$lib/stores/auth';
  import WatchlistManager from '$lib/components/WatchlistManager.svelte';
  import WatchlistTable from '$lib/components/WatchlistTable.svelte';
  import AddSymbolForm from '$lib/components/AddSymbolForm.svelte';

  // Get the server-loaded data
  export let data;

  let watchlistTable;

  // Get session token from server data
  $: sessionToken = data.sessionToken || '';

  // Function to add symbol to watchlist
  async function handleAddSymbol(event) {
    const symbol = event.detail.symbol;
    if (watchlistTable && watchlistTable.addSymbol) {
      await watchlistTable.addSymbol(symbol);
    }
  }

  // Handle watchlist events
  function handleWatchlistSelect(event) {
    console.log('Selected watchlist:', event.detail);
  }

  function handleWatchlistCreate(event) {
    console.log('Created watchlist:', event.detail);
  }

  function handleWatchlistUpdate(event) {
    console.log('Updated watchlist:', event.detail);
  }

  function handleWatchlistDelete(event) {
    console.log('Deleted watchlist:', event.detail);
  }
</script>

<svelte:head>
  <title>Watchlist - Tastytrade</title>
  <meta name="description" content="Your personal stock watchlist" />
</svelte:head>

<div class="max-w-6xl mx-auto">
  {#if data.error}
    <div
      class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-lg"
    >
      <h3 class="text-red-600 dark:text-red-400 font-semibold mb-2">API Error</h3>
      <p class="text-red-700 dark:text-red-300 text-sm">{data.error}</p>
    </div>
  {/if}

  <!-- Watchlist Manager -->
  <WatchlistManager
    watchlists={data.watchlists || []}
    {sessionToken}
    on:select={handleWatchlistSelect}
    on:create={handleWatchlistCreate}
    on:update={handleWatchlistUpdate}
    on:delete={handleWatchlistDelete}
  />
</div>
