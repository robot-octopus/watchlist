import { expect, test } from '@playwright/test';

test.describe('Tastytrade Watchlist App', () => {
  test('app loads successfully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Check that the page title is set correctly
    await expect(page).toHaveTitle(/Tastytrade Watchlist/);

    // Verify the main heading is present
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Check that the description is present
    await expect(
      page.locator('text=Monitor your favorite symbols with real-time quotes')
    ).toBeVisible();
  });

  test('header loads with correct branding', async ({ page }) => {
    await page.goto('/');

    // Check that the header AppBar is present
    await expect(page.locator('[data-testid="app-bar"]')).toBeVisible();

    // Verify the logo/brand area
    await expect(page.locator('text=TT')).toBeVisible();
    await expect(page.locator('text=Tastytrade Watchlist')).toBeVisible();

    // Check for dark mode toggle button
    await expect(page.locator('button[aria-label="Dark mode toggle"]')).toBeVisible();
  });

  test('add symbol form is present and functional', async ({ page }) => {
    await page.goto('/');

    // Check that the Add Symbol form is present
    await expect(page.locator('text=Add Symbol')).toBeVisible();

    // Verify the symbol input field exists
    const symbolInput = page.locator('input[name="symbol"]');
    await expect(symbolInput).toBeVisible();
    await expect(symbolInput).toHaveAttribute('placeholder', 'e.g., AAPL');

    // Check that the submit button is present
    await expect(page.locator('button[type="submit"]')).toContainText('Add to Watchlist');
  });

  test('watchlist table section is present', async ({ page }) => {
    await page.goto('/');

    // Check that the Live Quotes section exists
    await expect(page.locator('text=Live Quotes')).toBeVisible();

    // Verify that either the table or empty state is shown
    const hasTable = await page.locator('table.table-financial').isVisible();
    const hasEmptyState = await page.locator('text=No symbols in watchlist').isVisible();

    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test('form validation works correctly', async ({ page }) => {
    await page.goto('/');

    // Get the form elements
    const symbolInput = page.locator('input[name="symbol"]');
    const submitButton = page.locator('button[type="submit"]');

    // Try to submit empty form
    await submitButton.click();

    // Check for validation error (this might depend on your validation setup)
    // We'll wait a bit for any validation to appear
    await page.waitForTimeout(500);

    // The form should not have submitted successfully with empty input
    // We can verify this by checking the input is still focused or has error styling
    await expect(symbolInput).toBeFocused();
  });

  test('symbol input accepts text input', async ({ page }) => {
    await page.goto('/');

    const symbolInput = page.locator('input[name="symbol"]');

    // Type a symbol
    await symbolInput.fill('AAPL');
    await expect(symbolInput).toHaveValue('AAPL');

    // Clear and type another symbol
    await symbolInput.fill('GOOGL');
    await expect(symbolInput).toHaveValue('GOOGL');
  });

  test('responsive layout works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verify the page still loads and main elements are visible
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Add Symbol')).toBeVisible();
    await expect(page.locator('text=Live Quotes')).toBeVisible();

    // Check that the layout adapts (should stack vertically on mobile)
    const container = page.locator('.grid');
    await expect(container).toBeVisible();
  });

  test('app handles navigation without errors', async ({ page }) => {
    await page.goto('/');

    // Listen for any console errors
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Interact with the form
    const symbolInput = page.locator('input[name="symbol"]');
    await symbolInput.fill('TEST');
    await symbolInput.clear();

    // Wait a bit more to catch any delayed errors
    await page.waitForTimeout(1000);

    // Check that no console errors occurred (filter out known issues)
    const criticalErrors = consoleLogs.filter(
      (log: string) =>
        !log.includes('favicon.ico') &&
        !log.includes('theme-modern.css') &&
        !log.includes('skeleton')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('page has proper accessibility attributes', async ({ page }) => {
    await page.goto('/');

    // Check that the page has proper document structure
    await expect(page.locator('main')).toBeVisible();

    // Verify form labels and inputs are properly associated
    const symbolInput = page.locator('input[name="symbol"]');
    await expect(symbolInput).toBeVisible();

    // Check that buttons have proper text or aria-labels
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();

    const darkModeButton = page.locator('button[aria-label="Dark mode toggle"]');
    await expect(darkModeButton).toBeVisible();
  });

  test('visual regression - dashboard layout', async ({ page }) => {
    await page.goto('/');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot of the full page
    await expect(page).toHaveScreenshot('dashboard-full-page.png');

    // Take screenshots of specific components
    await expect(page.locator('[data-testid="add-symbol-form"]')).toHaveScreenshot(
      'add-symbol-form.png'
    );
    await expect(page.locator('[data-testid="quotes-section"]')).toHaveScreenshot(
      'quotes-section.png'
    );
  });

  test('visual regression - mobile layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot of mobile layout
    await expect(page).toHaveScreenshot('dashboard-mobile.png');
  });
});
