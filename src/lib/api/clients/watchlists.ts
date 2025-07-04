import { BaseApiClient } from '../base-client';
import type { definitions } from '../types/watchlists';

export type Watchlist = definitions['Watchlist'];
export type PostWatchlistsBody = definitions['postWatchlists'];
export type PutWatchlistBody = definitions['putWatchlistsWatchlistName'];

export class WatchlistsClient extends BaseApiClient {
  /**
   * Get all watchlists for the user
   */
  async getWatchlists(): Promise<Watchlist[]> {
    return this.get<Watchlist[]>('/watchlists');
  }

  /**
   * Get a specific watchlist by name
   */
  async getWatchlist(name: string): Promise<Watchlist> {
    const endpoint = `/watchlists/${encodeURIComponent(name)}`;
    return this.get<Watchlist>(endpoint);
  }

  /**
   * Create a new watchlist
   */
  async createWatchlist(watchlist: PostWatchlistsBody): Promise<Watchlist> {
    return this.post<Watchlist>('/watchlists', watchlist);
  }

  /**
   * Update an existing watchlist
   */
  async updateWatchlist(name: string, watchlist: PutWatchlistBody): Promise<Watchlist> {
    const endpoint = `/watchlists/${encodeURIComponent(name)}`;
    return this.put<Watchlist>(endpoint, watchlist);
  }

  /**
   * Delete a watchlist
   */
  async deleteWatchlist(name: string): Promise<Watchlist> {
    const endpoint = `/watchlists/${encodeURIComponent(name)}`;
    return this.delete<Watchlist>(endpoint);
  }

  /**
   * Get public/pre-made watchlists
   */
  async getPublicWatchlists(): Promise<Watchlist[]> {
    return this.get<Watchlist[]>('/public-watchlists');
  }
}
