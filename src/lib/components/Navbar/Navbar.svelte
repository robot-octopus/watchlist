<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { AppBar } from '@skeletonlabs/skeleton';
  import logoLight from '$lib/assets/logo_light_theme.7OjByqO2.svg';
  import logoDark from '$lib/assets/logo_dark_theme.DrBznMDd.svg';
  import ThemeToggle from './ThemeToggle.svelte';
  import { authStore } from '$lib/stores/auth';

  let currentTheme = 'light';
  let isLoggingOut = false;

  // Subscribe to auth state
  $: authState = $authStore;

  onMount(() => {
    const updateTheme = () => {
      currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  });

  async function handleLogout() {
    if (isLoggingOut) return;

    try {
      isLoggingOut = true;

      // Use secure logout method which handles token cleanup and server-side invalidation
      await authStore.secureLogout();

      // Clear any intended destination
      authStore.clearIntendedDestination();

      // Redirect to login page using replaceState to prevent going back
      await goto('/login', { replaceState: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if there's an error, still perform basic logout and redirect
      authStore.logout();
      await goto('/login', { replaceState: true });
    } finally {
      isLoggingOut = false;
    }
  }
</script>

<AppBar data-testid="navbar" shadow="shadow-lg">
  <svelte:fragment slot="lead">
    <div
      data-testid="navbar-logo"
      class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
    >
      <img
        src={currentTheme === 'light' ? logoLight : logoDark}
        alt="tastytrade"
        class="h-8 w-auto transition-all duration-300"
      />
    </div>
  </svelte:fragment>

  <svelte:fragment slot="trail">
    <div class="flex items-center gap-6">
      <!-- Show user info and logout when authenticated -->
      {#if authState.isAuthenticated && authState.user}
        <div class="flex items-center gap-4">
          <!-- User greeting -->
          <div class="hidden sm:flex flex-col items-end">
            <span class="text-sm font-medium text-surface-900-50-token">
              {authState.user.username || authState.user.email}
            </span>
            <span class="text-xs text-surface-600-300-token">Authenticated</span>
          </div>

          <!-- Logout button -->
          <button
            on:click={handleLogout}
            disabled={isLoggingOut}
            class="btn btn-sm variant-ghost-error hover:variant-filled-error transition-all duration-200"
            data-testid="logout-button"
            title="Sign out"
          >
            {#if isLoggingOut}
              <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing out...
            {:else}
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
              Sign Out
            {/if}
          </button>
        </div>
      {/if}

      <div data-testid="theme-toggle">
        <ThemeToggle />
      </div>
    </div>
  </svelte:fragment>
</AppBar>
