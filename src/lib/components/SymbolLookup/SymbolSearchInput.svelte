<!-- Mock SymbolSearchInput Component for Testing -->
<script>
  import { createEventDispatcher } from 'svelte';

  export let sessionToken = '';
  export let placeholder = 'Search symbols...';
  export let disabled = false;

  const dispatch = createEventDispatcher();

  let searchValue = '';

  function handleInput() {
    // Mock implementation
  }

  function handleSubmit() {
    if (searchValue.trim()) {
      dispatch('select', {
        symbol: searchValue.trim().toUpperCase(),
        data: { 'instrument-type': 'Stock' },
      });
      searchValue = '';
    }
  }
</script>

<div class="space-y-2">
  <form on:submit|preventDefault={handleSubmit}>
    <input
      type="text"
      {placeholder}
      {disabled}
      bind:value={searchValue}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
    />
    <button type="submit" {disabled} class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">
      Add Symbol
    </button>
  </form>
</div>
