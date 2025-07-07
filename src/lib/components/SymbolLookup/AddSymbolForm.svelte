<script lang="ts">
  import { createForm } from 'felte';
  import { validator } from '@felte/validator-zod';
  import { addSymbolSchema } from '$lib/schemas/symbol';
  import { reporter, ValidationMessage } from '@felte/reporter-svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  const { form } = createForm({
    extend: [validator({ schema: addSymbolSchema }), reporter()],
    onSubmit: (values) => {
      console.log('Adding symbol', values.symbol);
      dispatch('add', { symbol: values.symbol });
      document.querySelector('input[name="symbol"]').value = '';
    },
  });
</script>

<div class="card p-6" data-testid="add-symbol-form">
  <header class="card-header">
    <h3 class="text-xl font-semibold">Add Symbol</h3>
  </header>

  <form use:form class="space-y-4">
    <label class="label">
      <span class="text-surface-700 dark:text-surface-300 font-medium">Symbol</span>
      <input
        name="symbol"
        type="text"
        class="input"
        placeholder="e.g., AAPL"
        autocomplete="off"
        data-testid="symbol-input"
      />
      <ValidationMessage for="symbol" let:messages>
        {#if messages}
          {#each messages as message}
            <div class="text-error-500 text-sm mt-1" data-testid="validation-error">{message}</div>
          {/each}
        {/if}
      </ValidationMessage>
    </label>

    <button type="submit" class="btn variant-filled-primary w-full" data-testid="add-symbol-submit">
      <span>➕</span>
      <span>Add to Watchlist</span>
    </button>
  </form>
</div>
