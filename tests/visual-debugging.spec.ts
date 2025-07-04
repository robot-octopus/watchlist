import { test } from '@playwright/test';

test.describe('Visual Debugging & Screenshot Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any common state before each test
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('capture app states for debugging', async ({ page }) => {
    // Capture initial load state
    await page.screenshot({ 
      path: 'test-results/debug-initial-load.png',
      fullPage: true 
    });

    // Interact with form and capture state
    const symbolInput = page.locator('[data-testid="symbol-input"]');
    await symbolInput.fill('AAPL');
    await page.screenshot({ 
      path: 'test-results/debug-form-filled.png',
      fullPage: true 
    });

    // Submit form and capture result
    await page.locator('[data-testid="add-symbol-submit"]').click();
    await page.waitForTimeout(1000); // Wait for any animations
    await page.screenshot({ 
      path: 'test-results/debug-form-submitted.png',
      fullPage: true 
    });
  });

  test('capture component states individually', async ({ page }) => {
    // Screenshot individual components for detailed debugging
    await page.locator('[data-testid="app-bar"]').screenshot({ 
      path: 'test-results/component-header.png' 
    });
    
    await page.locator('[data-testid="add-symbol-form"]').screenshot({ 
      path: 'test-results/component-form.png' 
    });
    
    await page.locator('[data-testid="quotes-section"]').screenshot({ 
      path: 'test-results/component-quotes.png' 
    });
  });

  test('capture error states', async ({ page }) => {
    // Test form validation error state
    const submitButton = page.locator('[data-testid="add-symbol-submit"]');
    await submitButton.click();
    
    // Wait for validation to appear
    await page.waitForTimeout(500);
    
    // Capture validation error state
    await page.screenshot({ 
      path: 'test-results/debug-validation-error.png',
      fullPage: true 
    });
  });

  test('capture different viewport sizes', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/debug-desktop-1920.png',
      fullPage: true 
    });

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/debug-tablet-768.png',
      fullPage: true 
    });

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/debug-mobile-375.png',
      fullPage: true 
    });
  });

  test('capture loading states and animations', async ({ page }) => {
    // Navigate to page and capture loading sequence
    const navigationPromise = page.goto('/');
    
    // Capture page during load
    await page.screenshot({ 
      path: 'test-results/debug-loading.png',
      fullPage: true 
    });
    
    await navigationPromise;
    await page.waitForLoadState('networkidle');
    
    // Capture fully loaded state
    await page.screenshot({ 
      path: 'test-results/debug-loaded.png',
      fullPage: true 
    });
  });

  test('capture dark mode toggle', async ({ page }) => {
    // Capture light mode
    await page.screenshot({ 
      path: 'test-results/debug-light-mode.png',
      fullPage: true 
    });

    // Click dark mode toggle (if it works)
    const darkModeButton = page.locator('[data-testid="dark-mode-toggle"]');
    await darkModeButton.click();
    await page.waitForTimeout(500); // Wait for theme transition
    
    // Capture dark mode
    await page.screenshot({ 
      path: 'test-results/debug-dark-mode.png',
      fullPage: true 
    });
  });

  test('test with network errors', async ({ page }) => {
    // Block network requests to simulate offline state
    await page.route('**/*', route => route.abort());
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Capture error state
    await page.screenshot({ 
      path: 'test-results/debug-network-error.png',
      fullPage: true 
    });
  });
}); 