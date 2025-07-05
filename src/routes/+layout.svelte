<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import '../app.css';
  import { AppShell } from '@skeletonlabs/skeleton';
  import Navbar from '$lib/components/Navbar/Navbar.svelte';

  onMount(() => {
    if (browser) {
      const storedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = storedTheme || (systemPrefersDark ? 'dark' : 'light');

      document.documentElement.setAttribute('data-mode', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.setAttribute('data-theme', 'crimson');
      document.body.setAttribute('data-theme', 'crimson');
    }
  });
</script>

<svelte:head></svelte:head>

<AppShell>
  <svelte:fragment slot="header">
    <Navbar />
  </svelte:fragment>

  <main class="max-w-6xl mx-auto p-8">
    <slot />
  </main>
</AppShell>
