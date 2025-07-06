import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reduce workers to prevent hanging */
  workers: 1,
  /* Simple reporter that doesn't hang */
  reporter: [['list']],
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:4173',

    /* Minimal trace collection */
    trace: 'retain-on-failure',

    /* Screenshots only on failure */
    screenshot: { mode: 'only-on-failure' },

    /* No video recording to reduce resource usage */
    video: 'off',
  },

  /* Configure only essential browsers for faster testing */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Simplified web server config */
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  /* Aggressive timeout settings to prevent hanging */
  timeout: 60 * 1000,
  expect: {
    timeout: 15 * 1000,
  },
});
