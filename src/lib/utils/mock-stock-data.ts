export interface StockDataPoint {
  date: Date;
  price: number;
  volume?: number;
  symbol: string;
}

export function generateMockStockData(
  symbol: string,
  days: number = 30,
  basePrice: number = 100
): StockDataPoint[] {
  const data: StockDataPoint[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let currentPrice = basePrice;
  const volatility = 0.02; // 2% daily volatility

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // Generate some realistic price movement
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const trendFactor = Math.sin(i / 10) * 0.001; // Slight trend

    currentPrice *= 1 + randomChange + trendFactor;

    // Generate realistic volume (higher volume on bigger price moves)
    const priceChangePercent = Math.abs(randomChange);
    const baseVolume = 1000000;
    const volume = Math.floor(baseVolume * (1 + priceChangePercent * 5) * (0.5 + Math.random()));

    data.push({
      date: new Date(date),
      price: Math.round(currentPrice * 100) / 100, // Round to 2 decimal places
      volume,
      symbol,
    });
  }

  return data;
}

// Predefined realistic stock data for popular symbols
export const stockBasePrices: Record<string, number> = {
  AAPL: 175.5,
  GOOGL: 140.2,
  MSFT: 340.8,
  TSLA: 185.3,
  AMZN: 155.6,
  META: 485.9,
  NVDA: 875.2,
  NFLX: 490.1,
  AMD: 142.5,
  INTC: 23.45,
};

export function getStockData(symbol: string, days: number = 30): StockDataPoint[] {
  const basePrice = stockBasePrices[symbol] || 100;
  return generateMockStockData(symbol, days, basePrice);
}

// Generate data for multiple symbols
export function getMultipleStockData(symbols: string[], days: number = 30): StockDataPoint[] {
  const allData: StockDataPoint[] = [];

  for (const symbol of symbols) {
    const symbolData = getStockData(symbol, days);
    allData.push(...symbolData);
  }

  return allData;
}

// Generate intraday data (hourly data for one day)
export function generateIntradayData(symbol: string, basePrice?: number): StockDataPoint[] {
  const data: StockDataPoint[] = [];
  const today = new Date();
  today.setHours(9, 30, 0, 0); // Market open at 9:30 AM

  const startPrice = basePrice || stockBasePrices[symbol] || 100;
  let currentPrice = startPrice;
  const volatility = 0.005; // 0.5% hourly volatility

  for (let hour = 0; hour < 7; hour++) {
    // 7 trading hours (9:30 AM to 4:30 PM)
    const date = new Date(today);
    date.setHours(today.getHours() + hour);

    // Generate price movement
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    currentPrice *= 1 + randomChange;

    // Generate volume
    const volume = Math.floor(100000 * (0.5 + Math.random()) * (1 + Math.abs(randomChange) * 10));

    data.push({
      date: new Date(date),
      price: Math.round(currentPrice * 100) / 100,
      volume,
      symbol,
    });
  }

  return data;
}
