<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { SymbolSearchClient } from '$lib/api/clients/symbol-search';

  // Props
  export let sessionToken = '';
  export let placeholder = 'Search symbols...';
  export let disabled = false;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // State
  let searchQuery = '';
  let results = [];
  let isLoading = false;
  let showDropdown = false;
  let searchTimeout = null;

  // API client - reactive to sessionToken changes
  $: symbolSearchClient = new SymbolSearchClient(sessionToken);

  // Debounced search function
  async function searchSymbols(query) {
    if (query.length < 1) {
      results = [];
      showDropdown = false;
      return;
    }

    isLoading = true;
    try {
      const searchResults = await symbolSearchClient.searchSymbols(query);

      // Handle different response formats
      let symbolArray = [];
      if (Array.isArray(searchResults)) {
        symbolArray = searchResults;
      } else if (
        searchResults &&
        searchResults.data &&
        searchResults.data.items &&
        Array.isArray(searchResults.data.items)
      ) {
        // Handle API response format: { data: { items: [...] } }
        symbolArray = searchResults.data.items;
      } else if (searchResults && searchResults.data && Array.isArray(searchResults.data)) {
        symbolArray = searchResults.data;
      } else if (searchResults && typeof searchResults === 'object') {
        // If it's a single object, wrap it in an array
        symbolArray = [searchResults];
      }

      results = symbolArray;
      showDropdown = results.length > 0;
    } catch (error) {
      console.error('Error searching symbols:', error);
      results = [];
      showDropdown = false;
    } finally {
      isLoading = false;
    }
  }

  // Handle input changes with debouncing
  function handleInput() {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      searchSymbols(searchQuery);
    }, 300);
  }

  // Handle symbol selection
  function selectSymbol(symbol) {
    const symbolName = symbol.symbol || '';

    dispatch('select', {
      symbol: symbolName,
      data: symbol,
    });

    // Clear the search after selection
    searchQuery = '';
    results = [];
    showDropdown = false;
  }

  // Show dropdown when input is focused and has results
  function handleFocus() {
    if (results.length > 0) {
      showDropdown = true;
    }
  }

  // Hide dropdown with delay to allow clicks
  function handleBlur() {
    setTimeout(() => {
      showDropdown = false;
    }, 200);
  }
</script>

<div class="relative w-full">
  <!-- Search Input -->
  <div class="relative">
    <input
      type="text"
      {placeholder}
      {disabled}
      bind:value={searchQuery}
      on:input={handleInput}
      on:focus={handleFocus}
      on:blur={handleBlur}
      class="w-full px-4 py-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
      autocomplete="off"
    />

    <!-- Loading indicator -->
    {#if isLoading}
      <div class="absolute right-3 top-2.5 animate-spin">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </div>
    {:else}
      <!-- Search icon -->
      <div class="absolute right-3 top-2.5">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    {/if}
  </div>

  <!-- Dropdown Results -->
  {#if showDropdown && results.length > 0}
    <div
      class="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto"
    >
      <div class="py-1">
        {#each results as symbol, index}
          <button
            type="button"
            class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:bg-gray-100 dark:focus:bg-gray-600"
            on:click={() => selectSymbol(symbol)}
          >
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="font-medium text-gray-900 dark:text-white">
                  {symbol.symbol || symbol.Symbol || 'Unknown'}
                </span>
                {#if symbol.description || symbol.Description}
                  <span class="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {symbol.description || symbol.Description}
                  </span>
                {/if}
              </div>
              <div class="text-xs text-gray-400 dark:text-gray-500">
                {symbol['instrument-type'] ||
                  symbol['Instrument-Type'] ||
                  symbol.instrumentType ||
                  'Stock'}
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- No results message -->
  {#if showDropdown && searchQuery && !isLoading && results.length === 0}
    <div
      class="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl"
    >
      <div class="py-3 px-4 text-center text-gray-500 dark:text-gray-400">
        No symbols found for "{searchQuery}"
      </div>
    </div>
  {/if}
</div>
