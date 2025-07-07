import { render } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WatchlistTable from './WatchlistTable.svelte';

// Mock the Skeleton stores
const mockModalStore = {
  trigger: vi.fn(),
  close: vi.fn(),
  clear: vi.fn(),
};

const mockToastStore = {
  trigger: vi.fn(),
  close: vi.fn(),
  clear: vi.fn(),
};

// Mock the Skeleton Labs functions
vi.mock('@skeletonlabs/skeleton', () => ({
  getModalStore: () => mockModalStore,
  getToastStore: () => mockToastStore,
}));

// Mock the API clients
vi.mock('$lib/api/clients/watchlists', () => ({
  WatchlistsClient: vi.fn(() => ({
    createWatchlist: vi.fn(),
    updateWatchlist: vi.fn(),
    deleteWatchlist: vi.fn(),
    getWatchlist: vi.fn(),
  })),
}));

vi.mock('$lib/api/clients/quotes', () => ({
  QuotesClient: vi.fn(() => ({
    startPolling: vi.fn(),
    stopPolling: vi.fn(),
  })),
}));

describe('WatchlistTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock element.animate for Web Animations API
    Element.prototype.animate = vi.fn().mockReturnValue({
      finished: Promise.resolve(),
      cancel: vi.fn(),
      pause: vi.fn(),
      play: vi.fn(),
    } as any);
  });

  it('renders with empty watchlists', () => {
    const props = {
      watchlists: [],
      selectedWatchlist: null,
      sessionToken: 'test-token',
      quotes: [],
      isLoading: false,
    };

    const { getByText } = render(WatchlistTable, props);

    expect(getByText('Watchlist')).toBeTruthy();
    expect(getByText('No watchlists yet')).toBeTruthy();
  });

  it('renders symbols with prices', () => {
    const mockWatchlist = {
      id: '1',
      name: 'Test Watchlist',
      'watchlist-entries': [
        { symbol: 'AAPL', 'instrument-type': 'Stock' },
        { symbol: 'GOOGL', 'instrument-type': 'Stock' },
      ],
    };

    const props = {
      watchlists: [mockWatchlist],
      selectedWatchlist: mockWatchlist,
      sessionToken: 'test-token',
      quotes: [
        { symbol: 'AAPL', lastPrice: 192.88, status: 'success' },
        { symbol: 'GOOGL', lastPrice: 2850.34, status: 'success' },
      ],
      isLoading: false,
    };

    const { getByText } = render(WatchlistTable, props);

    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('GOOGL')).toBeTruthy();
  });
});
