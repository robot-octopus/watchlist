/**
 * Main API client for Tastytrade integration
 */

import type { ApiClientOptions } from './base-client';
import { SymbolSearchClient } from './clients/symbol-search';
import { WatchlistsClient } from './clients/watchlists';
import { MarketMetricsClient } from './clients/market-metrics';

export class TastytradeApiClient {
  public readonly symbolSearch: SymbolSearchClient;
  public readonly watchlists: WatchlistsClient;
  public readonly marketMetrics: MarketMetricsClient;

  constructor(options: ApiClientOptions = {}) {
    this.symbolSearch = new SymbolSearchClient(options);
    this.watchlists = new WatchlistsClient(options);
    this.marketMetrics = new MarketMetricsClient(options);
  }
}

// Named exports for individual clients
export { SymbolSearchClient } from './clients/symbol-search';
export { MarketMetricsClient } from './clients/market-metrics';
export { WatchlistsClient } from './clients/watchlists';
export { BaseApiClient, ApiError } from './base-client';
export type { ApiClientOptions } from './base-client';
