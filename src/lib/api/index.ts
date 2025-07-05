/**
 * Main API client for Tastytrade integration
 */

import type { ApiClientOptions } from './base-client';
import { SymbolSearchClient } from './clients/symbol-search';
import { WatchlistsClient } from './clients/watchlists';
import { MarketMetricsClient } from './clients/market-metrics';
import { OAuth2Client } from './clients/oauth';

export class TastytradeApiClient {
  public readonly symbolSearch: SymbolSearchClient;
  public readonly watchlists: WatchlistsClient;
  public readonly marketMetrics: MarketMetricsClient;
  public readonly oauth: OAuth2Client;

  constructor(options: ApiClientOptions = {}) {
    this.symbolSearch = new SymbolSearchClient(options);
    this.watchlists = new WatchlistsClient(options);
    this.marketMetrics = new MarketMetricsClient(options);
    this.oauth = new OAuth2Client(options);
  }
}

// Named exports for individual clients
export { SymbolSearchClient } from './clients/symbol-search';
export { MarketMetricsClient } from './clients/market-metrics';
export { WatchlistsClient } from './clients/watchlists';
export { OAuth2Client } from './clients/oauth';
export { BaseApiClient, ApiError } from './base-client';
export type { ApiClientOptions } from './base-client';
