import { WatchlistsClient } from '$lib/api/clients/watchlists';
import type { ToastStore } from '@skeletonlabs/skeleton';

export interface WatchlistEntry {
  symbol: string;
  'instrument-type'?: string;
}

export interface Watchlist {
  id: string;
  name: string;
  'watchlist-entries': Record<string, WatchlistEntry> | WatchlistEntry[];
  'order-index'?: number;
}

export interface WatchlistActionOptions {
  sessionToken: string;
  toastStore: ToastStore;
}

export class WatchlistActions {
  private client: WatchlistsClient;
  private toastStore: ToastStore;

  constructor(options: WatchlistActionOptions) {
    this.client = new WatchlistsClient({ authToken: options.sessionToken });
    this.toastStore = options.toastStore;
  }

  private showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    const backgrounds = {
      success: 'variant-filled-success',
      error: 'variant-filled-error',
      warning: 'variant-filled-warning',
    };

    const timeouts = {
      success: 3000,
      error: 5000,
      warning: 3000,
    };

    this.toastStore.trigger({
      message,
      background: backgrounds[type],
      timeout: timeouts[type],
    });
  }

  async createWatchlist(name: string): Promise<Watchlist> {
    try {
      const newWatchlist = {
        name: name.trim(),
        'watchlist-entries': [],
      };

      const response = await this.client.createWatchlist(newWatchlist);
      const watchlistData = (response as any)?.data || response;

      this.showToast('Watchlist created successfully!');
      return watchlistData as Watchlist;
    } catch (error) {
      console.error('Failed to create watchlist:', error);
      this.showToast('Failed to create watchlist. Please try again.', 'error');
      throw error;
    }
  }

  async updateWatchlist(watchlist: Watchlist, updates: Partial<Watchlist>): Promise<Watchlist> {
    try {
      const entriesArray = Array.isArray(updates['watchlist-entries'])
        ? updates['watchlist-entries']
        : updates['watchlist-entries']
          ? Object.values(updates['watchlist-entries'])
          : Object.values(watchlist['watchlist-entries'] || {});

      const updatedWatchlist = await this.client.updateWatchlist(watchlist.id, {
        name: updates.name || watchlist.name,
        'watchlist-entries': entriesArray,
      });

      const watchlistData = (updatedWatchlist as any)?.data || updatedWatchlist;
      this.showToast('Watchlist updated successfully!');
      return watchlistData as Watchlist;
    } catch (error) {
      console.error('Failed to update watchlist:', error);
      this.showToast('Failed to update watchlist. Please try again.', 'error');
      throw error;
    }
  }

  async deleteWatchlist(watchlist: Watchlist): Promise<void> {
    try {
      const watchlistId = watchlist.id;

      if (!watchlistId) {
        throw new Error('Watchlist ID is empty or undefined');
      }

      let existsOnServer = false;
      try {
        await this.client.getWatchlist(watchlistId);
        existsOnServer = true;
      } catch {
        existsOnServer = false;
      }

      if (existsOnServer) {
        await this.client.deleteWatchlist(watchlistId);
      }

      this.showToast('Watchlist deleted successfully!');
    } catch (error) {
      console.error('Failed to delete watchlist:', error);
      this.showToast('Failed to delete watchlist. Please try again.', 'error');
      throw error;
    }
  }

  async addSymbolToWatchlist(
    watchlist: Watchlist,
    symbol: string,
    symbolData: any
  ): Promise<Watchlist> {
    try {
      const currentEntries = watchlist['watchlist-entries'] || {};

      const entriesObject = Array.isArray(currentEntries)
        ? currentEntries.reduce((acc, entry) => ({ ...acc, [entry.symbol]: entry }), {})
        : currentEntries;

      if (entriesObject[symbol]) {
        this.showToast(`Symbol ${symbol} is already in this watchlist.`, 'warning');
        return watchlist;
      }

      const newEntry: WatchlistEntry = {
        symbol: symbol,
        'instrument-type': symbolData['instrument-type'] || 'Stock',
      };

      const updatedEntries = {
        ...entriesObject,
        [symbol]: newEntry,
      };

      const updatedWatchlist = await this.client.updateWatchlist(watchlist.id, {
        name: watchlist.name,
        'watchlist-entries': Object.values(updatedEntries),
      });

      const watchlistData = updatedWatchlist?.data || updatedWatchlist;
      this.showToast(`Added ${symbol} to ${watchlist.name}!`);
      return watchlistData;
    } catch (error) {
      console.error('Failed to add symbol to watchlist:', error);
      this.showToast('Failed to add symbol to watchlist. Please try again.', 'error');
      throw error;
    }
  }

  async removeSymbolFromWatchlist(watchlist: Watchlist, symbol: string): Promise<Watchlist> {
    try {
      const currentEntries = watchlist['watchlist-entries'] || {};

      const entriesObject = Array.isArray(currentEntries)
        ? currentEntries.reduce((acc, entry) => ({ ...acc, [entry.symbol]: entry }), {})
        : currentEntries;

      delete entriesObject[symbol];

      const updatedWatchlist = await this.client.updateWatchlist(watchlist.id, {
        name: watchlist.name,
        'watchlist-entries': Object.values(entriesObject),
      });

      const watchlistData = updatedWatchlist?.data || updatedWatchlist;
      this.showToast(`Removed ${symbol} from ${watchlist.name}!`);
      return watchlistData;
    } catch (error) {
      console.error('Failed to remove symbol from watchlist:', error);
      this.showToast('Failed to remove symbol from watchlist. Please try again.', 'error');
      throw error;
    }
  }
}

export function getSymbolCount(watchlist: Watchlist): number {
  if (!watchlist['watchlist-entries']) return 0;

  if (Array.isArray(watchlist['watchlist-entries'])) {
    return watchlist['watchlist-entries'].length;
  }

  return Object.values(watchlist['watchlist-entries']).length;
}

export function getSymbols(watchlist: Watchlist): WatchlistEntry[] {
  if (!watchlist['watchlist-entries']) return [];

  if (Array.isArray(watchlist['watchlist-entries'])) {
    return watchlist['watchlist-entries'];
  }

  return Object.values(watchlist['watchlist-entries']);
}

export function getSymbolsAsObject(watchlist: Watchlist): Record<string, WatchlistEntry> {
  if (!watchlist['watchlist-entries']) return {};

  if (Array.isArray(watchlist['watchlist-entries'])) {
    return watchlist['watchlist-entries'].reduce(
      (acc, entry) => ({ ...acc, [entry.symbol]: entry }),
      {}
    );
  }

  return watchlist['watchlist-entries'];
}
