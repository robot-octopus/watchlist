# Testing Guide

## Test Scripts

### Unit Tests

```bash
npm run test:unit           # Run Vitest unit tests
```

### Integration Tests (Playwright)

```bash
npm run test:integration    # Run all Playwright tests
npm run test:headed         # Run tests with browser UI visible
npm run test:debug          # Run tests in debug mode
npm run test:visual         # Run visual debugging tests only
```

### Visual Testing & Screenshots

```bash
npm run test:screenshots    # Update all visual snapshots
npm run test:report         # Open HTML test report
```

## Screenshot & Visual Debugging

### Automatic Screenshots on Failure

- Playwright is configured to automatically take screenshots when tests fail
- Screenshots are saved to `test-results/` directory
- Full page screenshots with timestamps for debugging

### Visual Regression Testing

- Use `expect(page).toHaveScreenshot()` for visual comparisons
- Screenshots stored in `tests/visual-debugging.spec.ts-snapshots/`
- Update with `npm run test:screenshots`

### Debug Artifacts Location

```
test-results/
├── debug-initial-load.png      # App loading state
├── debug-form-filled.png       # Form with data
├── debug-validation-error.png  # Error states
├── component-header.png        # Individual components
├── debug-mobile-375.png        # Responsive breakpoints
└── traces/                     # Playwright traces for debugging
```

### Test Debugging Workflow

1. **Run tests and capture failures:**

   ```bash
   npm run test:integration
   ```

2. **View test report with screenshots:**

   ```bash
   npm run test:report
   ```

3. **Debug specific test interactively:**

   ```bash
   npm run test:debug -- --grep "specific test name"
   ```

4. **Generate debug screenshots:**
   ```bash
   npm run test:visual
   ```

## Test Structure

### App Loading Tests (`tests/app.spec.ts`)

- ✅ App loads successfully
- ✅ Header with branding
- ✅ Form functionality
- ✅ Table/empty states
- ✅ Form validation
- ✅ Responsive design
- ✅ Error handling
- ✅ Accessibility

### Visual Debugging Tests (`tests/visual-debugging.spec.ts`)

- 📸 Component screenshots
- 📸 Different viewport sizes
- 📸 Error states
- 📸 Loading states
- 📸 Dark/light mode
- 📸 Network error scenarios

## Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
screenshot: {
  mode: 'only-on-failure',  // Auto screenshot on fail
  fullPage: true,           // Full page capture
},

video: {
  mode: 'retain-on-failure', // Video recording on fail
},

trace: 'retain-on-failure',  // Detailed traces for debugging
```

### Test Data IDs

Components include `data-testid` attributes for reliable targeting:

- `[data-testid="app-bar"]` - Header
- `[data-testid="add-symbol-form"]` - Form
- `[data-testid="symbol-input"]` - Input field
- `[data-testid="quotes-section"]` - Table area

## Debugging Failed Tests

1. **Check Screenshots:** Look in `test-results/` for failure screenshots
2. **View Traces:** Open Playwright trace files to see detailed execution
3. **Run in Headed Mode:** Use `npm run test:headed` to watch tests run
4. **Debug Mode:** Use `npm run test:debug` for step-by-step debugging

## Visual Regression Testing

### Creating New Visual Tests

```typescript
test('visual test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('my-test.png');
});
```

### Updating Screenshots

When UI changes are intentional, update baseline screenshots:

```bash
npm run test:screenshots
```

## CI/CD Integration

### GitHub Actions Configuration

```yaml
- name: Run Playwright tests
  run: npm run test:integration

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: playwright-results
    path: test-results/
```

## Best Practices

1. **Use Data Test IDs:** Always prefer `data-testid` over CSS selectors
2. **Wait for States:** Use `waitForLoadState('networkidle')` for dynamic content
3. **Screenshot Key States:** Capture important UI states for debugging
4. **Filter Console Errors:** Ignore known issues (favicon, CSS imports)
5. **Test Responsiveness:** Include mobile/tablet viewport tests
6. **Accessibility Testing:** Verify ARIA attributes and semantic HTML

## Troubleshooting

### Common Issues

- **CSS Import Errors:** Filter out Skeleton UI import warnings
- **Timing Issues:** Add appropriate waits for dynamic content
- **Screenshot Differences:** Check for font rendering differences across platforms
- **Network Timeouts:** Increase timeout for slow CI environments
