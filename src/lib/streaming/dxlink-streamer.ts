import { StreamingClient } from '$lib/api/clients/streaming';

export interface MarketData {
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

export interface StreamingOptions {
  sessionToken: string;
  onData?: (data: MarketData[]) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class DXLinkStreamer {
  private ws: WebSocket | null = null;
  private streamingClient: StreamingClient;
  private options: StreamingOptions;
  private isConnected = false;
  private isAuthorized = false;
  private keepaliveInterval: number | null = null;
  private currentChannel = 3;
  private subscribedSymbols = new Set<string>();

  constructor(options: StreamingOptions) {
    this.options = options;
    this.streamingClient = new StreamingClient({ authToken: options.sessionToken });
  }

  async connect(): Promise<void> {
    try {
      // Get API quote token
      const tokenData = await this.streamingClient.getApiQuoteToken();
      console.log('Got API quote token:', tokenData);

      // Connect to WebSocket
      this.ws = new WebSocket(tokenData['dxlink-url']);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.sendSetup();
        this.options.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.isAuthorized = false;
        this.cleanup();
        this.options.onDisconnect?.();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.options.onError?.(new Error('WebSocket connection error'));
      };

      // Store token for authorization
      this.apiQuoteToken = tokenData.token;
    } catch (error) {
      console.error('Failed to connect to streaming:', error);

      // Check for specific API errors and propagate them
      const errorMessage = (error as any)?.message || error?.toString() || '';
      if (errorMessage.includes('quote_streamer.customer_not_found_error')) {
        const customError = new Error(
          'quote_streamer.customer_not_found_error: You must be a customer to access a quote stream.'
        );
        throw customError;
      }

      this.options.onError?.(error as Error);
      throw error;
    }
  }

  private apiQuoteToken = '';

  private sendSetup(): void {
    const setupMessage = {
      type: 'SETUP',
      channel: 0,
      version: '0.1-DXF-JS/0.3.0',
      keepaliveTimeout: 60,
      acceptKeepaliveTimeout: 60,
    };
    this.sendMessage(setupMessage);
  }

  private sendAuthorize(): void {
    const authMessage = {
      type: 'AUTH',
      channel: 0,
      token: this.apiQuoteToken,
    };
    this.sendMessage(authMessage);
  }

  private requestChannel(): void {
    const channelMessage = {
      type: 'CHANNEL_REQUEST',
      channel: this.currentChannel,
      service: 'FEED',
      parameters: { contract: 'AUTO' },
    };
    this.sendMessage(channelMessage);
  }

  private setupFeed(): void {
    const feedSetupMessage = {
      type: 'FEED_SETUP',
      channel: this.currentChannel,
      acceptAggregationPeriod: 0.1,
      acceptDataFormat: 'COMPACT',
      acceptEventFields: {
        Trade: ['eventType', 'eventSymbol', 'price', 'dayVolume', 'size'],
        Quote: ['eventType', 'eventSymbol', 'bidPrice', 'askPrice', 'bidSize', 'askSize'],
        Summary: [
          'eventType',
          'eventSymbol',
          'dayOpenPrice',
          'dayHighPrice',
          'dayLowPrice',
          'prevDayClosePrice',
        ],
      },
    };
    this.sendMessage(feedSetupMessage);
  }

  private startKeepalive(): void {
    this.keepaliveInterval = window.setInterval(() => {
      if (this.isConnected) {
        this.sendMessage({ type: 'KEEPALIVE', channel: 0 });
      }
    }, 30000); // Send keepalive every 30 seconds
  }

