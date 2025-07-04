import { expect, test } from '@playwright/test';

test.describe('Navbar - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('navbar renders and is visible', async ({ page }) => {
    const navbar = page.locator('[data-testid="navbar"]');
    await expect(navbar).toBeVisible();
  });

  test('logo is present and contains tastytrade text', async ({ page }) => {
    const logo = page.locator('[data-testid="navbar-logo"]');
    await expect(logo).toBeVisible();
    await expect(logo).toContainText('tastytrade');
  });

  test('theme toggle button is present and clickable', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();
    
    // Click should work without errors
    await themeToggle.click();
    await page.waitForTimeout(500);
  });

  test('theme icon changes when clicked', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    const themeIcon = page.locator('[data-testid="theme-icon"]');
    
    await expect(themeIcon).toBeVisible();
    
    // Get initial icon src
    const initialSrc = await themeIcon.getAttribute('src');
    
    // Click to toggle theme
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Icon should have changed
    const newSrc = await themeIcon.getAttribute('src');
    expect(newSrc).not.toBe(initialSrc);
  });

  test('theme persists across page reloads', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    
    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Get current theme from localStorage
    const themeBeforeReload = await page.evaluate(() => localStorage.getItem('theme'));
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Theme should be preserved
    const themeAfterReload = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeAfterReload).toBe(themeBeforeReload);
  });

  test('navbar has correct basic structure', async ({ page }) => {
    // Basic structure elements should exist
    await expect(page.locator('[data-testid="navbar"]')).toBeVisible();
    await expect(page.locator('[data-testid="navbar-logo"]')).toBeVisible();
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="theme-icon"]')).toBeVisible();
  });
}); 