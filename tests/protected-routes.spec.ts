import { test, expect } from '@playwright/test';

test.describe('Protected Routes', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication
    await page.context().clearCookies();
  });

  test('should redirect unauthenticated user from root to login', async ({ page }) => {
    await page.goto('/');

    // Should be redirected to login page
    await expect(page).toHaveURL('/login');

    // Should show login form
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should redirect unauthenticated user from watchlist to login', async ({ page }) => {
    await page.goto('/watchlist');

    // Should be redirected to login page
    await expect(page).toHaveURL('/login');

    // Should show login form
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should show intended destination message when redirected', async ({ page }) => {
    await page.goto('/watchlist');

    // Should be redirected to login
    await expect(page).toHaveURL('/login');

    // Should show intended destination message - check for the text that includes strong tags
    await expect(page.locator("text=You'll be redirected to")).toBeVisible();
    await expect(page.locator('strong:has-text("/watchlist")')).toBeVisible();
  });

  test('should allow access to login page when unauthenticated', async ({ page }) => {
    await page.goto('/login');

    // Should stay on login page
    await expect(page).toHaveURL('/login');

    // Should show login form
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should authenticate with demo credentials and access protected routes', async ({
    page,
  }) => {
    // Skip if demo credentials not provided
    if (!process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
      test.skip();
    }

    // Go to login page
    await page.goto('/login');

    // Fill in demo credentials from environment
    await page.fill('input[name="username"]', process.env.DEMO_USERNAME as string);
    await page.fill('input[name="password"]', process.env.DEMO_PASSWORD as string);

    // Submit form
    await page.click('button[type="submit"]');

    // Should be redirected to home page
    await expect(page).toHaveURL('/');

    // Should show authenticated user info in navbar
    await expect(page.locator('text=Welcome,')).toBeVisible();
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });

  test('should redirect to intended destination after login', async ({ page }) => {
    // Skip if demo credentials not provided
    if (!process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
      test.skip();
    }

    // First, try to access protected watchlist page
    await page.goto('/watchlist');

    // Should be redirected to login with intended destination message
    await expect(page).toHaveURL('/login');
    await expect(page.locator("text=You'll be redirected to")).toContainText('/watchlist');

    // Login with demo credentials
    await page.fill('input[name="username"]', process.env.DEMO_USERNAME as string);
    await page.fill('input[name="password"]', process.env.DEMO_PASSWORD as string);
    await page.click('button[type="submit"]');

    // Should be redirected to originally requested watchlist page
    await expect(page).toHaveURL('/watchlist');

    // Should show watchlist content
    await expect(page.locator('h1')).toContainText('Your Watchlist');
    await expect(page.locator('text=Welcome back,')).toBeVisible();
  });

  test('should allow authenticated user to access protected routes', async ({ page }) => {
    // Skip if demo credentials not provided
    if (!process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
      test.skip();
    }

    // Login first
    await page.goto('/login');

    await page.fill('input[name="username"]', process.env.DEMO_USERNAME as string);
    await page.fill('input[name="password"]', process.env.DEMO_PASSWORD as string);
    await page.click('button[type="submit"]');

    // Wait for redirect to home
    await expect(page).toHaveURL('/');

    // Now try accessing watchlist directly
    await page.goto('/watchlist');

    // Should access watchlist without redirect
    await expect(page).toHaveURL('/watchlist');
    await expect(page.locator('h1')).toContainText('Your Watchlist');

    // Should show user info
    await expect(page.locator(`text=${process.env.DEMO_USERNAME as string}`)).toBeVisible();
  });

  test('should logout and redirect to login', async ({ page }) => {
    // Skip if demo credentials not provided
    if (!process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
      test.skip();
    }

    // Login first
    await page.goto('/login');

    await page.fill('input[name="username"]', process.env.DEMO_USERNAME as string);
    await page.fill('input[name="password"]', process.env.DEMO_PASSWORD as string);
    await page.click('button[type="submit"]');

    // Wait for successful login
    await expect(page).toHaveURL('/');
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();

    // Click logout
    await page.click('button:has-text("Logout")');

    // Should be redirected to login page
    await expect(page).toHaveURL('/login');

    // Should no longer show user info
    await expect(page.locator('button:has-text("Logout")')).not.toBeVisible();

    // Should show login form
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });

  test('should block access to protected routes after logout', async ({ page }) => {
    // Skip if demo credentials not provided
    if (!process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
      test.skip();
    }

    // Login first
    await page.goto('/login');

    await page.fill('input[name="username"]', process.env.DEMO_USERNAME as string);
    await page.fill('input[name="password"]', process.env.DEMO_PASSWORD as string);
    await page.click('button[type="submit"]');

    // Verify login success
    await expect(page).toHaveURL('/');

    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');

    // Try to access protected route
    await page.goto('/watchlist');

    // Should be redirected back to login
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should handle login form validation', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=Username is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should handle invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill with invalid credentials
    await page.fill('input[name="username"]', 'invalid_user');
    await page.fill('input[name="password"]', 'invalid_password');
    await page.click('button[type="submit"]');

    // Should stay on login page and show error
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Authentication Failed' })).toBeVisible();
  });

  test('should redirect authenticated user away from login page', async ({ page }) => {
    // Skip if demo credentials not provided
    if (!process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
      test.skip();
    }

    // Login first
    await page.goto('/login');

    await page.fill('input[name="username"]', process.env.DEMO_USERNAME as string);
    await page.fill('input[name="password"]', process.env.DEMO_PASSWORD as string);
    await page.click('button[type="submit"]');

    // Verify login success
    await expect(page).toHaveURL('/');

    // Try to go to login page again
    await page.goto('/login');

    // Should be redirected away from login page
    await expect(page).not.toHaveURL('/login');
    await expect(page).toHaveURL('/');
  });
});
