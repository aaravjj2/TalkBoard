import { test, expect, type Page } from '@playwright/test';

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

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await page.getByTestId('settings-link').click();
    await expect(page.getByTestId('settings-page')).toBeVisible();
  });

  test('should display all settings sections', async ({ page }) => {
    await expect(page.getByTestId('section-appearance')).toBeVisible();
    await expect(page.getByTestId('section-voice-&-speech')).toBeVisible();
    await expect(page.getByTestId('section-behavior')).toBeVisible();
    await expect(page.getByTestId('section-caregiver')).toBeVisible();
    await expect(page.getByTestId('section-data-management')).toBeVisible();
  });

  test('should toggle dark mode', async ({ page }) => {
    const toggle = page.getByTestId('toggle-dark-mode');
    await toggle.click();
    // Check that the html element has dark class
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(hasDark).toBe(true);

    // Toggle back
    await toggle.click();
    const hasDarkAfter = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(hasDarkAfter).toBe(false);
  });

  test('should change font size', async ({ page }) => {
    const select = page.getByTestId('select-font-size');
    await select.selectOption('large');
    const hasLargeClass = await page.evaluate(() =>
      document.documentElement.classList.contains('text-lg')
    );
    expect(hasLargeClass).toBe(true);
  });

  test('should change grid size', async ({ page }) => {
    const select = page.getByTestId('select-grid-size');
    await select.selectOption('large');
    // Navigate to home and verify
    await page.goto('/');
    await expect(page.getByTestId('symbol-grid')).toBeVisible();
  });

  test('should toggle high contrast', async ({ page }) => {
    const toggle = page.getByTestId('toggle-high-contrast');
    await toggle.click();
    const hasHC = await page.evaluate(() =>
      document.documentElement.classList.contains('high-contrast')
    );
    expect(hasHC).toBe(true);
  });

  test('should show reset confirmation modal', async ({ page }) => {
    await page.getByTestId('btn-reset').click();
    await expect(page.getByTestId('modal')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reset Settings' })).toBeVisible();
    await page.getByTestId('modal-cancel').click();
    await expect(page.getByTestId('modal')).not.toBeVisible();
  });

  test('should show clear data confirmation modal', async ({ page }) => {
    await page.getByTestId('btn-clear-data').click();
    await expect(page.getByTestId('modal')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Clear All Data' })).toBeVisible();
    await page.getByTestId('modal-cancel').click();
  });
});
