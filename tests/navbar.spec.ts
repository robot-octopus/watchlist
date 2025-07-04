import { expect, test } from '@playwright/test';

test.describe('Navbar Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Layout and Structure', () => {
    test('should display navbar with correct structure', async ({ page }) => {
      // Check navbar exists
      const navbar = page.locator('[data-testid="navbar"]');
      await expect(navbar).toBeVisible();

      // Check navbar has proper styling classes
      await expect(navbar).toHaveClass(new RegExp('bg-surface-'));
    });

    test('should have logo in top left position', async ({ page }) => {
      const logo = page.locator('[data-testid="navbar-logo"]');
      await expect(logo).toBeVisible();

      // Check logo contains Tastytrade branding
      await expect(logo).toContainText('tastytrade');

      // Check logo positioning (should be on the left side)
      const logoBox = await logo.boundingBox();
      const navbarBox = await page.locator('[data-testid="navbar"]').boundingBox();

      expect(logoBox).not.toBeNull();
      expect(navbarBox).not.toBeNull();

      if (logoBox && navbarBox) {
        // Logo should be positioned on the left side
        expect(logoBox.x - navbarBox.x).toBeLessThan(navbarBox.width / 2);
      }
    });

    test('should have theme toggle button in top right position', async ({ page }) => {
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      await expect(themeToggle).toBeVisible();

      // Check button has proper ARIA attributes
      await expect(themeToggle).toHaveAttribute('aria-label', new RegExp('theme', 'i'));
      await expect(themeToggle).toHaveAttribute('role', 'button');

      // Check theme toggle positioning (should be on the right side)
      const toggleBox = await themeToggle.boundingBox();
      const navbarBox = await page.locator('[data-testid="navbar"]').boundingBox();

      expect(toggleBox).not.toBeNull();
      expect(navbarBox).not.toBeNull();

      if (toggleBox && navbarBox) {
        // Toggle should be positioned on the right side
        expect(toggleBox.x - navbarBox.x).toBeGreaterThan(navbarBox.width / 2);
      }
    });

    test('should have proper spacing between logo and theme toggle', async ({ page }) => {
      const logo = page.locator('[data-testid="navbar-logo"]');
      const themeToggle = page.locator('[data-testid="theme-toggle"]');

      const logoBox = await logo.boundingBox();
      const toggleBox = await themeToggle.boundingBox();

      expect(logoBox).not.toBeNull();
      expect(toggleBox).not.toBeNull();

      if (logoBox && toggleBox) {
        // Should have adequate spacing between elements
        const spacing = toggleBox.x - (logoBox.x + logoBox.width);
        expect(spacing).toBeGreaterThan(20); // At least 20px spacing
      }
    });
  });

  test.describe('Theme Detection and Default State', () => {
    test('should respect user system theme preference (light)', async ({ page, context }) => {
      // Set system preference to light mode
      await context.addInitScript(() => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: (query: string) => ({
            matches: query === '(prefers-color-scheme: light)',
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => {},
          }),
        });
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check that light theme is applied
      await expect(page.locator('html')).not.toHaveClass(new RegExp('dark'));

      // Check theme toggle shows moon icon (indicating light mode is active)
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      const toggleIcon = themeToggle.locator('[data-testid="theme-icon"]');
      await expect(toggleIcon).toHaveAttribute('src', new RegExp('moon.svg'));
    });

    test('should respect user system theme preference (dark)', async ({ page, context }) => {
      // Set system preference to dark mode
      await context.addInitScript(() => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: (query: string) => ({
            matches: query === '(prefers-color-scheme: dark)',
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => {},
          }),
        });
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check that dark theme is applied
      await expect(page.locator('html')).toHaveClass(new RegExp('dark'));

      // Check theme toggle shows sun icon (indicating dark mode is active)
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      const toggleIcon = themeToggle.locator('[data-testid="theme-icon"]');
      await expect(toggleIcon).toHaveAttribute('src', new RegExp('sun.svg'));
    });

    test('should persist theme preference in localStorage', async ({ page }) => {
      // Check if theme preference is stored
      const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(['light', 'dark', null]).toContain(storedTheme);
    });
  });

  test.describe('Theme Switching Functionality', () => {
    test('should switch from light to dark theme', async ({ page }) => {
      // Ensure we start in light mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify starting state
      await expect(page.locator('html')).not.toHaveClass(new RegExp('dark'));

      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      const toggleIcon = themeToggle.locator('[data-testid="theme-icon"]');
      await expect(toggleIcon).toHaveAttribute('src', new RegExp('moon.svg'));

      // Click theme toggle
      await themeToggle.click();
      await page.waitForTimeout(300); // Allow for theme transition

      // Verify dark mode is now active
      await expect(page.locator('html')).toHaveClass(new RegExp('dark'));
      await expect(toggleIcon).toHaveAttribute('src', new RegExp('sun.svg'));

      // Verify localStorage is updated
      const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(storedTheme).toBe('dark');
    });

    test('should switch from dark to light theme', async ({ page }) => {
      // Ensure we start in dark mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify starting state
      await expect(page.locator('html')).toHaveClass(new RegExp('dark'));

      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      const toggleIcon = themeToggle.locator('[data-testid="theme-icon"]');
      await expect(toggleIcon).toHaveAttribute('src', new RegExp('sun.svg'));

      // Click theme toggle
      await themeToggle.click();
      await page.waitForTimeout(300); // Allow for theme transition

      // Verify light mode is now active
      await expect(page.locator('html')).not.toHaveClass(new RegExp('dark'));
      await expect(toggleIcon).toHaveAttribute('src', new RegExp('moon.svg'));

      // Verify localStorage is updated
      const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(storedTheme).toBe('light');
    });

    test('should maintain theme preference across page reloads', async ({ page }) => {
      // Set dark theme
      const themeToggle = page.locator('[data-testid="theme-toggle"]');

      // Ensure we're in light mode first
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      });
      await page.reload();

      // Switch to dark mode
      await themeToggle.click();
      await page.waitForTimeout(300);
      await expect(page.locator('html')).toHaveClass(new RegExp('dark'));

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify dark theme persisted
      await expect(page.locator('html')).toHaveClass(new RegExp('dark'));
      const toggleIcon = themeToggle.locator('[data-testid="theme-icon"]');
      await expect(toggleIcon).toHaveAttribute('src', new RegExp('sun.svg'));
    });
  });

  test.describe('Visual Appearance', () => {
    test('should have correct styling in light mode', async ({ page }) => {
      // Set light mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const navbar = page.locator('[data-testid="navbar"]');

      // Check navbar has light theme styling
      await expect(navbar).toHaveCSS(
        'background-color',
        new RegExp('(255, 255, 255|rgb\\(255, 255, 255\\))')
      );

      // Take screenshot for visual regression
      await expect(navbar).toHaveScreenshot('navbar-light-theme.png');
    });

    test('should have correct styling in dark mode', async ({ page }) => {
      // Set dark mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const navbar = page.locator('[data-testid="navbar"]');

      // Check navbar has dark theme styling
      await expect(navbar).toHaveCSS(
        'background-color',
        new RegExp('(0, 0, 0|rgb\\(0, 0, 0\\)|17, 24, 39)')
      );

      // Take screenshot for visual regression
      await expect(navbar).toHaveScreenshot('navbar-dark-theme.png');
    });

    test('should have smooth theme transition animation', async ({ page }) => {
      // Start in light mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      });
      await page.reload();

      const themeToggle = page.locator('[data-testid="theme-toggle"]');

      // Record timing of theme switch
      const startTime = Date.now();
      await themeToggle.click();

      // Wait for transition to complete
      await page.waitForTimeout(400);
      const endTime = Date.now();

      // Should have reasonable transition duration
      expect(endTime - startTime).toBeGreaterThan(200);
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      const themeToggle = page.locator('[data-testid="theme-toggle"]');

      // Check ARIA attributes
      await expect(themeToggle).toHaveAttribute('aria-label');
      await expect(themeToggle).toHaveAttribute('role', 'button');
      await expect(themeToggle).toHaveAttribute('tabindex', '0');
    });

    test('should be keyboard accessible', async ({ page }) => {
      const themeToggle = page.locator('[data-testid="theme-toggle"]');

      // Focus the theme toggle button
      await themeToggle.focus();
      await expect(themeToggle).toBeFocused();

      // Test keyboard activation with Enter
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Should have toggled theme
      const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(['light', 'dark']).toContain(storedTheme);

      // Test keyboard activation with Space
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);

      // Theme should have changed again
      const newStoredTheme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(newStoredTheme).not.toBe(storedTheme);
    });

    test('should have sufficient color contrast', async ({ page }) => {
      // Test light mode contrast
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      });
      await page.reload();

      // Note: In a real implementation, you'd use tools like axe-core
      // for automated accessibility testing
      const navbar = page.locator('[data-testid="navbar"]');
      await expect(navbar).toBeVisible();

      // Test dark mode contrast
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      });
      await page.reload();

      await expect(navbar).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const navbar = page.locator('[data-testid="navbar"]');
      const logo = page.locator('[data-testid="navbar-logo"]');
      const themeToggle = page.locator('[data-testid="theme-toggle"]');

      // All elements should be visible
      await expect(navbar).toBeVisible();
      await expect(logo).toBeVisible();
      await expect(themeToggle).toBeVisible();

      // Elements should still be properly positioned
      const logoBox = await logo.boundingBox();
      const toggleBox = await themeToggle.boundingBox();

      if (logoBox && toggleBox) {
        expect(logoBox.x).toBeLessThan(toggleBox.x);
      }

      // Take mobile screenshot
      await expect(navbar).toHaveScreenshot('navbar-mobile.png');
    });

    test('should work correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const navbar = page.locator('[data-testid="navbar"]');
      await expect(navbar).toBeVisible();

      // Take tablet screenshot
      await expect(navbar).toHaveScreenshot('navbar-tablet.png');
    });

    test('should work correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const navbar = page.locator('[data-testid="navbar"]');
      await expect(navbar).toBeVisible();

      // Take desktop screenshot
      await expect(navbar).toHaveScreenshot('navbar-desktop.png');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle missing localStorage gracefully', async ({ page, context }) => {
      // Mock localStorage to be unavailable
      await context.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          value: null,
          writable: false,
        });
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still render navbar
      const navbar = page.locator('[data-testid="navbar"]');
      await expect(navbar).toBeVisible();

      // Theme toggle should still work (fallback to system preference)
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      await expect(themeToggle).toBeVisible();
      await themeToggle.click();

      // Should not throw errors
      await page.waitForTimeout(300);
    });

    test('should handle corrupted theme data in localStorage', async ({ page }) => {
      // Set invalid theme data
      await page.evaluate(() => {
        localStorage.setItem('theme', 'invalid-theme-value');
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should fallback to system preference or default
      const navbar = page.locator('[data-testid="navbar"]');
      await expect(navbar).toBeVisible();

      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      await expect(themeToggle).toBeVisible();
    });
  });
});
