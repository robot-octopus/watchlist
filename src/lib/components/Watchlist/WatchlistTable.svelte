<script>
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { browser } from '$app/environment';

  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';

  import { WatchlistsClient } from '$lib/api/clients/watchlists';
  import { QuotesClient } from '$lib/api/clients/quotes';

  import SymbolSearch from '../SymbolLookup/SymbolSearch.svelte';

  export let watchlists = [];
  export let sessionToken = '';

  let selectedWatchlist = null;
  let quotes = [];
  let isLoading = false;
  let newWatchlistName = '';
  let quotesClient = null;
  let editingWatchlistId = null;
  let editingName = '';
  let hasMarketDataAccess = true;

  const modalStore = getModalStore();
  const toastStore = getToastStore();

  const dispatch = createEventDispatcher();

  $: watchlistClient = new WatchlistsClient({ authToken: sessionToken });

  onMount(() => {
    if (browser) {
      quotesClient = new QuotesClient();

      if (watchlists.length > 0 && !selectedWatchlist) {
        selectWatchlist(watchlists[0]);
      }
    }
  });

  onDestroy(() => {
    if (quotesClient) {
      quotesClient.stopPolling();
    }
  });

  async function selectWatchlist(watchlist) {
    selectedWatchlist = watchlist;

    if (!quotesClient) return;

    quotesClient.stopPolling();

    const symbols = getSymbols(watchlist).map((s) => s.symbol);

    if (symbols.length > 0) {
      try {
        await quotesClient.startPolling({
          symbols,
          sessionToken,
          pollInterval: 5000,
          onUpdate: (updatedQuotes) => {
            quotes = updatedQuotes;
          },
          onError: (error) => {
            console.error('Quote polling error:', error);
            hasMarketDataAccess = false;

            const toast = {
              message:
                'Real-time market data requires upgraded account access. Symbols shown without pricing.',
              background: 'variant-filled-warning',
              timeout: 8000,
            };
            toastStore.trigger(toast);
          },
        });
      } catch (error) {
        console.error('Failed to start quote polling:', error);
        hasMarketDataAccess = false;
        const toast = {
          message:
            'Market data access not available for your account type. Contact Tastytrade for upgrade options.',
          background: 'variant-filled-warning',
          timeout: 10000,
        };
        toastStore.trigger(toast);
      }
    } else {
      quotes = [];
    }

    dispatch('select', watchlist);
  }
  function getSymbols(watchlist) {
    if (!watchlist['watchlist-entries']) return [];

    if (Array.isArray(watchlist['watchlist-entries'])) {
      return watchlist['watchlist-entries'];
    }
    return Object.values(watchlist['watchlist-entries']);
  }
  async function createWatchlist() {
    if (!newWatchlistName.trim()) return;

    isLoading = true;
    try {
      const newWatchlist = {
        name: newWatchlistName.trim(),
        'watchlist-entries': [],
      };

      const createdWatchlist = await watchlistClient.createWatchlist(newWatchlist);

      watchlists = [...watchlists, createdWatchlist];
      newWatchlistName = '';

      const toast = {
        message: 'Watchlist created successfully!',
        background: 'variant-filled-success',
        timeout: 3000,
      };
      toastStore.trigger(toast);

      dispatch('create', createdWatchlist);
    } catch (error) {
      console.error('Failed to create watchlist:', error);
      const toast = {
        message: 'Failed to create watchlist. Please try again.',
        background: 'variant-filled-error',
        timeout: 5000,
      };
      toastStore.trigger(toast);
    } finally {
      isLoading = false;
    }
  }

  function confirmDeleteWatchlist(watchlist) {
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

  function startEditWatchlist(watchlist) {
    editingWatchlistId = watchlist.id;
    editingName = watchlist.name || '';
  }

  function cancelEditWatchlist() {
    editingWatchlistId = null;
    editingName = '';
  }

  async function saveEditWatchlist(watchlist) {
    if (!editingName.trim()) return;

    isLoading = true;
    try {
      const updatedWatchlist = await watchlistClient.updateWatchlist(watchlist.id || '', {
        name: editingName.trim(),
        'watchlist-entries': watchlist['watchlist-entries'] || [],
      });

      const index = watchlists.findIndex((w) => w.id === watchlist.id);
      if (index >= 0) {
        watchlists[index] = updatedWatchlist;
        watchlists = [...watchlists];
      }

      if (selectedWatchlist?.id === watchlist.id) {
        selectedWatchlist = updatedWatchlist;
      }

      cancelEditWatchlist();

      const toast = {
        message: 'Watchlist updated successfully!',
        background: 'variant-filled-success',
        timeout: 3000,
      };
      toastStore.trigger(toast);

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
      isLoading = false;
    }
  }

  async function deleteWatchlist(watchlist) {
    isLoading = true;
    try {
      const watchlistId = watchlist.id || '';

      if (!watchlistId) {
        throw new Error('Watchlist ID is empty or undefined');
      }

      let existsOnServer = false;
      try {
        await watchlistClient.getWatchlist(watchlistId);
        existsOnServer = true;
      } catch (verifyError) {
        existsOnServer = false;
      }

      if (existsOnServer) {
        await watchlistClient.deleteWatchlist(watchlistId);
      }

      watchlists = watchlists.filter((w) => w.id !== watchlist.id);

      if (selectedWatchlist?.id === watchlist.id) {
        selectedWatchlist = null;
        quotes = [];
      }

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
      isLoading = false;
    }
  }

  async function handleSymbolSelect(event) {
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

    await addSymbolToWatchlist(symbol, data);
  }

  async function addSymbolToWatchlist(symbol, symbolData) {
    if (!selectedWatchlist) return;

    isLoading = true;
    try {
      const currentEntries = selectedWatchlist['watchlist-entries'] || [];

      const entriesObject = Array.isArray(currentEntries)
        ? currentEntries.reduce((acc, entry) => ({ ...acc, [entry.symbol]: entry }), {})
        : currentEntries;

      if (entriesObject[symbol]) {
        const toast = {
          message: `Symbol ${symbol} is already in this watchlist.`,
          background: 'variant-filled-warning',
          timeout: 3000,
        };
        toastStore.trigger(toast);
        return;
      }

      const newEntry = {
        symbol: symbol,
        'instrument-type': symbolData['instrument-type'] || 'Stock',
      };

      const updatedEntriesObject = {
        ...entriesObject,
        [symbol]: newEntry,
      };

      const updatedEntries = Object.values(updatedEntriesObject);

      const updatedWatchlist = await watchlistClient.updateWatchlist(selectedWatchlist.id || '', {
        name: selectedWatchlist.name,
        'watchlist-entries': updatedEntries,
      });

      const watchlistData = updatedWatchlist?.data || updatedWatchlist;

      const index = watchlists.findIndex((w) => w.id === selectedWatchlist?.id);
      if (index >= 0) {
        watchlists[index] = watchlistData;
        watchlists = [...watchlists];
      }

      selectedWatchlist = watchlistData;

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
      isLoading = false;
    }
  }
  function confirmRemoveSymbol(symbol) {
    const modal = {
      type: 'confirm',
      title: 'Remove Symbol',
      body: `Are you sure you want to remove ${symbol} from ${selectedWatchlist?.name}?`,
      buttonTextCancel: 'Cancel',
      buttonTextConfirm: 'Remove',
      modalClasses: 'dark:!bg-gray-800 dark:!text-white',
      backdropClasses: 'dark:bg-black/60',
      regionHeader: 'dark:text-white dark:border-gray-600',
      regionBody: 'dark:text-gray-200',
      regionFooter: 'dark:border-gray-600',
      response: (confirmed) => {
        if (confirmed) {
          removeSymbolFromWatchlist(symbol);
        }
      },
    };
    modalStore.trigger(modal);
  }

  async function removeSymbolFromWatchlist(symbol) {
    if (!selectedWatchlist) return;

    isLoading = true;
    try {
      const currentEntries = selectedWatchlist['watchlist-entries'] || [];

      const entriesObject = Array.isArray(currentEntries)
        ? currentEntries.reduce((acc, entry) => ({ ...acc, [entry.symbol]: entry }), {})
        : currentEntries;

      delete entriesObject[symbol];

      const updatedEntries = Object.values(entriesObject);

      const updatedWatchlist = await watchlistClient.updateWatchlist(selectedWatchlist.id || '', {
        name: selectedWatchlist.name,
        'watchlist-entries': updatedEntries,
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
      isLoading = false;
    }
  }

  function getQuote(symbol) {
    const quote = quotes.find((q) => q.symbol === symbol);
    if (!quote) {
      return {
        bidPrice: null,
        askPrice: null,
        lastPrice: null,
        bidSize: null,
        askSize: null,
        dayVolume: null,
        status: 'loading',
      };
    }
    return quote;
  }

  function formatPrice(price, status) {
    if (status === 'loading') return '...';
    if (status === 'unavailable' || status === 'error') return '--';
    if (typeof price !== 'number') return '--';
    return price.toFixed(2);
  }

  function formatVolume(volume, status) {
    if (status === 'loading') return '...';
    if (status === 'unavailable' || status === 'error') return '--';
    if (typeof volume !== 'number') return '--';

    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
  }

  function getStatusClass(status) {
    switch (status) {
      case 'loading':
        return 'text-blue-600 dark:text-blue-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'unavailable':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Watchlist</h1>
    <div class="flex items-center space-x-4">
      <span
        class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
      >
        {watchlists.length} watchlist{watchlists.length !== 1 ? 's' : ''}
      </span>
      {#if selectedWatchlist}
        <span
          class="{hasMarketDataAccess
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'} px-3 py-1 rounded-full text-sm font-medium"
        >
          {#if hasMarketDataAccess}
            Live quotes updating
          {:else}
            Market data unavailable
          {/if}
        </span>
      {/if}
    </div>
  </div>

  <div
    class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700"
  >
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Select Watchlist</h2>
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
        on:click={() => {
          const modal = {
            type: 'prompt',
            title: 'Create New Watchlist',
            body: 'Enter a name for your new watchlist:',
            valueAttr: { type: 'text', placeholder: 'Watchlist name...' },
            buttonTextCancel: 'Cancel',
            buttonTextSubmit: 'Submit',
            modalClasses: 'dark:!bg-gray-800 dark:!text-white',
            backdropClasses: 'dark:bg-black/60',
            regionHeader: 'dark:text-white dark:border-gray-600',
            regionBody: 'dark:text-gray-200',
            regionFooter: 'dark:border-gray-600',
            response: (name) => {
              if (name) {
                newWatchlistName = name;
                createWatchlist();
              }
            },
          };
          modalStore.trigger(modal);
        }}
        disabled={isLoading}
      >
        + New Watchlist
      </button>
    </div>

    {#if watchlists.length === 0}
      <div class="text-center py-8">
        <div class="text-4xl mb-4">📋</div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No watchlists yet</h3>
        <p class="text-gray-600 dark:text-gray-300">Create your first watchlist to get started!</p>
      </div>
    {:else}
      <div class="flex flex-wrap gap-2">
        {#each watchlists as watchlist}
          <div
            class="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 {selectedWatchlist?.id ===
            watchlist.id
              ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-200'
              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}"
          >
            {#if editingWatchlistId === watchlist.id}
              <div class="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  bind:value={editingName}
                  class="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Watchlist name..."
                  disabled={isLoading}
                  on:keydown={(e) => {
                    if (e.key === 'Enter') saveEditWatchlist(watchlist);
                    if (e.key === 'Escape') cancelEditWatchlist();
                  }}
                />
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  ({getSymbols(watchlist).length})
                </span>
              </div>

              <button
                class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 rounded transition-colors"
                on:click={() => saveEditWatchlist(watchlist)}
                disabled={isLoading || !editingName.trim()}
                title="Save changes"
                aria-label="Save watchlist name"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </button>
              <button
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded transition-colors"
                on:click={cancelEditWatchlist}
                disabled={isLoading}
                title="Cancel editing"
                aria-label="Cancel editing"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            {:else}
              <div
                class="flex items-center space-x-2 flex-1 cursor-pointer"
                role="button"
                tabindex="0"
                on:click={() => selectWatchlist(watchlist)}
                on:keydown={(e) => e.key === 'Enter' && selectWatchlist(watchlist)}
              >
                <span class="font-medium">{watchlist.name || 'Unnamed Watchlist'}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  ({getSymbols(watchlist).length})
                </span>
              </div>
              <button
                class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                on:click={() => startEditWatchlist(watchlist)}
                disabled={isLoading}
                title="Edit watchlist name"
                aria-label="Edit watchlist name"
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
                class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
                on:click={() => confirmDeleteWatchlist(watchlist)}
                disabled={isLoading}
                title="Delete watchlist"
                aria-label="Delete watchlist"
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
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if selectedWatchlist}
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      transition:slide
    >
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Symbol to {selectedWatchlist.name}
        </h3>
        <SymbolSearch
          {sessionToken}
          placeholder="Search symbols to add..."
          disabled={isLoading}
          on:select={handleSymbolSelect}
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Symbol
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Bid Price
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Ask Price
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Last Price
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Volume
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {#each getSymbols(selectedWatchlist) as symbol}
              {@const quote = getQuote(symbol.symbol)}
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {symbol.symbol}
                    </div>
                    {#if symbol['instrument-type']}
                      <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {symbol['instrument-type']}
                      </span>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm {getStatusClass(quote.status)}">
                    ${formatPrice(quote.bidPrice, quote.status)}
                  </span>
                  {#if quote.bidSize && quote.status === 'success'}
                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ({formatVolume(quote.bidSize, quote.status)})
                    </span>
                  {/if}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm {getStatusClass(quote.status)}">
                    ${formatPrice(quote.askPrice, quote.status)}
                  </span>
                  {#if quote.askSize && quote.status === 'success'}
                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ({formatVolume(quote.askSize, quote.status)})
                    </span>
                  {/if}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium {getStatusClass(quote.status)}">
                    ${formatPrice(quote.lastPrice, quote.status)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm {getStatusClass(quote.status)}">
                    {formatVolume(quote.dayVolume, quote.status)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
                    on:click={() => confirmRemoveSymbol(symbol.symbol)}
                    disabled={isLoading}
                    aria-label="Remove {symbol.symbol} from watchlist"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>

        {#if getSymbols(selectedWatchlist).length === 0}
          <div class="text-center py-8">
            <div class="text-4xl mb-4">📈</div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No symbols yet</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Use the search above to add symbols to this watchlist.
            </p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
