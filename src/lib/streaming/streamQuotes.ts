import { writable } from 'svelte/store';

// Placeholder for WebSocket streaming functionality
export function createQuoteStream(symbols: string[]) {
  const store = writable<Record<string, { symbol: string; price: number; change?: number }>>({});

  // Mock implementation - replace with actual WebSocket/streaming logic
  const interval = setInterval(() => {
    const quotes: Record<string, { symbol: string; price: number; change?: number }> = {};

    symbols.forEach((symbol) => {
      quotes[symbol] = {
        symbol,
        price: Math.random() * 200 + 50, // Random price between 50-250
        change: (Math.random() - 0.5) * 10, // Random change between -5 to +5
      };
    });

    store.set(quotes);
  }, 2000);

  return {
    subscribe: store.subscribe,
    destroy: () => clearInterval(interval),
  };
}
