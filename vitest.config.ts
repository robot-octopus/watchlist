/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
    // Ensure we're not running in SSR mode for component tests
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  // Ensure Svelte components are properly compiled for testing
  optimizeDeps: {
    include: ['@testing-library/svelte', 'svelte', 'svelte/animate', 'svelte/easing'],
  },
  resolve: {
    // Prioritize browser condition over default for Svelte 5
    conditions: ['browser', 'module', 'import', 'default'],
  },
  define: {
    // Ensure browser-like environment for Svelte
    'import.meta.env.SSR': false,
    'import.meta.env.BROWSER': true,
    'process.browser': true,
    'process.env.NODE_ENV': '"test"',
    global: 'globalThis',
  },
  esbuild: {
    define: {
      global: 'globalThis',
    },
  },
});
