import { BaseApiClient } from '../base-client';

export interface ApiQuoteToken {
  token: string;
  'dxlink-url': string;
  level: string;
}

export class StreamingClient extends BaseApiClient {
  /**
   * Get an API quote token for streaming market data
   */
  async getApiQuoteToken(): Promise<ApiQuoteToken> {
    try {
      const response = await this.get<{ data: ApiQuoteToken }>('/api-quote-tokens');
      return response.data;
    } catch (error: any) {
      // Check for customer not found error and re-throw with clear message
      if (
        error.message?.includes('quote_streamer.customer_not_found_error') ||
        error.statusCode === 403
      ) {
        throw new Error(
          'quote_streamer.customer_not_found_error: You must be a customer to access a quote stream.'
        );
      }
      throw error;
    }
  }
}
