<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import moonIcon from '$lib/assets/moon.svg';
  import sunIcon from '$lib/assets/sun.svg';

  let isDark = $state(true); // Default to dark

  onMount(() => {
    if (browser) {
      // Sync with current DOM state (theme is already applied by HTML head script)
      isDark = document.documentElement.classList.contains('dark');
    }
  });

  function applyTheme() {
    if (browser) {
      const mode = isDark ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.setAttribute('data-mode', mode);
      document.documentElement.setAttribute('data-theme', 'crimson');
      document.body.setAttribute('data-theme', 'crimson');
    }
  }

  async function toggleTheme() {
    isDark = !isDark;
    applyTheme();

    // Save theme preference to cookie
    if (browser) {
      try {
        await fetch('/api/theme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            theme: isDark ? 'dark' : 'light',
          }),
        });
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  }
</script>

<button
  data-testid="theme-toggle"
  onclick={toggleTheme}
  class="btn btn-sm variant-ghost-surface w-10 h-10 p-0"
  aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
  tabindex="0"
>
  <img
    data-testid="theme-icon w-10 h-10"
    src={isDark ? sunIcon : moonIcon}
    alt={isDark ? 'Sun icon' : 'Moon icon'}
    class="w-5 h-5 transition-all duration-200"
  />
</button>
