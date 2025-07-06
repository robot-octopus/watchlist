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
}

export interface MarketDataResponse {
  symbol: string;
  instrumentType: string;
  updatedAt: string;
  bid?: number;
  bidSize?: number;
  ask?: number;
  askSize?: number;
  last?: number;
  volume?: number;
  open?: number;
  dayHighPrice?: number;
  dayLowPrice?: number;
  close?: number;
  prevClose?: number;
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

    // Set auth token
    this.setAuthToken(options.sessionToken);

    // Initialize quotes map
    this.quotesMap.clear();
    options.symbols.forEach((symbol) => {
      this.quotesMap.set(symbol, {
        symbol,
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
          lastUpdated: Date.now(),
        }
      );
    });
    this.quotesMap = newQuotesMap;

    // Fetch new quotes immediately
    await this.fetchQuotes();
  }

  /**
   * Get current quotes
   */
  getCurrentQuotes(): QuoteData[] {
    return Array.from(this.quotesMap.values());
  }

  /**
   * Fetch quotes from the REST API
   */
  private async fetchQuotes(): Promise<void> {
    if (!this.isPolling || this.currentSymbols.length === 0) {
      return;
    }

    try {
      // The Tastytrade API doesn't appear to have a public REST endpoint for real-time market data
      // The documented endpoints are:
      // - /api-quote-tokens (for streaming setup - returns 404 for some accounts)
      // - /market-metrics (for volatility data, not real-time quotes)
      // - positions endpoint with include-marks (only for symbols you own)

      console.warn(
        'Real-time market data REST API not available. Consider using streaming or upgrading account access.'
      );

      // Create placeholder quote data to prevent errors
      const placeholderQuotes: MarketDataResponse[] = this.currentSymbols.map((symbol) => ({
        symbol,
        instrumentType: 'Stock',
        updatedAt: new Date().toISOString(),
        // No price data - will show as "--" in the UI
      }));

      // Process the placeholder response
      this.processMarketDataResponse(placeholderQuotes);

      // Notify callback
      if (this.onUpdateCallback) {
        this.onUpdateCallback(this.getCurrentQuotes());
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }

  /**
   * Process market data response and update quotes map
   */
  private processMarketDataResponse(data: MarketDataResponse[]): void {
    data.forEach((item) => {
      const existing = this.quotesMap.get(item.symbol);
      if (!existing) return;

      const updated: QuoteData = {
        ...existing,
        lastUpdated: Date.now(),
      };

      // Update quote data
      if (item.bid !== undefined) updated.bidPrice = item.bid;
      if (item.ask !== undefined) updated.askPrice = item.ask;
      if (item.last !== undefined) updated.lastPrice = item.last;
      if (item.bidSize !== undefined) updated.bidSize = item.bidSize;
      if (item.askSize !== undefined) updated.askSize = item.askSize;
      if (item.volume !== undefined) updated.dayVolume = item.volume;

      this.quotesMap.set(item.symbol, updated);
    });
  }

  /**
   * Start the polling timer
   */
  private startPollingTimer(): void {
    this.pollingTimer = setInterval(() => {
      if (this.isPolling) {
        this.fetchQuotes();
      }
    }, this.pollInterval);
  }
}
