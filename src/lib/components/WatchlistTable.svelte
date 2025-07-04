<script lang="ts">
  export let symbols: { symbol: string; price: number; change?: number }[] = [];

  function formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  function formatChange(change?: number): string {
    if (change === undefined) return '--';
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}`;
  }

  function getChangeClass(change?: number): string {
    if (change === undefined) return 'price-neutral';
    return change > 0 ? 'price-positive' : change < 0 ? 'price-negative' : 'price-neutral';
  }
</script>

{#if symbols.length > 0}
  <div class="table-container overflow-x-auto" data-testid="watchlist-table-container">
    <table class="table table-hover" data-testid="watchlist-table">
      <thead>
        <tr>
          <th>Symbol</th>
          <th class="text-right">Price</th>
          <th class="text-right">Change</th>
        </tr>
      </thead>
      <tbody>
        {#each symbols as { symbol, price, change }}
          <tr data-testid="symbol-row-{symbol}">
            <td>
              <div class="font-semibold text-primary-600 dark:text-primary-400">
                {symbol}
              </div>
            </td>
            <td class="text-right">
              <span class="font-mono font-medium tabular-nums" data-testid="price-{symbol}">
                {formatPrice(price)}
              </span>
            </td>
            <td class="text-right">
              <span
                class="font-mono tabular-nums {getChangeClass(change)}"
                data-testid="change-{symbol}"
              >
                {formatChange(change)}
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <div class="text-center py-8" data-testid="empty-watchlist">
    <div class="text-4xl mb-4">📈</div>
    <h3 class="text-xl font-semibold mb-2">No symbols in watchlist</h3>
    <p class="text-surface-500">Add symbols to start monitoring prices</p>
  </div>
{/if}
