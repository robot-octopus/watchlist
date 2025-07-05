<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import LoginForm from '$lib/components/LoginForm.svelte';

  // Redirect if already authenticated
  onMount(() => {
    if (browser) {
      const unsubscribe = authStore.subscribe((state) => {
        if (state.isAuthenticated) {
          goto('/');
        }
      });
      return unsubscribe;
    }
  });
</script>

<svelte:head>
  <title>Login - Tastytrade Watchlist</title>
  <meta name="description" content="Sign in to your Tastytrade account" />
</svelte:head>

<div class=" flex items-center justify-center p-4">
  <LoginForm />
</div>
