import { BaseApiClient } from '../base-client';
import type { definitions } from '../types/market-metrics';

export type MarketMetricInfo = definitions['MarketMetricInfo'];
export type DividendInfo = definitions['DividendInfo'];
export type EarningsInfo = definitions['EarningsInfo'];

export class MarketMetricsClient extends BaseApiClient {
  /**
   * Get market metrics for one or more symbols
   * @param symbols - Comma separated list of symbols
   */
  async getMarketMetrics(symbols: string[]): Promise<MarketMetricInfo[]> {
    const symbolsParam = symbols.join(',');
    const endpoint = `/market-metrics?symbols=${encodeURIComponent(symbolsParam)}`;
    return this.get<MarketMetricInfo[]>(endpoint);
  }

  /**
   * Get historical dividend data for a symbol
   */
  async getDividends(symbol: string): Promise<DividendInfo[]> {
    const endpoint = `/market-metrics/historic-corporate-events/dividends/${encodeURIComponent(symbol)}`;
    return this.get<DividendInfo[]>(endpoint);
  }

  /**
   * Get historical earnings data for a symbol
   */
  async getEarnings(symbol: string, startDate: string, endDate?: string): Promise<EarningsInfo[]> {
    let endpoint = `/market-metrics/historic-corporate-events/earnings-reports/${encodeURIComponent(symbol)}?start-date=${startDate}`;
    if (endDate) {
      endpoint += `&end-date=${endDate}`;
    }
    return this.get<EarningsInfo[]>(endpoint);
  }
}
