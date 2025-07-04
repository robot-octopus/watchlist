import { BaseApiClient } from '../base-client';
import type { definitions, operations } from '../types/symbol-search';

export type SymbolData = definitions['SymbolData'];
export type SearchSymbolsParams = operations['searchSymbols']['parameters']['path'];
export type SearchSymbolsResponse = operations['searchSymbols']['responses'][200]['schema'];

export class SymbolSearchClient extends BaseApiClient {
  /**
   * Search for symbols by name or fragment
   * @param params - Search parameters
   * @returns Array of symbol data
   */
  async searchSymbols(params: SearchSymbolsParams): Promise<SymbolData[]> {
    const endpoint = `/symbols/search/${encodeURIComponent(params.symbol)}`;
    const response = await this.get<SymbolData[]>(endpoint);
    return response;
  }

  /**
   * Convenience method for quick symbol lookup
   * @param query - Symbol or fragment to search for
   * @returns Array of symbol data
   */
  async search(query: string): Promise<SymbolData[]> {
    return this.searchSymbols({ symbol: query });
  }
}
