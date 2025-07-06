<!-- Watchlist Manager Component -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';

  // Skeleton UI imports
  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';

  // Import the WatchlistsClient
  import { WatchlistsClient } from '$lib/api/clients/watchlists';

  // Props
  export let watchlists = [];
  export let sessionToken = '';

  // State
  let selectedWatchlist = null;
  let isEditing = false;
  let editingName = '';
  let editingGroupName = '';
  let newWatchlistName = '';
  let newWatchlistGroupName = '';
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
    editingGroupName = watchlist['group-name'] || '';
    selectedWatchlist = watchlist;
  }

  // Cancel editing
  function cancelEdit() {
    isEditing = false;
    editingName = '';
    editingGroupName = '';
    selectedWatchlist = null;
  }

  // Save edited watchlist
  async function saveEdit() {
    if (!selectedWatchlist || !editingName.trim()) return;

    loading = true;
    try {
      const updatedWatchlist = await watchlistClient.updateWatchlist(selectedWatchlist.name || '', {
        name: editingName.trim(),
        'group-name': editingGroupName.trim() || undefined,
        'watchlist-entries': selectedWatchlist['watchlist-entries'] || [],
      });

      // Update the watchlists array
      const index = watchlists.findIndex((w) => w.name === selectedWatchlist?.name);
      if (index >= 0) {
        watchlists[index] = updatedWatchlist;
        watchlists = [...watchlists];
      }

      // Show success toast
      const toast = {
        message: 'Watchlist updated successfully!',
        background: 'variant-filled-success',
        timeout: 3000,
      };
      toastStore.trigger(toast);

      cancelEdit();
      dispatch('update', updatedWatchlist);
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
    // Debug: Log the watchlist object structure
    console.log('Watchlist object for deletion:', watchlist);
    console.log('Available properties:', Object.keys(watchlist));

    // Try different possible property names
    const watchlistName =
      watchlist.name || watchlist.title || watchlist.label || 'Unnamed Watchlist';
    console.log('Using watchlist name:', watchlistName);

    const modal = {
      type: 'confirm',
      title: 'Delete Watchlist',
      body: `Are you sure you want to delete "${watchlistName}"? This action cannot be undone.`,
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
      await watchlistClient.deleteWatchlist(watchlist.name || '');

      // Remove from watchlists array
      watchlists = watchlists.filter((w) => w.name !== watchlist.name);

      // Clear selection if this was selected
      if (selectedWatchlist?.name === watchlist.name) {
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
        'group-name': newWatchlistGroupName.trim() || undefined,
        'watchlist-entries': [],
      };

      const createdWatchlist = await watchlistClient.createWatchlist(newWatchlist);

      // Debug: Log the actual structure of the created watchlist
      console.log('Created watchlist response:', createdWatchlist);
      console.log('Watchlist name:', createdWatchlist?.name);
      console.log('Watchlist data:', createdWatchlist?.data);

      // Handle nested response structure like in the server load
      const watchlistData = createdWatchlist?.data || createdWatchlist;
      console.log('Processed watchlist data:', watchlistData);

      // Add to watchlists array
      watchlists = [...watchlists, watchlistData];

      // Clear form
      newWatchlistName = '';
      newWatchlistGroupName = '';

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
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex justify-between items-center">
    <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Watchlist Manager</h2>
    <span
      class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
    >
      {watchlists.length} watchlist{watchlists.length !== 1 ? 's' : ''}
    </span>
  </div>

  <!-- Create New Watchlist Card -->
  <div
    class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 space-y-4"
  >
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Create New Watchlist</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Group Name (optional)
        </label>
        <input
          class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          type="text"
          placeholder="Enter group name..."
          bind:value={newWatchlistGroupName}
          disabled={loading}
        />
      </div>
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

  <!-- Watchlists List -->
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
      {#each watchlists as watchlist, index (watchlist.name)}
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border transition-all cursor-pointer {selectedWatchlist?.name ===
          watchlist.name
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl'}"
          transition:slide={{ duration: 200 }}
        >
          {#if isEditing && selectedWatchlist?.name === watchlist.name}
            <!-- Edit Mode -->
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Group Name
                  </label>
                  <input
                    class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    type="text"
                    bind:value={editingGroupName}
                    disabled={loading}
                  />
                </div>
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
            <!-- View Mode -->
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
                    {#if watchlist['group-name']}
                      <span>Group: {watchlist['group-name']}</span>
                    {/if}
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
            {#if selectedWatchlist?.name === watchlist.name}
              <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600" transition:slide>
                <h5 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Symbols ({getSymbolCount(watchlist)})
                </h5>
                {#if getSymbolCount(watchlist) > 0}
                  <div class="flex flex-wrap gap-2">
                    {#each getSymbols(watchlist) as symbol}
                      <span
                        class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600"
                      >
                        {symbol.symbol || 'Unknown'}
                        {#if symbol['instrument-type']}
                          <span class="text-xs text-gray-500 dark:text-gray-400 ml-1"
                            >({symbol['instrument-type']})</span
                          >
                        {/if}
                      </span>
                    {/each}
                  </div>
                {:else}
                  <p class="text-gray-500 dark:text-gray-400 italic">
                    No symbols in this watchlist
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
