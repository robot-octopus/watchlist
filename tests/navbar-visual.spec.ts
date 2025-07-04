import { expect, test } from '@playwright/test';

test.describe('Navbar Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Visual Regression Tests', () => {
    test('captures navbar initial state', async ({ page }) => {
      const navbar = page.locator('[data-testid="navbar"]');
      
      // Capture full navbar
      await expect(navbar).toHaveScreenshot('navbar-initial-state.png');
    });

    test('captures logo hover state', async ({ page }) => {
      const logo = page.locator('[data-testid="navbar-logo"]');
      
      // Hover over logo
      await logo.hover();
      await page.waitForTimeout(200); // Allow for hover animation
      
      await expect(logo).toHaveScreenshot('navbar-logo-hover.png');
    });

    test('captures theme toggle hover states', async ({ page }) => {
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      
      // Light mode hover
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      });
      await page.reload();
      
      await themeToggle.hover();
      await page.waitForTimeout(200);
      await expect(themeToggle).toHaveScreenshot('theme-toggle-light-hover.png');
      
      // Dark mode hover
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      });
      await page.reload();
      
      await themeToggle.hover();
      await page.waitForTimeout(200);
      await expect(themeToggle).toHaveScreenshot('theme-toggle-dark-hover.png');
    });

    test('captures theme toggle focus states', async ({ page }) => {
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      
      // Focus in light mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      });
      await page.reload();
      
      await themeToggle.focus();
      await expect(themeToggle).toHaveScreenshot('theme-toggle-light-focus.png');
      
      // Focus in dark mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      });
      await page.reload();
      
      await themeToggle.focus();
      await expect(themeToggle).toHaveScreenshot('theme-toggle-dark-focus.png');
    });
  });

  test.describe('Theme Transition Visual Tests', () => {
    test('captures theme switching animation sequence', async ({ page }) => {
      // Start in light mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      });
      await page.reload();
      
      const navbar = page.locator('[data-testid="navbar"]');
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      
      // Capture before transition
      await expect(navbar).toHaveScreenshot('navbar-before-theme-switch.png');
      
      // Click to start transition
      await themeToggle.click();
      
      // Capture mid-transition (if animation exists)
      await page.waitForTimeout(100);
      await expect(navbar).toHaveScreenshot('navbar-during-theme-switch.png');
      
      // Capture after transition
      await page.waitForTimeout(300);
      await expect(navbar).toHaveScreenshot('navbar-after-theme-switch.png');
    });

    test('captures icon changes during theme switch', async ({ page }) => {
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      const toggleIcon = themeToggle.locator('[data-testid="theme-icon"]');
      
      // Start in light mode - should show moon
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      });
      await page.reload();
      
      await expect(toggleIcon).toHaveScreenshot('theme-icon-moon.png');
      
      // Switch to dark mode - should show sun
      await themeToggle.click();
      await page.waitForTimeout(300);
      
      await expect(toggleIcon).toHaveScreenshot('theme-icon-sun.png');
    });
  });

  test.describe('Responsive Layout Visual Tests', () => {
    test('captures navbar on different screen sizes', async ({ page }) => {
      const navbar = page.locator('[data-testid="navbar"]');
      
      // Mobile portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await expect(navbar).toHaveScreenshot('navbar-mobile-portrait.png');
      
      // Mobile landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.reload();
      await expect(navbar).toHaveScreenshot('navbar-mobile-landscape.png');
      
      // Tablet portrait
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await expect(navbar).toHaveScreenshot('navbar-tablet-portrait.png');
      
      // Tablet landscape
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.reload();
      await expect(navbar).toHaveScreenshot('navbar-tablet-landscape.png');
      
      // Desktop small
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.reload();
      await expect(navbar).toHaveScreenshot('navbar-desktop-small.png');
      
      // Desktop large
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      await expect(navbar).toHaveScreenshot('navbar-desktop-large.png');
    });
  });

  test.describe('Brand Consistency Tests', () => {
    test('verifies logo matches Tastytrade brand guidelines', async ({ page }) => {
      const logo = page.locator('[data-testid="navbar-logo"]');
      
      // Check logo contains proper text
      await expect(logo).toContainText(new RegExp('tastytrade', 'i'));
      
      // Check logo styling matches brand
      await expect(logo).toHaveCSS('font-weight', new RegExp('bold|700'));
      
      // Visual comparison
      await expect(logo).toHaveScreenshot('tastytrade-logo.png');
    });

    test('verifies color scheme matches Tastytrade brand', async ({ page }) => {
      const navbar = page.locator('[data-testid="navbar"]');
      
      // Light theme brand colors
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      });
      await page.reload();
      
      await expect(navbar).toHaveScreenshot('navbar-brand-light.png');
      
      // Dark theme brand colors
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      });
      await page.reload();
      
      await expect(navbar).toHaveScreenshot('navbar-brand-dark.png');
    });
  });

  test.describe('Edge Cases Visual Tests', () => {
    test('captures navbar with long text content', async ({ page }) => {
      // Mock long brand name to test text overflow
      await page.evaluate(() => {
        const logo = document.querySelector('[data-testid="navbar-logo"]');
        if (logo) {
          logo.textContent = 'Very Long Brand Name That Might Overflow';
        }
      });
      
      const navbar = page.locator('[data-testid="navbar"]');
      await expect(navbar).toHaveScreenshot('navbar-long-text.png');
    });

    test('captures navbar with focus indicators', async ({ page }) => {
      // Tab through navbar elements
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      const navbar = page.locator('[data-testid="navbar"]');
      await expect(navbar).toHaveScreenshot('navbar-with-focus.png');
    });

    test('captures navbar during high contrast mode', async ({ page, context }) => {
      // Enable high contrast mode
      await context.addInitScript(() => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: (query: string) => ({
            matches: query === '(prefers-contrast: high)',
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
      const navbar = page.locator('[data-testid="navbar"]');
      await expect(navbar).toHaveScreenshot('navbar-high-contrast.png');
    });
  });

  test.describe('Animation and Interaction Visual Tests', () => {
    test('captures smooth hover transitions', async ({ page }) => {
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      
      // Capture before hover
      await expect(themeToggle).toHaveScreenshot('theme-toggle-before-hover.png');
      
      // Start hover
      await themeToggle.hover();
      await page.waitForTimeout(50); // Capture mid-animation
      await expect(themeToggle).toHaveScreenshot('theme-toggle-mid-hover.png');
      
      // Complete hover
      await page.waitForTimeout(200);
      await expect(themeToggle).toHaveScreenshot('theme-toggle-full-hover.png');
    });

    test('captures active/pressed state', async ({ page }) => {
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      
      // Use mouse down to capture active state
      await themeToggle.hover();
      await page.mouse.down();
      await page.waitForTimeout(100);
      
      await expect(themeToggle).toHaveScreenshot('theme-toggle-active.png');
      
      await page.mouse.up();
    });
  });
}); 