  private handleMessage(message: any): void {
    console.log('Received message:', message);

    switch (message.type) {
      case 'SETUP':
        console.log('Setup completed');
        break;

      case 'AUTH_STATE':
        if (message.state === 'UNAUTHORIZED') {
          this.sendAuthorize();
        } else if (message.state === 'AUTHORIZED') {
          console.log('Authorized successfully');
          this.isAuthorized = true;
          this.requestChannel();
        }
        break;

      case 'CHANNEL_OPENED':
        console.log('Channel opened:', message.channel);
        this.setupFeed();
        this.startKeepalive();
        break;

      case 'FEED_CONFIG':
        console.log('Feed configured');
        break;

      case 'FEED_DATA':
        this.handleMarketData(message);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleMarketData(message: any): void {
    if (!message.data || !Array.isArray(message.data)) return;

    const marketDataArray: MarketData[] = [];

    // Parse the compact format data
    for (let i = 0; i < message.data.length; i += 2) {
      const eventType = message.data[i];
      const eventData = message.data[i + 1];

      if (Array.isArray(eventData)) {
        // Parse each event in the data array
        for (let j = 0; j < eventData.length; j += this.getEventFieldCount(eventType)) {
          const marketData = this.parseEventData(
            eventType,
            eventData.slice(j, j + this.getEventFieldCount(eventType))
          );
          if (marketData) {
            marketDataArray.push(marketData);
          }
        }
      }
    }

    if (marketDataArray.length > 0) {
      this.options.onData?.(marketDataArray);
    }
  }

  private getEventFieldCount(eventType: string): number {
    switch (eventType) {
      case 'Trade':
        return 5; // eventType, eventSymbol, price, dayVolume, size
      case 'Quote':
        return 6; // eventType, eventSymbol, bidPrice, askPrice, bidSize, askSize
      case 'Summary':
        return 6; // eventType, eventSymbol, dayOpenPrice, dayHighPrice, dayLowPrice, prevDayClosePrice
      default:
        return 2;
    }
  }

  private parseEventData(eventType: string, data: any[]): MarketData | null {
    if (!data || data.length < 2) return null;

    const baseData: MarketData = {
      eventType: data[0],
      eventSymbol: data[1],
      timestamp: Date.now(),
    };

    switch (eventType) {
      case 'Trade':
        return {
          ...baseData,
          price: data[2],
          dayVolume: data[3],
          size: data[4],
        };

      case 'Quote':
        return {
          ...baseData,
          bidPrice: data[2],
          askPrice: data[3],
          bidSize: data[4],
          askSize: data[5],
        };

      case 'Summary':
        return {
          ...baseData,
          // For summary, we'll use the close price as the main price
          price: data[5], // prevDayClosePrice
        };

      default:
        return baseData;
    }
  }

  subscribeToSymbols(symbols: string[]): void {
    if (!this.isAuthorized || symbols.length === 0) return;

    const subscriptions = [];

    for (const symbol of symbols) {
      if (!this.subscribedSymbols.has(symbol)) {
        subscriptions.push(
          { type: 'Trade', symbol },
          { type: 'Quote', symbol },
          { type: 'Summary', symbol }
        );
        this.subscribedSymbols.add(symbol);
      }
    }

    if (subscriptions.length > 0) {
      const subscriptionMessage = {
        type: 'FEED_SUBSCRIPTION',
        channel: this.currentChannel,
        reset: false,
        add: subscriptions,
      };
      this.sendMessage(subscriptionMessage);
      console.log('Subscribed to symbols:', symbols);
    }
  }

  unsubscribeFromSymbols(symbols: string[]): void {
    if (!this.isAuthorized || symbols.length === 0) return;

    const unsubscriptions = [];

    for (const symbol of symbols) {
      if (this.subscribedSymbols.has(symbol)) {
        unsubscriptions.push(
          { type: 'Trade', symbol },
          { type: 'Quote', symbol },
          { type: 'Summary', symbol }
        );
        this.subscribedSymbols.delete(symbol);
      }
    }

    if (unsubscriptions.length > 0) {
      const unsubscriptionMessage = {
        type: 'FEED_SUBSCRIPTION',
        channel: this.currentChannel,
        reset: false,
        remove: unsubscriptions,
      };
      this.sendMessage(unsubscriptionMessage);
      console.log('Unsubscribed from symbols:', symbols);
    }
  }

  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log('Sent message:', message);
    }
  }

  private cleanup(): void {
    if (this.keepaliveInterval) {
      clearInterval(this.keepaliveInterval);
      this.keepaliveInterval = null;
    }
    this.subscribedSymbols.clear();
  }

  disconnect(): void {
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get connected(): boolean {
    return this.isConnected && this.isAuthorized;
  }

  get subscribedSymbolsList(): string[] {
    return Array.from(this.subscribedSymbols);
  }
}
