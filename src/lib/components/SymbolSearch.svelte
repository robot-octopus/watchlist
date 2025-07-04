<script lang="ts">
  export let query = '';
  export let results: string[] = [];

  async function searchSymbols(searchQuery: string): Promise<string[]> {
    // Mock implementation - replace with actual API call
    const mockResults = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];
    return mockResults.filter((symbol) => symbol.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  $: if (query.length > 0) {
    searchSymbols(query).then((data) => {
      results = data;
    });
  } else {
    results = [];
  }
</script>

<div class="search-container">
  <input
    type="text"
    bind:value={query}
    placeholder="Search symbols..."
    class="form-input-financial"
  />

  {#if results.length > 0}
    <ul class="results-list">
      {#each results as symbol}
        <li class="result-item">{symbol}</li>
      {/each}
    </ul>
  {/if}
</div>
