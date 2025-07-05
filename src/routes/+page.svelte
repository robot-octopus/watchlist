<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import WatchlistTable from '$lib/components/WatchlistTable.svelte';
  import AddSymbolForm from '$lib/components/AddSymbolForm.svelte';
  import { createQuoteStream } from '$lib/streaming/streamQuotes';

  type QuoteData = {
    symbol: string;
    price: number;
    change?: number;
  };

  let quotes: Record<string, QuoteData> = {};

  onMount(() => {
    if (browser) {
      // Mock symbols for now (will integrate with stores later)
      const mockSymbols = ['AAPL', 'GOOGL', 'MSFT'];
      const quoteStream = createQuoteStream(mockSymbols);

      const unsubscribe = quoteStream.subscribe((data) => {
        quotes = data;
      });

      return () => unsubscribe();
    }
  });

  $: quoteArray = Object.values(quotes) as QuoteData[];
</script>

<svelte:head>
  <title>Tastytrade Watchlist</title>
  <meta name="description" content="Monitor your favorite symbols with real-time quotes" />
</svelte:head>

<div class="w-full">
  <header class="text-center mb-12">
    <h1 class="text-4xl font-bold mb-4 text-surface-900 dark:text-surface-50">Dashboard</h1>
    <p class="text-surface-600 dark:text-surface-400 text-lg">
      Monitor your favorite symbols with real-time quotes
    </p>
  </header>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="w-full">
      <div data-testid="add-symbol-form">
        <AddSymbolForm />
      </div>
    </div>

    <div class="w-full">
      <div data-testid="quotes-section">
        <WatchlistTable symbols={quoteArray} />
      </div>
    </div>
  </div>
</div>
