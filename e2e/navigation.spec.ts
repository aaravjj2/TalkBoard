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

test.describe('Navigation — Desktop (sidebar always visible)', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('should navigate to settings page via header', async ({ page }) => {
    await page.getByTestId('settings-link').click();
    await expect(page.getByTestId('settings-page')).toBeVisible();
  });

  test('should navigate to history page via sidebar', async ({ page }) => {
    // Sidebar is always visible on desktop viewport
    await page.getByTestId('nav-history').click();
    await expect(page.getByTestId('history-page')).toBeVisible();
  });

  test('should navigate to quick phrases page via sidebar', async ({ page }) => {
    await page.getByTestId('nav-quick-phrases').click();
    await expect(page.getByTestId('quick-phrases-page')).toBeVisible();
  });

  test('should navigate to caregiver page via sidebar', async ({ page }) => {
    await page.getByTestId('nav-caregiver').click();
    await expect(page.getByTestId('caregiver-locked')).toBeVisible();
  });

  test('should navigate to help page via sidebar', async ({ page }) => {
    await page.getByTestId('nav-help').click();
    await expect(page.getByTestId('help-page')).toBeVisible();
  });

  test('should navigate to profile page via sidebar', async ({ page }) => {
    await page.getByTestId('nav-profile').click();
    await expect(page.getByTestId('profile-page').or(page.getByTestId('profile-empty'))).toBeVisible({ timeout: 10000 });
  });

  test('should navigate back to home via sidebar', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByTestId('settings-page')).toBeVisible();
    await page.getByTestId('nav-home').click();
    await expect(page.getByTestId('home-page')).toBeVisible();
  });
});

test.describe('Navigation — Mobile (sidebar toggle)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('should open sidebar with menu toggle', async ({ page }) => {
    await page.getByTestId('menu-toggle').click();
    await expect(page.getByTestId('sidebar')).toBeVisible();
  });

  test('should close sidebar with close button', async ({ page }) => {
    await page.getByTestId('menu-toggle').click();
    await expect(page.getByTestId('sidebar')).toBeVisible();
    await page.getByTestId('sidebar-close').click();
    await page.waitForTimeout(300);
  });

  test('should navigate via mobile sidebar', async ({ page }) => {
    await page.getByTestId('menu-toggle').click();
    await page.getByTestId('nav-history').click();
    await expect(page.getByTestId('history-page')).toBeVisible();
  });
});
