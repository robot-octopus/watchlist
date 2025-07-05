<script lang="ts">
  import { onMount } from 'svelte';
  import { AppBar } from '@skeletonlabs/skeleton';
  import logoLight from '$lib/assets/logo_light_theme.7OjByqO2.svg';
  import logoDark from '$lib/assets/logo_dark_theme.DrBznMDd.svg';
  import ThemeToggle from './ThemeToggle.svelte';

  let currentTheme = 'light';

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
      <div data-testid="theme-toggle">
        <ThemeToggle />
      </div>
    </div>
  </svelte:fragment>
</AppBar>
