<!-- WatchlistCard Component -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import SymbolSearch from '../SymbolLookup/SymbolSearch.svelte';
  // StreamingChart removed - not needed

  // Props
  export let watchlist;
  export let isSelected = false;
  export let isEditing = false;
  export let editingName = '';
  export let loading = false;
  export let sessionToken = '';

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Get symbol count for a watchlist
  function getSymbolCount(watchlist) {
    if (!watchlist['watchlist-entries']) return 0;
    return Object.values(watchlist['watchlist-entries']).length;
  }

  // Get symbols array for a watchlist
  function getSymbols(watchlist) {
    if (!watchlist['watchlist-entries']) return [];
    return Object.values(watchlist['watchlist-entries']);
  }

  // Event handlers
  function handleSelect() {
    dispatch('select', watchlist);
  }

  function handleEdit() {
    dispatch('edit', watchlist);
  }

  function handleDelete() {
    dispatch('delete', watchlist);
  }

  function handleSave() {
    dispatch('save', { watchlist, name: editingName });
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function handleSymbolSelect(event) {
    dispatch('symbol-select', event.detail);
  }

  function handleSymbolRemove(symbol) {
    dispatch('symbol-remove', symbol);
  }
</script>

<div
  class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border transition-all cursor-pointer {isSelected
    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl'}"
  transition:slide={{ duration: 200 }}
>
  {#if isEditing}
    <div class="space-y-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200"> Name * </label>
        <input
          class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          type="text"
          bind:value={editingName}
          disabled={loading}
        />
      </div>

      <div class="flex justify-end space-x-3">
        <button
          class="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200"
          on:click={handleCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
          on:click={handleSave}
          disabled={loading || !editingName.trim()}
        >
          {#if loading}
            <div class="flex items-center">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </div>
          {:else}
            Save
          {/if}
        </button>
      </div>
    </div>
  {:else}
    <div
      class="flex items-center justify-between"
      role="button"
      tabindex="0"
      on:click={handleSelect}
      on:keydown={(e) => e.key === 'Enter' && handleSelect()}
    >
      <div class="flex items-center space-x-4">
        <div
          class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg"
        >
          {watchlist.name?.charAt(0) || 'W'}
        </div>
        <div>
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
            {watchlist.name || 'Unnamed Watchlist'}
          </h4>
          <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <span>{getSymbolCount(watchlist)} symbols</span>
            {#if watchlist['order-index']}
              <span>Order: {watchlist['order-index']}</span>
            {/if}
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <button
          class="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200"
          on:click|stopPropagation={handleEdit}
          disabled={loading}
          title="Edit watchlist"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            ></path>
          </svg>
        </button>
        <button
          class="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200"
          on:click|stopPropagation={handleDelete}
          disabled={loading}
          title="Delete watchlist"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Symbols Preview -->
    {#if isSelected}
      <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600" transition:slide>
        <h5 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Symbols ({getSymbolCount(watchlist)})
        </h5>

        <!-- Symbol Search Input -->
        <div class="mb-4">
          <SymbolSearch
            {sessionToken}
            placeholder="Search symbols to add..."
            disabled={loading}
            on:select={handleSymbolSelect}
          />
        </div>

        <!-- StreamingChart removed - not needed -->

        {#if getSymbolCount(watchlist) > 0}
          <div class="flex flex-wrap gap-2">
            {#each getSymbols(watchlist) as symbol}
              <div
                class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600 flex items-center gap-2"
              >
                <span>
                  {symbol.symbol || 'Unknown'}
                  {#if symbol['instrument-type']}
                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-1"
                      >({symbol['instrument-type']})</span
                    >
                  {/if}
                </span>
                <button
                  class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-1 transition-colors"
                  on:click={() => handleSymbolRemove(symbol.symbol)}
                  disabled={loading}
                  title="Remove symbol"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-gray-500 dark:text-gray-400 italic">
            No symbols in this watchlist. Use the search above to add symbols.
          </p>
        {/if}
      </div>
    {/if}
  {/if}
</div>
