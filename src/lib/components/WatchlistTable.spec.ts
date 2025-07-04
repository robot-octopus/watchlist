import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import WatchlistTable from './WatchlistTable.svelte';

describe('WatchlistTable', () => {
  it('renders symbols with prices', () => {
    const symbols = [
      { symbol: 'AAPL', price: 192.88 },
      { symbol: 'GOOGL', price: 2850.34 },
    ];

    const { getByText } = render(WatchlistTable, { symbols });

    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('$192.88')).toBeTruthy();
  });
});
