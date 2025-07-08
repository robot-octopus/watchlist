import { render, fireEvent, waitFor, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SymbolSearch from './SymbolSearch.svelte';

// Mock the SymbolSearchClient
const mockSearchSymbols = vi.fn();
vi.mock('$lib/api/clients/symbol-search', () => ({
  SymbolSearchClient: vi.fn().mockImplementation(() => ({
    searchSymbols: mockSearchSymbols,
  })),
}));

describe('SymbolSearch Component', () => {
  const mockProps = {
    sessionToken: 'test-token',
    placeholder: 'Search symbols...',
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();

    // Default mock response
    mockSearchSymbols.mockResolvedValue({
      data: {
        items: [
          {
            symbol: 'AAPL',
            description: 'Apple Inc.',
            'instrument-type': 'Stock',
          },
          {
            symbol: 'GOOGL',
            description: 'Alphabet Inc.',
            'instrument-type': 'Stock',
          },
        ],
      },
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders the search input correctly', () => {
    render(SymbolSearch, { props: mockProps });

    const input = screen.getByPlaceholderText('Search symbols...');
    expect(input).toBeInTheDocument();
    expect(input).not.toBeDisabled();
  });

  it('renders with disabled state', () => {
    render(SymbolSearch, { props: { ...mockProps, disabled: true } });

    const input = screen.getByPlaceholderText('Search symbols...');
    expect(input).toBeDisabled();
  });

  it('shows search results dropdown after debounced search', async () => {
    render(SymbolSearch, { props: mockProps });

    const input = screen.getByPlaceholderText('Search symbols...');

    // Type in the input
    await fireEvent.input(input, { target: { value: 'AAPL' } });

    // Fast-forward the debounce timer
    vi.advanceTimersByTime(300);

    // Wait for API call and results to appear
    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });

    expect(mockSearchSymbols).toHaveBeenCalledWith('AAPL');
  });

  it('clears search and results after symbol selection', async () => {
    render(SymbolSearch, { props: mockProps });

    const input = screen.getByPlaceholderText('Search symbols...') as HTMLInputElement;

    // Type and search
    await fireEvent.input(input, { target: { value: 'AAPL' } });
    vi.advanceTimersByTime(300);

    // Wait for results and click
    await waitFor(() => {
      const appleButton = screen.getByText('AAPL');
      expect(appleButton).toBeInTheDocument();
    });

    const appleButton = screen.getByText('AAPL');
    await fireEvent.click(appleButton);

    // Check that input is cleared and results are hidden
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('calls API with empty results correctly', async () => {
    render(SymbolSearch, { props: mockProps });

    const input = screen.getByPlaceholderText('Search symbols...');

    // Set up empty results mock before the search
    mockSearchSymbols.mockResolvedValueOnce({ data: { items: [] } });

    await fireEvent.input(input, { target: { value: 'INVALID' } });
    vi.advanceTimersByTime(300);

    // Verify the API was called with the correct query
    await waitFor(() => {
      expect(mockSearchSymbols).toHaveBeenCalledWith('INVALID');
    });

    // Verify no search results are displayed (no AAPL/GOOGL from default mock)
    expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
    expect(screen.queryByText('Apple Inc.')).not.toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    mockSearchSymbols.mockRejectedValueOnce(new Error('API Error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(SymbolSearch, { props: mockProps });

    const input = screen.getByPlaceholderText('Search symbols...');

    await fireEvent.input(input, { target: { value: 'AAPL' } });
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error searching symbols:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('does not search for empty queries', async () => {
    render(SymbolSearch, { props: mockProps });

    const input = screen.getByPlaceholderText('Search symbols...');

    // Type empty string
    await fireEvent.input(input, { target: { value: '' } });
    vi.advanceTimersByTime(300);

    expect(mockSearchSymbols).not.toHaveBeenCalled();
  });

  it('handles different API response formats', async () => {
    // Test direct array response
    mockSearchSymbols.mockResolvedValueOnce([
      { symbol: 'TSLA', description: 'Tesla Inc.', 'instrument-type': 'Stock' },
    ]);

    render(SymbolSearch, { props: mockProps });

    const input = screen.getByPlaceholderText('Search symbols...');

    await fireEvent.input(input, { target: { value: 'TSLA' } });
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText('TSLA')).toBeInTheDocument();
      expect(screen.getByText('Tesla Inc.')).toBeInTheDocument();
    });
  });

  it('debounces search calls correctly', async () => {
    render(SymbolSearch, { props: mockProps });

    const input = screen.getByPlaceholderText('Search symbols...');

    // Type multiple characters quickly
    await fireEvent.input(input, { target: { value: 'A' } });
    await fireEvent.input(input, { target: { value: 'AA' } });
    await fireEvent.input(input, { target: { value: 'AAP' } });
    await fireEvent.input(input, { target: { value: 'AAPL' } });

    // Only advance timer once
    vi.advanceTimersByTime(300);

    // Should only call search once with the final value
    expect(mockSearchSymbols).toHaveBeenCalledTimes(1);
    expect(mockSearchSymbols).toHaveBeenCalledWith('AAPL');
  });

  it('allows clicking on search results to interact with symbols', async () => {
    render(SymbolSearch, { props: mockProps });

    const input = screen.getByPlaceholderText('Search symbols...');

    // Type and search
    await fireEvent.input(input, { target: { value: 'AAPL' } });
    vi.advanceTimersByTime(300);

    // Wait for results to appear
    await waitFor(() => {
      const appleButton = screen.getByText('AAPL');
      expect(appleButton).toBeInTheDocument();
    });

    // Verify the button is clickable (has proper role/interactivity)
    const appleButton = screen.getByText('AAPL');
    expect(appleButton.closest('button')).toBeInTheDocument();

    // Click the button (the actual event handling is tested at integration level)
    await fireEvent.click(appleButton);

    // Verify UI behavior after click (input should be cleared)
    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('');
    });
  });
});
