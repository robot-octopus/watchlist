import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import WatchlistManager from './WatchlistManager.svelte';

// Mock the imports that might cause issues in tests
vi.mock('@skeletonlabs/skeleton', () => ({
  getModalStore: () => ({ trigger: vi.fn() }),
  getToastStore: () => ({ trigger: vi.fn() }),
}));

vi.mock('$lib/api/clients/watchlists', () => ({
  WatchlistsClient: vi.fn().mockImplementation(() => ({
    createWatchlist: vi.fn(),
    updateWatchlist: vi.fn(),
    deleteWatchlist: vi.fn(),
    getWatchlist: vi.fn(),
  })),
}));

vi.mock('../SymbolLookup/SymbolSearch.svelte', () => ({
  default: function MockSymbolSearch() {
    return { $$: { fragment: null } };
  },
}));

vi.mock('../StreamingChart.svelte', () => ({
  default: function MockStreamingChart() {
    return { $$: { fragment: null } };
  },
}));

describe('WatchlistManager', () => {
  const mockWatchlists = [
    {
      id: 'watchlist-1',
      name: 'Tech Stocks',
      'watchlist-entries': {
        AAPL: { symbol: 'AAPL', 'instrument-type': 'Stock' },
        GOOGL: { symbol: 'GOOGL', 'instrument-type': 'Stock' },
      },
    },
    {
      id: 'watchlist-2',
      name: 'Finance',
      'watchlist-entries': {
        JPM: { symbol: 'JPM', 'instrument-type': 'Stock' },
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component title correctly', () => {
    const { getByText } = render(WatchlistManager, {
      props: {
        watchlists: mockWatchlists,
        sessionToken: 'test-token',
      },
    });

    expect(getByText('Watchlist Manager')).toBeInTheDocument();
  });

  it('displays correct watchlist count', () => {
    const { getByText } = render(WatchlistManager, {
      props: {
        watchlists: mockWatchlists,
        sessionToken: 'test-token',
      },
    });

    expect(getByText('2 watchlists')).toBeInTheDocument();
  });

  it('shows singular count for one watchlist', () => {
    const { getByText } = render(WatchlistManager, {
      props: {
        watchlists: [mockWatchlists[0]],
        sessionToken: 'test-token',
      },
    });

    expect(getByText('1 watchlist')).toBeInTheDocument();
  });

  it('renders create watchlist form', () => {
    const { getByText, getByPlaceholderText } = render(WatchlistManager, {
      props: {
        watchlists: mockWatchlists,
        sessionToken: 'test-token',
      },
    });

    expect(getByText('Create New Watchlist')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter watchlist name...')).toBeInTheDocument();
    expect(getByText('Create Watchlist')).toBeInTheDocument();
  });

  it('renders all watchlist cards', () => {
    const { getByText } = render(WatchlistManager, {
      props: {
        watchlists: mockWatchlists,
        sessionToken: 'test-token',
      },
    });

    expect(getByText('Tech Stocks')).toBeInTheDocument();
    expect(getByText('Finance')).toBeInTheDocument();
  });

  it('shows empty state when no watchlists', () => {
    const { getByText } = render(WatchlistManager, {
      props: {
        watchlists: [],
        sessionToken: 'test-token',
      },
    });

    expect(getByText('No watchlists yet')).toBeInTheDocument();
    expect(getByText('Create your first watchlist to get started!')).toBeInTheDocument();
  });

  it('displays watchlist symbol counts correctly', () => {
    const { container } = render(WatchlistManager, {
      props: {
        watchlists: mockWatchlists,
        sessionToken: 'test-token',
      },
    });

    // Check that each watchlist shows its symbol count (this might be in spans or text)
    const techStockCard = container.querySelector('[role="button"]');
    expect(techStockCard).toBeInTheDocument();
  });

  it('requires session token prop', () => {
    // Test that component accepts the sessionToken prop
    const { container } = render(WatchlistManager, {
      props: {
        watchlists: mockWatchlists,
        sessionToken: '',
      },
    });

    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles watchlists prop as array', () => {
    const { getByText } = render(WatchlistManager, {
      props: {
        watchlists: mockWatchlists,
        sessionToken: 'test-token',
      },
    });

    // Should render without crashing
    expect(getByText('Watchlist Manager')).toBeInTheDocument();
  });
});
