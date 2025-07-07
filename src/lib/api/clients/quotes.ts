import { BaseApiClient } from '../base-client';

export interface QuoteData {
  symbol: string;
  bidPrice?: number;
  askPrice?: number;
  lastPrice?: number;
  bidSize?: number;
  askSize?: number;
  dayVolume?: number;
  lastUpdated?: number;
  status?: 'loading' | 'unavailable' | 'error' | 'success';
}

export interface MarketDataResponse {
  symbol: string;
  'instrument-type': string;
  'updated-at': string;
  bid?: string;
  'bid-size'?: string;
  ask?: string;
  'ask-size'?: string;
  last?: string;
  volume?: string;
  open?: string;
  'day-high-price'?: string;
  'day-low-price'?: string;
  close?: string;
  'prev-close'?: string;
}

export interface QuotesPollingOptions {
  symbols: string[];
  sessionToken: string;
  pollInterval?: number; // milliseconds, default 5000 (5 seconds)
  onUpdate?: (quotes: QuoteData[]) => void;
  onError?: (error: Error) => void;
}

export class QuotesClient extends BaseApiClient {
  private quotesMap: Map<string, QuoteData> = new Map();
  private pollInterval: number = 5000;
  private pollingTimer: NodeJS.Timeout | null = null;
  private onUpdateCallback: ((quotes: QuoteData[]) => void) | undefined;
  private onErrorCallback: ((error: Error) => void) | undefined;
  private isPolling = false;
  private currentSymbols: string[] = [];
  private hasMarketDataError = false;

  /**
   * Start polling for quotes for the specified symbols
   */
  async startPolling(options: QuotesPollingOptions): Promise<void> {
    // Stop any existing polling
    this.stopPolling();

    this.pollInterval = options.pollInterval || 5000;
    this.onUpdateCallback = options.onUpdate;
    this.onErrorCallback = options.onError;
    this.currentSymbols = [...options.symbols];
    this.hasMarketDataError = false;

    // Set auth token
    this.setAuthToken(options.sessionToken);

    // Initialize quotes map
    this.quotesMap.clear();
    options.symbols.forEach((symbol) => {
      this.quotesMap.set(symbol, {
        symbol,
        status: 'loading',
        lastUpdated: Date.now(),
      });
    });

    // Start polling
    this.isPolling = true;
    this.startPollingTimer();

    // Initial fetch
    await this.fetchQuotes();
  }

  /**
   * Stop polling and cleanup resources
   */
  stopPolling(): void {
    this.isPolling = false;

    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }

