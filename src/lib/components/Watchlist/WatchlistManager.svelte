<!-- Watchlist Manager Component -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';

  // Skeleton UI imports
  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';

  // Import the WatchlistsClient
  import { WatchlistsClient } from '$lib/api/clients/watchlists';

  // Import the SymbolSearch component
  import SymbolSearch from '../SymbolLookup/SymbolSearch.svelte';

  // Import the StreamingChart component (create mock)
  import StreamingChart from '../StreamingChart.svelte';

  // Props
  export let watchlists = [];
  export let sessionToken = '';

  // State
  let selectedWatchlist = null;
  let isEditing = false;
  let editingName = '';
  let newWatchlistName = '';
  let loading = false;

  // Stores
  const modalStore = getModalStore();
  const toastStore = getToastStore();

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Watchlist client
  $: watchlistClient = new WatchlistsClient({ authToken: sessionToken });

  // Handle watchlist selection
  function selectWatchlist(watchlist) {
    selectedWatchlist = watchlist;
    dispatch('select', watchlist);
  }

  // Start editing a watchlist
  function startEdit(watchlist) {
    isEditing = true;
    editingName = watchlist.name || '';
    selectedWatchlist = watchlist;
  }

  // Cancel editing
  function cancelEdit() {
    isEditing = false;
    editingName = '';
    selectedWatchlist = null;
  }

  // Save edited watchlist
  async function saveEdit() {
    if (!selectedWatchlist || !editingName.trim()) return;

    loading = true;
    try {
      const updatedWatchlist = await watchlistClient.updateWatchlist(selectedWatchlist.id || '', {
        name: editingName.trim(),
        'watchlist-entries': selectedWatchlist['watchlist-entries'] || [],
      });

      // Handle nested response structure like in creation
      const watchlistData = updatedWatchlist?.data || updatedWatchlist;

      // Update the watchlists array
      const index = watchlists.findIndex((w) => w.id === selectedWatchlist?.id);
      if (index >= 0) {
        watchlists[index] = watchlistData;
        watchlists = [...watchlists];
      }

      // Update selectedWatchlist to reflect the new data
      selectedWatchlist = watchlistData;

      // Show success toast
      const toast = {
        message: 'Watchlist updated successfully!',
        background: 'variant-filled-success',
        timeout: 3000,
      };
      toastStore.trigger(toast);

      cancelEdit();
      dispatch('update', watchlistData);
    } catch (error) {
      console.error('Failed to update watchlist:', error);
      const toast = {
        message: 'Failed to update watchlist. Please try again.',
        background: 'variant-filled-error',
        timeout: 5000,
      };
      toastStore.trigger(toast);
    } finally {
      loading = false;
    }
  }

  // Delete watchlist with confirmation
  function confirmDelete(watchlist) {
    const watchlistName = watchlist.name || 'Unnamed Watchlist';

    const modal = {
      type: 'confirm',
      title: 'Delete Watchlist',
      body: `Are you sure you want to delete "${watchlistName}"? This action cannot be undone.`,
      buttonTextCancel: 'Cancel',
      buttonTextConfirm: 'Delete',
      modalClasses: 'dark:!bg-gray-800 dark:!text-white',
      backdropClasses: 'dark:bg-black/60',
      regionHeader: 'dark:text-white dark:border-gray-600',
      regionBody: 'dark:text-gray-200',
      regionFooter: 'dark:border-gray-600',
      response: (confirmed) => {
        if (confirmed) {
          deleteWatchlist(watchlist);
        }
      },
    };
    modalStore.trigger(modal);
  }

  // Delete watchlist
  async function deleteWatchlist(watchlist) {
    loading = true;
    try {
      const watchlistId = watchlist.id || '';

      if (!watchlistId) {
        throw new Error('Watchlist ID is empty or undefined');
      }

      // First, verify the watchlist exists on the server
      let existsOnServer = false;
      try {
        await watchlistClient.getWatchlist(watchlistId);
        existsOnServer = true;
      } catch (verifyError) {
        existsOnServer = false;
      }

      // Only call delete API if the watchlist exists on the server
      if (existsOnServer) {
        await watchlistClient.deleteWatchlist(watchlistId);
      }

      // Remove from watchlists array
      watchlists = watchlists.filter((w) => w.id !== watchlist.id);

      // Clear selection if this was selected
      if (selectedWatchlist?.id === watchlist.id) {
        selectedWatchlist = null;
      }

      // Show success toast
      const toast = {
        message: 'Watchlist deleted successfully!',
        background: 'variant-filled-success',
        timeout: 3000,
      };
      toastStore.trigger(toast);

      dispatch('delete', watchlist);
    } catch (error) {
      console.error('Failed to delete watchlist:', error);
      const toast = {
        message: 'Failed to delete watchlist. Please try again.',
        background: 'variant-filled-error',
        timeout: 5000,
      };
      toastStore.trigger(toast);
    } finally {
      loading = false;
    }
  }

  // Create new watchlist
  async function createWatchlist() {
    if (!newWatchlistName.trim()) return;

    loading = true;
    try {
      const newWatchlist = {
        name: newWatchlistName.trim(),
        'watchlist-entries': [],
      };

      const createdWatchlist = await watchlistClient.createWatchlist(newWatchlist);

      // Handle nested response structure like in the server load
      const watchlistData = createdWatchlist?.data || createdWatchlist;

      // Add to watchlists array
      watchlists = [...watchlists, watchlistData];

      // Clear form
      newWatchlistName = '';

      // Show success toast
      const toast = {
        message: 'Watchlist created successfully!',
        background: 'variant-filled-success',
        timeout: 3000,
      };
      toastStore.trigger(toast);

      dispatch('create', watchlistData);
    } catch (error) {
      console.error('Failed to create watchlist:', error);
      const toast = {
        message: 'Failed to create watchlist. Please try again.',
        background: 'variant-filled-error',
        timeout: 5000,
      };
      toastStore.trigger(toast);
    } finally {
      loading = false;
    }
  }

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

  // Handle symbol selection from search
  function handleSymbolSelect(event) {
    const { symbol, data } = event.detail;

    if (!selectedWatchlist) {
      const toast = {
        message: 'Please select a watchlist first to add symbols.',
        background: 'variant-filled-warning',
        timeout: 3000,
      };
      toastStore.trigger(toast);
      return;
    }

    addSymbolToWatchlist(symbol, data);
  }

  // Add symbol to selected watchlist
  async function addSymbolToWatchlist(symbol, symbolData) {
    if (!selectedWatchlist) return;

    loading = true;
    try {
      // Get current watchlist entries
      const currentEntries = selectedWatchlist['watchlist-entries'] || {};

      // Check if symbol already exists
      if (currentEntries[symbol]) {
        const toast = {
          message: `Symbol ${symbol} is already in this watchlist.`,
          background: 'variant-filled-warning',
          timeout: 3000,
        };
        toastStore.trigger(toast);
        return;
      }

      // Add new symbol entry
      const newEntry = {
        symbol: symbol,
        'instrument-type': symbolData['instrument-type'] || 'Stock',
      };

      const updatedEntries = {
        ...currentEntries,
        [symbol]: newEntry,
      };

      // Update the watchlist via API
      const updatedWatchlist = await watchlistClient.updateWatchlist(selectedWatchlist.id || '', {
        name: selectedWatchlist.name,
        'watchlist-entries': Object.values(updatedEntries),
      });

      // Handle nested response structure
      const watchlistData = updatedWatchlist?.data || updatedWatchlist;

      // Update the watchlists array
      const index = watchlists.findIndex((w) => w.id === selectedWatchlist?.id);
      if (index >= 0) {
        watchlists[index] = watchlistData;
        watchlists = [...watchlists];
      }

      // Update selectedWatchlist
      selectedWatchlist = watchlistData;

      // Show success toast
      const toast = {
        message: `Added ${symbol} to ${selectedWatchlist.name}!`,
        background: 'variant-filled-success',
        timeout: 3000,
      };
      toastStore.trigger(toast);
    } catch (error) {
      console.error('Failed to add symbol to watchlist:', error);
      const toast = {
        message: 'Failed to add symbol to watchlist. Please try again.',
        background: 'variant-filled-error',
        timeout: 5000,
      };
      toastStore.trigger(toast);
    } finally {
      loading = false;
    }
  }

  // Remove symbol from watchlist
  async function removeSymbolFromWatchlist(symbol) {
    if (!selectedWatchlist) return;

    const modal = {
      type: 'confirm',
      title: 'Remove Symbol',
      body: `Are you sure you want to remove ${symbol} from ${selectedWatchlist.name}?`,
      buttonTextCancel: 'Cancel',
      buttonTextConfirm: 'Remove',
      modalClasses: 'dark:!bg-gray-800 dark:!text-white',
      backdropClasses: 'dark:bg-black/60',
      regionHeader: 'dark:text-white dark:border-gray-600',
      regionBody: 'dark:text-gray-200',
      regionFooter: 'dark:border-gray-600',
      response: (confirmed) => {
        if (confirmed) {
          performRemoveSymbol(symbol);
        }
      },
    };
    modalStore.trigger(modal);
  }

  async function performRemoveSymbol(symbol) {
    if (!selectedWatchlist) return;

    loading = true;
    try {
      const currentEntries = selectedWatchlist['watchlist-entries'] || {};

      delete currentEntries[symbol];

      const updatedWatchlist = await watchlistClient.updateWatchlist(selectedWatchlist.id || '', {
        name: selectedWatchlist.name,
        'watchlist-entries': Object.values(currentEntries),
      });

      const watchlistData = updatedWatchlist?.data || updatedWatchlist;

      const index = watchlists.findIndex((w) => w.id === selectedWatchlist?.id);
      if (index >= 0) {
        watchlists[index] = watchlistData;
        watchlists = [...watchlists];
      }

      selectedWatchlist = watchlistData;

      const toast = {
        message: `Removed ${symbol} from ${selectedWatchlist.name}!`,
        background: 'variant-filled-success',
        timeout: 3000,
      };
      toastStore.trigger(toast);
    } catch (error) {
      console.error('Failed to remove symbol from watchlist:', error);
      const toast = {
        message: 'Failed to remove symbol from watchlist. Please try again.',
        background: 'variant-filled-error',
        timeout: 5000,
      };
      toastStore.trigger(toast);
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Watchlist Manager</h2>
    <span
      class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
    >
      {watchlists.length} watchlist{watchlists.length !== 1 ? 's' : ''}
    </span>
  </div>

  <div
    class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 space-y-4"
  >
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Create New Watchlist</h3>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Watchlist Name *
      </label>
      <input
        class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        type="text"
        placeholder="Enter watchlist name..."
        bind:value={newWatchlistName}
        disabled={loading}
      />
    </div>

    <div class="flex justify-end">
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        on:click={createWatchlist}
        disabled={loading || !newWatchlistName.trim()}
      >
        {#if loading}
          <div class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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
            Creating...
          </div>
        {:else}
          Create Watchlist
        {/if}
      </button>
    </div>
  </div>

  <div class="space-y-4">
    {#if watchlists.length === 0}
      <div
        class="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div class="text-4xl mb-4">📋</div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No watchlists yet</h3>
        <p class="text-gray-600 dark:text-gray-300">Create your first watchlist to get started!</p>
      </div>
    {:else}
      {#each watchlists as watchlist, index (watchlist.id)}
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border transition-all cursor-pointer {selectedWatchlist?.id ===
          watchlist.id
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl'}"
          transition:slide={{ duration: 200 }}
        >
          {#if isEditing && selectedWatchlist?.id === watchlist.id}
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Name *
                </label>
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
                  on:click={cancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
                  on:click={saveEdit}
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
              on:click={() => selectWatchlist(watchlist)}
              on:keydown={(e) => e.key === 'Enter' && selectWatchlist(watchlist)}
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
                  on:click|stopPropagation={() => startEdit(watchlist)}
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
                  on:click|stopPropagation={() => confirmDelete(watchlist)}
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
            {#if selectedWatchlist?.id === watchlist.id}
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

                <div class="mb-6">
                  <StreamingChart
                    symbols={getSymbols(watchlist).map((s) => s.symbol)}
                    {sessionToken}
                    height={400}
                  />
                </div>

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
                          on:click={() => removeSymbolFromWatchlist(symbol.symbol)}
                          disabled={loading}
                          title="Remove symbol"
                        >
                          <svg
                            class="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
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
      {/each}
    {/if}
  </div>
</div>
