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

<div class="relative">
  <input type="text" bind:value={query} placeholder="Search symbols..." class="input" />

  {#if results.length > 0}
    <div class="card absolute z-10 w-full mt-1 max-h-60 overflow-auto">
      <ul class="list">
        {#each results as symbol}
          <li class="option">{symbol}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
