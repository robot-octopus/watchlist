<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import moonIcon from '$lib/assets/moon.svg';
  import sunIcon from '$lib/assets/sun.svg';

  let isDark = $state(false);

  onMount(() => {
    if (browser) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDark = systemPrefersDark;
      applyTheme();
    }
  });

  function applyTheme() {
    if (browser) {
      const mode = isDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-mode', mode);
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.setAttribute('data-theme', 'crimson');
      document.body.setAttribute('data-theme', 'crimson');
    }
  }

  function toggleTheme() {
    isDark = !isDark;
    applyTheme();
  }
</script>

<button
  data-testid="theme-toggle"
  onclick={toggleTheme}
  class="btn btn-sm bg-transparent border-none w-10 h-10 p-0"
  aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
  role="button"
  tabindex="0"
>
  <img
    data-testid="theme-icon w-10 h-10"
    src={isDark ? sunIcon : moonIcon}
    alt={isDark ? 'Sun icon' : 'Moon icon'}
    class="w-5 h-5 transition-all duration-200"
  />
</button>