    this.quotesMap.clear();
    this.currentSymbols = [];
    this.hasMarketDataError = false;
  }

  /**
   * Update the symbols being polled
   */
  async updateSymbols(symbols: string[], sessionToken: string): Promise<void> {
    if (!this.isPolling) {
      return;
    }

    this.currentSymbols = [...symbols];
    this.setAuthToken(sessionToken);

    // Update quotes map
    const newQuotesMap = new Map<string, QuoteData>();
    symbols.forEach((symbol) => {
      const existing = this.quotesMap.get(symbol);
      newQuotesMap.set(
        symbol,
        existing || {
          symbol,
          status: this.hasMarketDataError ? 'unavailable' : 'loading',
          lastUpdated: Date.now(),
        }
      );
    });
    this.quotesMap = newQuotesMap;

    // Fetch new quotes immediately if no error
    if (!this.hasMarketDataError) {
      await this.fetchQuotes();
    }
  }

  /**
   * Get current quotes
   */
  getCurrentQuotes(): QuoteData[] {
    return Array.from(this.quotesMap.values());
  }

  /**
   * Fetch quotes from the REST API using /market-data/by-type endpoint
   */
  private async fetchQuotes(): Promise<void> {
    if (!this.isPolling || this.currentSymbols.length === 0 || this.hasMarketDataError) {
      return;
    }

    try {
      console.log(`Attempting to fetch quotes for symbols: ${this.currentSymbols.join(', ')}`);

      // Build query parameters for market data endpoint
      // All symbols are assumed to be equities for now
      const equitySymbols = this.currentSymbols.join(',');
      const endpoint = `/market-data/by-type?equity=${encodeURIComponent(equitySymbols)}`;

      console.log(`Making request to: ${endpoint}`);

      // Make the API request
      const response = await this.get<{ data: { items: MarketDataResponse[] } }>(endpoint);

      console.log('Market data response received successfully:', response);

      // Process the response
      if (response?.data?.items) {
        this.processMarketDataResponse(response.data.items);
      } else {
        // No data returned, set status to unavailable
        this.setAllSymbolsStatus('unavailable');
      }

      // Notify callback
      if (this.onUpdateCallback) {
        this.onUpdateCallback(this.getCurrentQuotes());
      }
    } catch (error: any) {
      console.error('Failed to fetch market data:', error);

      // Check if this is a server error (500) or API limitation
      if (error.statusCode === 500) {
        console.log('Market data endpoint returned 500 - likely not available in production yet');
        this.hasMarketDataError = true;
        this.setAllSymbolsStatus('unavailable');

        if (this.onErrorCallback) {
          this.onErrorCallback(
            new Error(
              'Market data REST endpoint not available. Real-time quotes require streaming access or account upgrade.'
            )
          );
        }
      } else if (error.statusCode === 401) {
        console.log('Market data endpoint requires authentication or account upgrade');
        this.hasMarketDataError = true;
        this.setAllSymbolsStatus('unavailable');

        if (this.onErrorCallback) {
          this.onErrorCallback(
            new Error(
              'Market data access requires account upgrade. Contact Tastytrade for real-time quote access.'
            )
          );
        }
      } else {
        this.setAllSymbolsStatus('error');
        if (this.onErrorCallback) {
          this.onErrorCallback(error as Error);
        }
      }
    }
  }

  /**
   * Set status for all symbols
   */
  private setAllSymbolsStatus(status: 'loading' | 'unavailable' | 'error' | 'success'): void {
    this.currentSymbols.forEach((symbol) => {
      const existing = this.quotesMap.get(symbol);
      if (existing) {
        const updated: QuoteData = {
          symbol: existing.symbol,
          status,
          lastUpdated: Date.now(),
        };

        // Only set properties that have values
        if (existing.bidPrice !== undefined) updated.bidPrice = existing.bidPrice;
        if (existing.askPrice !== undefined) updated.askPrice = existing.askPrice;
        if (existing.lastPrice !== undefined) updated.lastPrice = existing.lastPrice;
        if (existing.bidSize !== undefined) updated.bidSize = existing.bidSize;
        if (existing.askSize !== undefined) updated.askSize = existing.askSize;
        if (existing.dayVolume !== undefined) updated.dayVolume = existing.dayVolume;

        this.quotesMap.set(symbol, updated);
      }
    });

    // Notify callback with updated status
    if (this.onUpdateCallback) {
      this.onUpdateCallback(this.getCurrentQuotes());
    }
  }

  /**
   * Process market data response and update quotes map
   */
  private processMarketDataResponse(items: MarketDataResponse[]): void {
    items.forEach((item) => {
      const existing = this.quotesMap.get(item.symbol);
      if (!existing) return;

      const updated: QuoteData = {
        ...existing,
        status: 'success',
        lastUpdated: Date.now(),
      };

      // Update quote data - convert strings to numbers
      if (item.bid !== undefined) updated.bidPrice = parseFloat(item.bid);
      if (item.ask !== undefined) updated.askPrice = parseFloat(item.ask);
      if (item.last !== undefined) updated.lastPrice = parseFloat(item.last);
      if (item['bid-size'] !== undefined) updated.bidSize = parseFloat(item['bid-size']);
      if (item['ask-size'] !== undefined) updated.askSize = parseFloat(item['ask-size']);
      if (item.volume !== undefined) updated.dayVolume = parseFloat(item.volume);

      this.quotesMap.set(item.symbol, updated);
    });

    // Mark any symbols not in response as unavailable
    this.currentSymbols.forEach((symbol) => {
      const hasData = items.some((item) => item.symbol === symbol);
      if (!hasData) {
        const existing = this.quotesMap.get(symbol);
        if (existing && existing.status === 'loading') {
          this.quotesMap.set(symbol, {
            ...existing,
            status: 'unavailable',
            lastUpdated: Date.now(),
          });
        }
      }
    });
  }

  /**
   * Start the polling timer
   */
  private startPollingTimer(): void {
    this.pollingTimer = setInterval(() => {
      if (this.isPolling && !this.hasMarketDataError) {
        this.fetchQuotes();
      }
    }, this.pollInterval);
  }
}
