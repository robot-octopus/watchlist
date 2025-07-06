<!-- Enhanced Navbar with Server-Side Authentication -->
<script>
  import { auth, isAuthenticated, currentUser, isDemo } from '$lib/stores/auth';
  import ThemeToggle from './ThemeToggle.svelte';
  import logo_light from '$lib/assets/logo_light_theme.7OjByqO2.svg';
  import logo_dark from '$lib/assets/logo_dark_theme.DrBznMDd.svg';

  let isLoggingOut = false;

  async function handleLogout() {
    if (isLoggingOut) return;

    isLoggingOut = true;

    try {
      await auth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      isLoggingOut = false;
    }
  }
</script>

<!-- on:click={(e) => {
  // Force full page reload to ensure server-side protection
  e.preventDefault();
  window.location.href = '/';
}} -->

<nav class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <div class="flex items-center">
        <a href="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <picture>
            <source srcset={logo_dark} media="(prefers-color-scheme: dark)" />
            <img src={logo_light} alt="Tastytrade" class="h-8 w-auto" />
          </picture>
        </a>
      </div>

      <div class="flex items-center space-x-4">
        {#if $isAuthenticated && $currentUser}
          <div class="flex items-center space-x-3">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <span class="hidden sm:inline">Welcome, </span>
              <span class="font-medium">{$currentUser.username}</span>
              {#if $isDemo}
                <span
                  class="ml-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                >
                  Demo
                </span>
              {/if}
            </div>

            <button
              on:click={handleLogout}
              disabled={isLoggingOut}
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {#if isLoggingOut}
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
                Logging out...
              {:else}
                Logout
              {/if}
            </button>
          </div>
        {/if}
        <ThemeToggle />
      </div>
    </div>
  </div>
</nav>
