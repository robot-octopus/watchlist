<script>
  import WatchlistTable from '$lib/components/Watchlist/WatchlistTable.svelte';

  export let data;

  $: sessionToken = data.sessionToken;
  $: watchlists = data.watchlists || [];
</script>

<svelte:head>
  <title>Watchlist - Tastytrade</title>
  <meta name="description" content="Monitor your stock watchlists with real-time quotes" />
</svelte:head>

<WatchlistTable {watchlists} {sessionToken} />
