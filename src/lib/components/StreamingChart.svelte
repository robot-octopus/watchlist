<!-- Mock StreamingChart Component -->
<script>
  export let symbols = [];
  export let sessionToken = '';
  export let height = 400;
</script>

<div
  class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center"
  style="height: {height}px;"
>
  <div class="text-center text-gray-500 dark:text-gray-400">
    <div class="text-lg font-semibold mb-2">Chart Placeholder</div>
    {#if symbols.length > 0}
      <div class="text-sm">
        Showing: {symbols.join(', ')}
      </div>
    {:else}
      <div class="text-sm">No symbols to display</div>
    {/if}
  </div>
</div>
