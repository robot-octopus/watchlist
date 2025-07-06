<!-- Watchlist Page -->
<script>
  // Import the fixed table-based watchlist component
  import WatchlistTable from '$lib/components/WatchlistTable.svelte';

  export let data;

  // Extract session token and watchlists from server data
  $: sessionToken = data.sessionToken;
  $: watchlists = data.watchlists || [];

  console.log('Watchlist page data:', data);
</script>

<svelte:head>
  <title>Watchlist - Tastytrade</title>
  <meta name="description" content="Monitor your stock watchlists with real-time quotes" />
</svelte:head>

<!-- Main page content using the fixed table component -->
<WatchlistTable
  {watchlists}
  {sessionToken}
  on:select={(event) => {
    console.log('Watchlist selected:', event.detail);
  }}
  on:create={(event) => {
    console.log('Watchlist created:', event.detail);
  }}
  on:update={(event) => {
    console.log('Watchlist updated:', event.detail);
  }}
  on:delete={(event) => {
    console.log('Watchlist deleted:', event.detail);
  }}
/>
