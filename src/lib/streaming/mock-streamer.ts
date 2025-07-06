// Mock streaming service for development when Tastytrade customer account is not available

export interface MockMarketData {
  eventType: string;
  eventSymbol: string;
  price?: number;
  bidPrice?: number;
  askPrice?: number;
  bidSize?: number;
  askSize?: number;
  dayVolume?: number;
  size?: number;
  timestamp?: number;
}

export interface MockStreamingOptions {
  onData?: (data: MockMarketData[]) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class MockDXLinkStreamer {
  private options: MockStreamingOptions;
  private isConnected = false;
  private subscribedSymbols = new Set<string>();
  private intervals = new Map<string, any>();
  private basePrices = new Map<string, number>();

  constructor(options: MockStreamingOptions) {
    this.options = options;
  }

  async connect(): Promise<void> {
    console.log('🎭 Mock Streamer: Connecting...');

    // Simulate connection delay
    setTimeout(() => {
      this.isConnected = true;
      console.log('🎭 Mock Streamer: Connected successfully');
      this.options.onConnect?.();
    }, 1000) as any;
  }

  subscribeToSymbols(symbols: string[]): void {
    console.log('🎭 Mock Streamer: Subscribing to symbols:', symbols);

    for (const symbol of symbols) {
      if (!this.subscribedSymbols.has(symbol)) {
        this.subscribedSymbols.add(symbol);
        this.startMockDataForSymbol(symbol);
      }
    }
  }

  unsubscribeFromSymbols(symbols: string[]): void {
    console.log('🎭 Mock Streamer: Unsubscribing from symbols:', symbols);

    for (const symbol of symbols) {
      if (this.subscribedSymbols.has(symbol)) {
        this.subscribedSymbols.delete(symbol);
        this.stopMockDataForSymbol(symbol);
      }
    }
  }

  private startMockDataForSymbol(symbol: string): void {
    // Set initial price based on symbol (simulate different stock prices)
    let basePrice = 100;
    if (symbol.includes('AAPL')) basePrice = 175;
    else if (symbol.includes('GOOGL')) basePrice = 2800;
    else if (symbol.includes('TSLA')) basePrice = 250;
    else if (symbol.includes('MSFT')) basePrice = 350;
    else if (symbol.includes('NVDA')) basePrice = 800;
    else if (symbol.includes('SPY')) basePrice = 450;
    else basePrice = Math.random() * 200 + 50; // Random price for unknown symbols

    this.basePrices.set(symbol, basePrice);

    // Generate price updates every 1-3 seconds
    const interval = setInterval(
      () => {
        if (this.subscribedSymbols.has(symbol) && this.isConnected) {
          this.generateMockData(symbol);
        }
      },
      1000 + Math.random() * 2000
    );

    this.intervals.set(symbol, interval as any);
  }

  private stopMockDataForSymbol(symbol: string): void {
    const interval = this.intervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(symbol);
    }
    this.basePrices.delete(symbol);
  }

  private generateMockData(symbol: string): void {
    const basePrice = this.basePrices.get(symbol) || 100;

    // Create realistic price movement (±2% typically)
    const changePercent = (Math.random() - 0.5) * 0.04; // ±2%
    const newPrice = basePrice * (1 + changePercent);

    // Update base price gradually (trend)
    this.basePrices.set(symbol, basePrice * (1 + changePercent * 0.1));

    // Generate mock market data
    const mockData: MockMarketData[] = [
      // Trade event
      {
        eventType: 'Trade',
        eventSymbol: symbol,
        price: newPrice,
        dayVolume: Math.floor(Math.random() * 1000000),
        size: Math.floor(Math.random() * 1000) + 100,
        timestamp: Date.now(),
      },
      // Quote event
      {
        eventType: 'Quote',
        eventSymbol: symbol,
        bidPrice: newPrice - 0.01,
        askPrice: newPrice + 0.01,
        bidSize: Math.floor(Math.random() * 1000) + 100,
        askSize: Math.floor(Math.random() * 1000) + 100,
        timestamp: Date.now(),
      },
    ];

    this.options.onData?.(mockData);
  }

  disconnect(): void {
    console.log('🎭 Mock Streamer: Disconnecting...');
    this.isConnected = false;

    // Clear all intervals
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
    this.subscribedSymbols.clear();
    this.basePrices.clear();

    this.options.onDisconnect?.();
  }

  get connected(): boolean {
    return this.isConnected;
  }

  get subscribedSymbolsList(): string[] {
    return Array.from(this.subscribedSymbols);
  }
}
