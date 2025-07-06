import { test, expect } from '@playwright/test';

test.describe('Login Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication
    await page.context().clearCookies();
  });

  test('should login with valid demo credentials', async ({ page }) => {
    // Skip if demo credentials not provided
    if (!process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
      test.skip();
    }

    await page.goto('/login');

    // Fill in the form
    await page.getByPlaceholder('Enter your username or email').fill(process.env.DEMO_USERNAME);
    await page.getByPlaceholder('Enter your password').fill(process.env.DEMO_PASSWORD);

    // Submit the form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should redirect to home page
    await expect(page).toHaveURL('/');

    // Should show user info in navbar
    await expect(page.getByText(process.env.DEMO_USERNAME)).toBeVisible();
  });

  test('should handle login form errors gracefully', async ({ page }) => {
    // Skip if demo credentials not provided
    if (!process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
      test.skip();
    }

    await page.goto('/login');

    // Fill form with valid username but wrong password
    await page.getByPlaceholder('Enter your username or email').fill(process.env.DEMO_USERNAME);
    await page.getByPlaceholder('Enter your password').fill('wrong_password');

    // Submit the form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should stay on login page
    await expect(page).toHaveURL('/login');

    // Should show error message
    await expect(page.getByText('Authentication Failed')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show field validation errors
    await expect(page.getByText('Username is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.getByPlaceholder('Enter your password');
    const toggleButton = page.getByRole('button', { name: /show|hide password/i });

    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle to hide password again
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure by going offline
    await page.context().setOffline(true);

    await page.goto('/login');

    // Fill form with any credentials
    await page.getByPlaceholder('Enter your username or email').fill('test_user');
    await page.getByPlaceholder('Enter your password').fill('test_password');

    // Submit the form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should handle the error gracefully
    // (Exact behavior depends on implementation - could show network error or generic error)
    await expect(page).toHaveURL('/login');
  });

  test('should show loading state during login', async ({ page }) => {
    // Skip if demo credentials not provided
    if (!process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
      test.skip();
    }

    await page.goto('/login');

    // Fill in valid credentials
    await page.getByPlaceholder('Enter your username or email').fill(process.env.DEMO_USERNAME);
    await page.getByPlaceholder('Enter your password').fill(process.env.DEMO_PASSWORD);

    // Click submit and immediately check for loading state
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show loading state briefly
    await expect(page.getByText('Signing in...')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Skip if demo credentials not provided
    if (!process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
      test.skip();
    }

    // First login
    await page.goto('/login');
    await page.getByPlaceholder('Enter your username or email').fill(process.env.DEMO_USERNAME);
    await page.getByPlaceholder('Enter your password').fill(process.env.DEMO_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify login success
    await expect(page).toHaveURL('/');

    // Now logout
    await page.getByRole('button', { name: 'Logout' }).click();

    // Should redirect to login page
    await expect(page).toHaveURL('/login');

    // Should not show user info anymore
    await expect(page.getByText(process.env.DEMO_USERNAME)).not.toBeVisible();
  });

  test('should redirect to intended destination after login', async ({ page }) => {
    // Skip if demo credentials not provided
    if (!process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
      test.skip();
    }

    // Try to access protected route first
    await page.goto('/watchlist');

    // Should be redirected to login with intended destination message
    await expect(page).toHaveURL('/login');
    await expect(
      page.getByText("You'll be redirected to /watchlist after signing in")
    ).toBeVisible();

    // Login
    await page.getByPlaceholder('Enter your username or email').fill(process.env.DEMO_USERNAME);
    await page.getByPlaceholder('Enter your password').fill(process.env.DEMO_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should be redirected to originally requested page
    await expect(page).toHaveURL('/watchlist');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Skip if demo credentials not provided
    if (!process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
      test.skip();
    }

    await page.goto('/login');

    // Use keyboard to navigate and fill form
    await page.keyboard.press('Tab'); // Focus username field
    await page.keyboard.type(process.env.DEMO_USERNAME);

    await page.keyboard.press('Tab'); // Focus password field
    await page.keyboard.type(process.env.DEMO_PASSWORD);

    await page.keyboard.press('Tab'); // Focus submit button
    await page.keyboard.press('Enter'); // Submit form

    // Should login successfully
    await expect(page).toHaveURL('/');
  });

  test('should handle form autocomplete attributes', async ({ page }) => {
    await page.goto('/login');

    // Check autocomplete attributes
    await expect(page.getByPlaceholder('Enter your username or email')).toHaveAttribute(
      'autocomplete',
      'username'
    );
    await expect(page.getByPlaceholder('Enter your password')).toHaveAttribute(
      'autocomplete',
      'current-password'
    );
  });

  test('should maintain form state on navigation', async ({ page }) => {
    await page.goto('/login');

    // Fill in partial form data
    await page.getByPlaceholder('Enter your username or email').fill('partial_username');

    // Navigate away and back
    await page.goto('/');
    await page.goto('/login');

    // Form should be reset (this is expected behavior for login forms)
    await expect(page.getByPlaceholder('Enter your username or email')).toHaveValue('');
  });
});
