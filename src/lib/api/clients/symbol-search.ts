import { BaseApiClient } from '../base-client';

export interface SymbolData {
  symbol: string;
  description?: string;
  'listed-market'?: string;
  'price-increments'?: string;
  'trading-hours'?: string;
  options?: boolean;
  'instrument-type'?: string;
}

export class SymbolSearchClient extends BaseApiClient {
  /**
   * Search for symbols by symbol or fragment
   * @param symbol Symbol or fragment of a symbol to search
   * @returns Array of symbol data
   */
  async searchSymbols(symbol: string): Promise<SymbolData[]> {
    const endpoint = `/symbols/search/${encodeURIComponent(symbol)}`;
    return this.get<SymbolData[]>(endpoint);
  }
}
