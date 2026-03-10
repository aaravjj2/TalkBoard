import { test, expect, type Page } from '@playwright/test';

// Helper to skip onboarding
async function completeOnboarding(page: Page) {
  await page.goto('/');
  const onboarding = page.getByTestId('onboarding-page');
  const isVisible = await onboarding.isVisible().catch(() => false);
  if (isVisible) {
    await page.getByTestId('onboarding-next-0').click();
    await page.getByTestId('onboarding-next-1').click();
    await page.getByTestId('onboarding-name-input').fill('E2E Tester');
    await page.getByTestId('onboarding-complete').click();
    await expect(page.getByTestId('home-page')).toBeVisible({ timeout: 5000 });
  }
}

test.describe('Home Page — Symbol Selection', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('should display category tabs', async ({ page }) => {
    await expect(page.getByTestId('category-tabs')).toBeVisible();
    // Check at least a few category tabs are visible
    await expect(page.getByTestId('category-tab-people')).toBeVisible();
    await expect(page.getByTestId('category-tab-actions')).toBeVisible();
    await expect(page.getByTestId('category-tab-food')).toBeVisible();
  });

  test('should display symbol grid with symbols', async ({ page }) => {
    await expect(page.getByTestId('symbol-grid')).toBeVisible();
    // People category should be active by default and show symbols
    const symbols = page.getByTestId('symbol-grid').locator('button');
    await expect(symbols.first()).toBeVisible();
    const count = await symbols.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should switch categories when tab is clicked', async ({ page }) => {
    // Click Actions tab
    await page.getByTestId('category-tab-actions').click();
    // Grid should show action symbols
    await expect(page.getByTestId('symbol-grid')).toBeVisible();
    const symbols = page.getByTestId('symbol-grid').locator('button');
    const count = await symbols.count();
    expect(count).toBeGreaterThan(0);

    // Click Food tab
    await page.getByTestId('category-tab-food').click();
    await expect(page.getByTestId('symbol-grid')).toBeVisible();
  });

  test('should add symbol to sentence bar when clicked', async ({ page }) => {
    // Click a symbol (first one in the grid)
    const firstSymbol = page.getByTestId('symbol-grid').locator('button').first();
    await firstSymbol.click();

    // Sentence bar should show selected symbol
    await expect(page.getByTestId('symbol-strip')).toBeVisible();
    const selectedSymbols = page.getByTestId('symbol-strip').locator('button');
    const count = await selectedSymbols.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show speak button after selecting symbols', async ({ page }) => {
    const firstSymbol = page.getByTestId('symbol-grid').locator('button').first();
    await firstSymbol.click();
    await expect(page.getByTestId('speak-btn')).toBeVisible();
  });

  test('should remove symbol from sentence bar when clicked', async ({ page }) => {
    // Add a symbol
    const firstSymbol = page.getByTestId('symbol-grid').locator('button').first();
    await firstSymbol.click();

    // Get selected symbols count
    const strip = page.getByTestId('symbol-strip');
    const before = await strip.locator('button').count();
    expect(before).toBe(1);

    // Click the selected symbol to remove it
    await strip.locator('button').first().click();

    // Should have no selected symbols (prompt text instead)
    await expect(strip.getByText('Tap symbols below')).toBeVisible({ timeout: 3000 });
  });

  test('should clear all symbols with clear button', async ({ page }) => {
    // Add multiple symbols
    const symbols = page.getByTestId('symbol-grid').locator('button');
    await symbols.nth(0).click();
    await symbols.nth(1).click();

    // Click clear button
    await page.getByTestId('clear-btn').click();

    // Sentence bar should be empty
    const strip = page.getByTestId('symbol-strip');
    await expect(strip.getByText('Tap symbols below')).toBeVisible({ timeout: 3000 });
  });

  test('should remove last symbol with backspace button', async ({ page }) => {
    const symbols = page.getByTestId('symbol-grid').locator('button');
    await symbols.nth(0).click();
    await symbols.nth(1).click();

    // 2 selected
    const strip = page.getByTestId('symbol-strip');
    expect(await strip.locator('button').count()).toBe(2);

    // Click backspace
    await page.getByTestId('backspace-btn').click();

    // 1 selected
    expect(await strip.locator('button').count()).toBe(1);
  });
});

test.describe('Home Page — Search', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('should show search bar', async ({ page }) => {
    await expect(page.getByTestId('search-bar')).toBeVisible();
  });

  test('should filter symbols by search query', async ({ page }) => {
    await page.getByTestId('search-input').fill('happy');
    // Should show search results (category tabs hidden)
    await expect(page.getByTestId('symbol-grid')).toBeVisible();
    const results = page.getByTestId('symbol-grid').locator('button');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should clear search with clear button', async ({ page }) => {
    await page.getByTestId('search-input').fill('happy');
    await page.getByTestId('search-clear').click();
    await expect(page.getByTestId('search-input')).toHaveValue('');
    // Category tabs should be visible again
    await expect(page.getByTestId('category-tabs')).toBeVisible();
  });

  test('should show empty state for no results', async ({ page }) => {
    await page.getByTestId('search-input').fill('xyznonexistent');
    await expect(page.getByTestId('symbol-grid-empty')).toBeVisible();
  });
});
