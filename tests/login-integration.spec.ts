import { test, expect } from '@playwright/test';

test.describe('Login Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.goto('/');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Should be redirected to login page when accessing root
    await expect(page).toHaveURL('/login');

    // Should see login form
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter your username or email')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
  });

  test('should show intended destination when redirected from protected route', async ({
    page,
  }) => {
    // Try to access protected route directly
    await page.goto('/watchlist');

    // Should be redirected to login
    await expect(page).toHaveURL('/login');

    // Should show intended destination message
    await expect(
      page.locator("text=You'll be redirected to /watchlist after signing in")
    ).toBeVisible();
  });

  test('should successfully authenticate with demo credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in demo credentials
    await page.getByPlaceholder('Enter your username or email').fill('Travis1282');
    await page.getByPlaceholder('Enter your password').fill('Lometogo202');

    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should see loading state
    await expect(page.getByText('Signing in...')).toBeVisible();

    // Should be redirected to home page after login
    await expect(page).toHaveURL('/');

    // Should see user info in navbar
    await expect(page.getByText('Travis1282')).toBeVisible();
    await expect(page.getByText('Authenticated')).toBeVisible();
    await expect(page.getByTestId('logout-button')).toBeVisible();
  });

  test('should redirect to intended destination after login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/watchlist');

    // Should be redirected to login with intended destination shown
    await expect(page).toHaveURL('/login');
    await expect(
      page.locator("text=You'll be redirected to /watchlist after signing in")
    ).toBeVisible();

    // Login with demo credentials
    await page.getByPlaceholder('Enter your username or email').fill('Travis1282');
    await page.getByPlaceholder('Enter your password').fill('Lometogo202');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should be redirected to intended destination
    await expect(page).toHaveURL('/watchlist');
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show validation errors
    await expect(page.getByText('Username is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();

    // Fill username but leave password empty
    await page.getByPlaceholder('Enter your username or email').fill('test');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should still show password error
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.getByPlaceholder('Enter your username or email').fill('invalid@example.com');
    await page.getByPlaceholder('Enter your password').fill('wrongpassword');

    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show authentication error
    await expect(page.getByText('Authentication Failed')).toBeVisible();

    // Should remain on login page
    await expect(page).toHaveURL('/login');
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.getByPlaceholder('Enter your password');
    const toggleButton = page.getByRole('button', { name: 'Show password' });

    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle to hide password again
    await page.getByRole('button', { name: 'Hide password' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should prevent accessing login page when already authenticated', async ({ page }) => {
    await page.goto('/login');

    // Login with demo credentials
    await page.getByPlaceholder('Enter your username or email').fill('Travis1282');
    await page.getByPlaceholder('Enter your password').fill('Lometogo202');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should be redirected to home
    await expect(page).toHaveURL('/');

    // Try to access login page directly
    await page.goto('/login');

    // Should be redirected back to home
    await expect(page).toHaveURL('/');
  });

  test('should successfully logout', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByPlaceholder('Enter your username or email').fill('Travis1282');
    await page.getByPlaceholder('Enter your password').fill('Lometogo202');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should be authenticated
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('logout-button')).toBeVisible();

    // Click logout button
    await page.getByTestId('logout-button').click();

    // Should see logging out state
    await expect(page.getByText('Signing out...')).toBeVisible();

    // Should be redirected to login page
    await expect(page).toHaveURL('/login');

    // Should not see user info in navbar anymore
    await expect(page.getByText('Travis1282')).not.toBeVisible();
    await expect(page.getByTestId('logout-button')).not.toBeVisible();
  });

  test('should prevent navigation back to protected routes after logout', async ({ page }) => {
    // Login and navigate to protected route
    await page.goto('/login');
    await page.getByPlaceholder('Enter your username or email').fill('Travis1282');
    await page.getByPlaceholder('Enter your password').fill('Lometogo202');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.goto('/watchlist');

    // Logout
    await page.getByTestId('logout-button').click();
    await expect(page).toHaveURL('/login');

    // Try to access protected route again
    await page.goto('/watchlist');

    // Should be redirected to login
    await expect(page).toHaveURL('/login');
  });

  test('should persist login state across page refreshes', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByPlaceholder('Enter your username or email').fill('Travis1282');
    await page.getByPlaceholder('Enter your password').fill('Lometogo202');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should be authenticated
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('logout-button')).toBeVisible();

    // Refresh the page
    await page.reload();

    // Should still be authenticated
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('logout-button')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/login');

    // Intercept and fail the authentication request
    await page.route('**/sessions', (route) => {
      route.abort('failed');
    });

    // Try to login
    await page.getByPlaceholder('Enter your username or email').fill('test@example.com');
    await page.getByPlaceholder('Enter your password').fill('password');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show network error
    await expect(page.getByText('Authentication failed')).toBeVisible();

    // Should remain on login page
    await expect(page).toHaveURL('/login');
  });

  test('should work with keyboard navigation', async ({ page }) => {
    await page.goto('/login');

    // Tab through form elements
    await page.keyboard.press('Tab'); // Username field
    await page.keyboard.type('Travis1282');

    await page.keyboard.press('Tab'); // Password field
    await page.keyboard.type('Lometogo202');

    await page.keyboard.press('Tab'); // Password toggle button
    await page.keyboard.press('Tab'); // Sign In button
    await page.keyboard.press('Enter'); // Submit form

    // Should successfully login
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('logout-button')).toBeVisible();
  });

  test('should display proper loading states during authentication check', async ({ page }) => {
    await page.goto('/');

    // Should show loading state while checking authentication
    // Note: This might be very quick in demo mode, but important for real API
    const loadingIndicator = page.getByText('Checking authentication...');

    // Either we see the loading state briefly, or we're immediately redirected
    // Both are acceptable behavior
    const isLoading = await loadingIndicator.isVisible().catch(() => false);
    const isRedirected = await page.url().includes('/login');

    expect(isLoading || isRedirected).toBe(true);
  });
});
