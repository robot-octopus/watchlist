<!-- Enhanced Layout with Server-Side Authentication -->
<script>
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import Navbar from '$lib/components/Navbar/Navbar.svelte';
  import '../app.css';

  // Get server-provided data from +layout.server.ts
  export let data;

  // Initialize auth store with server data
  $: if (data) {
    auth.initialize(data.user, data.session);

    // Set intended destination from server cookie
    if (data.intendedDestination) {
      auth.setIntendedDestination(data.intendedDestination);
    }
  }

  // Update auth store when server data changes
  $: if (browser && data) {
    auth.updateFromServer(data.user, data.session);

    // Update intended destination from server
    if (data.intendedDestination) {
      auth.setIntendedDestination(data.intendedDestination);
    }
  }

  // Client-side route protection (backup to server-side)
  $: if (browser && $page && $auth) {
    const currentPath = $page.url.pathname;
    const isAuthenticated = $auth.isAuthenticated;

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && currentPath !== '/login' && currentPath !== '/') {
      // Redirect to login (server should have already done this, but backup)
      goto('/login', { replaceState: true });
    }

    // If authenticated and on login page, redirect to home
    if (isAuthenticated && currentPath === '/login') {
      goto('/', { replaceState: true });
    }
  }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Navbar />

  <main class="container mx-auto px-4 py-8">
    <slot />
  </main>
</div>
