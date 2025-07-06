<!-- Symbol Search Input Component -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { Autocomplete } from '@skeletonlabs/skeleton';
  import { SymbolSearchClient } from '$lib/api/clients/symbol-search';

  // Props
  export let sessionToken = '';
  export let placeholder = 'Search for symbols...';
  export let disabled = false;

  // State
  let searchInput = '';
  let searchResults = [];
  let loading = false;
  let debounceTimer = null;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Symbol search client
  $: symbolSearchClient = new SymbolSearchClient({ authToken: sessionToken });

  // Debounced search function
  function debounceSearch(query) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
      if (query.trim().length >= 1) {
        await performSearch(query.trim());
      } else {
        searchResults = [];
      }
    }, 300);
  }

  // Perform symbol search
  async function performSearch(query) {
    loading = true;
    try {
      const response = await symbolSearchClient.searchSymbols(query);

      // Handle nested response structure - API returns data under 'items' property
      let symbols = response?.items || response?.data || response || [];

      // Handle double-nested items structure
      if (symbols && typeof symbols === 'object' && symbols.items && Array.isArray(symbols.items)) {
        symbols = symbols.items;
      }

      console.log('Symbol search response:', response);
      console.log('Extracted symbols:', symbols);
      console.log('Is array?', Array.isArray(symbols));

      // Transform symbols for autocomplete
      searchResults = symbols.map((symbol) => ({
        label: `${symbol.symbol} - ${symbol.description || 'N/A'}`,
        value: symbol.symbol,
        keywords: [symbol.symbol, symbol.description || ''].join(' '),
        meta: symbol, // Store full symbol data
      }));
    } catch (error) {
      console.error('Symbol search failed:', error);
      searchResults = [];
    } finally {
      loading = false;
    }
  }

  // Handle input changes
  function handleInput(event) {
    const query = event.target.value;
    searchInput = query;
    debounceSearch(query);
  }

  // Handle selection
  function handleSelection(event) {
    const selection = event.detail;
    if (selection && selection.meta) {
      dispatch('select', {
        symbol: selection.value,
        data: selection.meta,
      });

      // Clear input after selection
      searchInput = '';
      searchResults = [];
    }
  }

  // Handle manual entry (Enter key)
  function handleKeydown(event) {
    if (event.key === 'Enter' && searchInput.trim()) {
      // If there's a search result, select the first one
      if (searchResults.length > 0) {
        handleSelection({ detail: searchResults[0] });
      } else {
        // Otherwise, dispatch the raw symbol
        dispatch('select', {
          symbol: searchInput.trim().toUpperCase(),
          data: { symbol: searchInput.trim().toUpperCase() },
        });
        searchInput = '';
      }
    }
  }

  // Clear search
  function clearSearch() {
    searchInput = '';
    searchResults = [];
  }
</script>

<div class="relative">
  <div class="space-y-2">
    <label
      class="block text-sm font-medium text-gray-700 dark:text-gray-200"
      for="symbol-search-input"
    >
      Symbol Search
    </label>

    <div class="relative">
      <input
        id="symbol-search-input"
        class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        type="text"
        {placeholder}
        bind:value={searchInput}
        on:input={handleInput}
        on:keydown={handleKeydown}
        {disabled}
      />

      <!-- Loading indicator -->
      {#if loading}
        <div class="absolute right-3 top-3">
          <svg class="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      {/if}

      <!-- Clear button -->
      {#if searchInput && !loading}
        <button
          class="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          on:click={clearSearch}
          type="button"
          aria-label="Clear search"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      {/if}
    </div>

    <!-- Search results dropdown -->
    {#if searchResults.length > 0}
      <div
        class="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        {#each searchResults as result}
          <button
            class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
            on:click={() => handleSelection({ detail: result })}
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="font-semibold text-gray-900 dark:text-white">
                  {result.meta.symbol}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  {result.meta.description || 'No description available'}
                </div>
                {#if result.meta['instrument-type']}
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {result.meta['instrument-type']}
                  </div>
                {/if}
              </div>

              <div class="text-right">
                {#if result.meta.options}
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                  >
                    Options
                  </span>
                {/if}
                {#if result.meta['listed-market']}
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {result.meta['listed-market']}
                  </div>
                {/if}
              </div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  /* Ensure dropdown appears above other content */
  .relative {
    position: relative;
  }
</style>
