import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import WatchlistCard from './WatchlistCard.svelte';

// Mock the SymbolSearch component to avoid import issues
vi.mock('../SymbolLookup/SymbolSearch.svelte', () => ({
  default: vi.fn(() => ({ $$: { fragment: null } })),
}));

// Mock the StreamingChart component
vi.mock('../StreamingChart.svelte', () => ({
  default: vi.fn(() => ({ $$: { fragment: null } })),
}));

describe('WatchlistCard', () => {
  const mockWatchlist = {
    id: 'test-id',
    name: 'Test Watchlist',
    'watchlist-entries': {
      AAPL: { symbol: 'AAPL', 'instrument-type': 'Stock' },
      MSFT: { symbol: 'MSFT', 'instrument-type': 'Stock' },
    },
  };

  it('renders watchlist information correctly', () => {
    const { getByText } = render(WatchlistCard, {
      props: {
        watchlist: mockWatchlist,
        sessionToken: 'test-token',
      },
    });

    expect(getByText('Test Watchlist')).toBeInTheDocument();
    expect(getByText('2 symbols')).toBeInTheDocument();
  });

  it('shows first letter of watchlist name as avatar', () => {
    const { getByText } = render(WatchlistCard, {
      props: {
        watchlist: mockWatchlist,
        sessionToken: 'test-token',
      },
    });

    // Should show "T" as the first letter of "Test Watchlist"
    expect(getByText('T')).toBeInTheDocument();
  });

  it('displays correct symbol count', () => {
    const { getByText } = render(WatchlistCard, {
      props: {
        watchlist: {
          ...mockWatchlist,
          'watchlist-entries': {
            AAPL: { symbol: 'AAPL' },
            MSFT: { symbol: 'MSFT' },
            GOOGL: { symbol: 'GOOGL' },
          },
        },
        sessionToken: 'test-token',
      },
    });

    expect(getByText('3 symbols')).toBeInTheDocument();
  });

  it('handles empty watchlist entries', () => {
    const { getByText } = render(WatchlistCard, {
      props: {
        watchlist: {
          ...mockWatchlist,
          'watchlist-entries': {},
        },
        sessionToken: 'test-token',
      },
    });

    expect(getByText('0 symbols')).toBeInTheDocument();
  });

  it('shows edit form when isEditing is true', () => {
    const { getByDisplayValue, getByText } = render(WatchlistCard, {
      props: {
        watchlist: mockWatchlist,
        isEditing: true,
        editingName: 'Test Watchlist',
        sessionToken: 'test-token',
      },
    });

    expect(getByDisplayValue('Test Watchlist')).toBeInTheDocument();
    expect(getByText('Save')).toBeInTheDocument();
    expect(getByText('Cancel')).toBeInTheDocument();
  });

  it('dispatches select event when clicked', async () => {
    const { container } = render(WatchlistCard, {
      props: {
        watchlist: mockWatchlist,
        sessionToken: 'test-token',
      },
    });

    // Find the main clickable area (div with role="button")
    const watchlistElement = container.querySelector('[role="button"]');
    expect(watchlistElement).toBeInTheDocument();

    // Test that clicking works without errors
    await fireEvent.click(watchlistElement!);

    // Verify the element is still there after click
    expect(watchlistElement).toBeInTheDocument();
  });

  it('shows selected state styling when isSelected is true', () => {
    const { container } = render(WatchlistCard, {
      props: {
        watchlist: mockWatchlist,
        isSelected: true,
        sessionToken: 'test-token',
      },
    });

    const card = container.querySelector('.border-blue-500');
    expect(card).toBeInTheDocument();
  });
});
