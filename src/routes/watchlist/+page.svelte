<!-- Watchlist Page -->
<script>
  import { currentUser } from '$lib/stores/auth';
  import WatchlistTable from '$lib/components/WatchlistTable.svelte';
  import AddSymbolForm from '$lib/components/AddSymbolForm.svelte';

  // Get the server-loaded data
  export let data;

  let watchlistTable;

  // Function to add symbol to watchlist
  async function handleAddSymbol(event) {
    const symbol = event.detail.symbol;
    if (watchlistTable && watchlistTable.addSymbol) {
      await watchlistTable.addSymbol(symbol);
    }
  }

  // Debug: log the loaded data
  console.log('📊 Watchlist page data:', data);
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
          Welcome back, <strong>{$currentUser.username}</strong>
        </p>
      </div>
    {/if}
  </div>

  <!-- Add Symbol Form -->
  <div class="mb-8">
    <AddSymbolForm on:add={handleAddSymbol} />
  </div>

  <!-- Debug Info -->
  {#if data.error}
    <div
      class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-lg"
    >
      <h3 class="text-red-600 dark:text-red-400 font-semibold mb-2">API Error</h3>
      <p class="text-red-700 dark:text-red-300 text-sm">{data.error}</p>
    </div>
  {/if}

  <!-- Watchlists Display -->
  {#if data.watchlists && data.watchlists.length > 0}
    <div class="space-y-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Your Watchlists</h2>
      {#each data.watchlists as watchlist}
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {watchlist.name || 'Unnamed Watchlist'}
            </h3>
            {#if watchlist['order-index']}
              <span class="text-xs text-gray-500 dark:text-gray-400"
                >#{watchlist['order-index']}</span
              >
            {/if}
          </div>

          <div class="text-sm text-gray-600 dark:text-gray-300">
            {#if watchlist['group-name']}
              <p><strong>Group:</strong> {watchlist['group-name']}</p>
            {/if}

            {#if watchlist['watchlist-entries']}
              {@const entries = Object.values(watchlist['watchlist-entries'])}
              <p><strong>Symbols:</strong> {entries.length}</p>

              {#if entries.length > 0}
                <div class="mt-3">
                  <p class="font-medium mb-2">Symbols:</p>
                  <div class="flex flex-wrap gap-2">
                    {#each entries as entry}
                      <span
                        class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-md text-sm font-mono"
                      >
                        {entry.symbol || 'Unknown'}
                        {#if entry['instrument-type']}
                          <span class="text-xs opacity-75">({entry['instrument-type']})</span>
                        {/if}
                      </span>
                    {/each}
                  </div>
                </div>
              {/if}
            {:else}
              <p class="text-gray-500 italic">No symbols in this watchlist</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
    >
      <div class="text-4xl mb-4">📈</div>
      <h3 class="text-xl font-semibold mb-2">No watchlists found</h3>
      <p class="text-gray-600 dark:text-gray-300">
        {#if data.error}
          Check the error above for details.
        {:else}
          You don't have any watchlists yet. Create one to get started!
        {/if}
      </p>
    </div>
  {/if}

  <!-- Public Watchlists -->
  {#if data.publicWatchlists && data.publicWatchlists.length > 0}
    <div class="mt-8 space-y-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Public Watchlists</h2>
      {#each data.publicWatchlists as watchlist}
        <div
          class="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {watchlist.name || 'Unnamed Public Watchlist'}
            </h3>
            {#if watchlist['order-index']}
              <span class="text-xs text-gray-500 dark:text-gray-400"
                >#{watchlist['order-index']}</span
              >
            {/if}
          </div>

          <div class="text-sm text-gray-600 dark:text-gray-300">
            {#if watchlist['group-name']}
              <p><strong>Group:</strong> {watchlist['group-name']}</p>
            {/if}

            {#if watchlist['watchlist-entries']}
              {@const entries = Object.values(watchlist['watchlist-entries'])}
              <p><strong>Symbols:</strong> {entries.length}</p>

              {#if entries.length > 0}
                <div class="mt-3">
                  <p class="font-medium mb-2">Symbols:</p>
                  <div class="flex flex-wrap gap-2">
                    {#each entries as entry}
                      <span
                        class="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-md text-sm font-mono"
                      >
                        {entry.symbol || 'Unknown'}
                        {#if entry['instrument-type']}
                          <span class="text-xs opacity-75">({entry['instrument-type']})</span>
                        {/if}
                      </span>
                    {/each}
                  </div>
                </div>
              {/if}
            {:else}
              <p class="text-gray-500 italic">No symbols in this public watchlist</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Legacy Table Component (hidden for now) -->
  <div class="hidden">
    <WatchlistTable watchlistName="My Watchlist" bind:this={watchlistTable} />
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
