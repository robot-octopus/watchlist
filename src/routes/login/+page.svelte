<!-- Login Page -->
<script>
  import LoginForm from '$lib/components/LoginForm.svelte';

  // Get form data from server action
  export let form;
</script>

<svelte:head>
  <title>Login - Tastytrade Watchlist</title>
  <meta name="description" content="Sign in to your Tastytrade account" />
</svelte:head>

<div class=" flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <LoginForm />
  </div>
</div>
