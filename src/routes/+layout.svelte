<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import '../app.css';
  import { AppShell } from '@skeletonlabs/skeleton';
  import Navbar from '$lib/components/Navbar/Navbar.svelte';
  import { authStore } from '$lib/stores/auth';
  import { isPublicRoute, DEFAULT_LOGIN_REDIRECT } from '$lib/config/routes';

  onMount(() => {
    if (browser) {
      // Theme initialization
      const storedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = storedTheme || (systemPrefersDark ? 'dark' : 'light');

      document.documentElement.setAttribute('data-mode', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.setAttribute('data-theme', 'crimson');
      document.body.setAttribute('data-theme', 'crimson');

      // Initialize auth state
      authStore.checkAuthAndRedirect();
    }
  });

  // Reactive auth checking and navigation
  $: if (browser && $page.url.pathname && !$authStore.isCheckingAuth) {
    const currentPath = $page.url.pathname;
    const isPublic = isPublicRoute(currentPath);
    const isAuthenticated = $authStore.isAuthenticated;

    // Handle unauthenticated users accessing protected routes
    if (!isPublic && !isAuthenticated) {
      authStore.setIntendedDestination(currentPath);
      goto('/login');
    }
    // Handle authenticated users accessing login page
    else if (isAuthenticated && currentPath === '/login') {
      const destination = $authStore.intendedDestination || DEFAULT_LOGIN_REDIRECT;
      authStore.clearIntendedDestination();
      goto(destination);
    }
  }
</script>

<svelte:head></svelte:head>

<!-- Show loading state while checking authentication -->
{#if $authStore.isCheckingAuth}
  <div class="min-h-screen flex items-center justify-center bg-surface-50-900-token">
    <div class="text-center space-y-4">
      <div
        class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"
      ></div>
      <p class="text-surface-600-300-token">Checking authentication...</p>
    </div>
  </div>
{:else}
  <AppShell>
    <svelte:fragment slot="header">
      <Navbar />
    </svelte:fragment>

    <main class="max-w-6xl mx-auto p-8">
      <slot />
    </main>
  </AppShell>
{/if}
