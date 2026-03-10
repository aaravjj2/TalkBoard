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

test.describe('Caregiver Mode', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await page.goto('/caregiver');
    await expect(page.getByTestId('caregiver-locked')).toBeVisible({ timeout: 5000 });
  });

  test('should show locked state initially', async ({ page }) => {
    await expect(page.getByTestId('caregiver-locked')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Caregiver Mode' })).toBeVisible();
  });

  test('should enter caregiver mode without PIN', async ({ page }) => {
    await page.getByTestId('btn-enter-caregiver').click();
    await expect(page.getByTestId('caregiver-dashboard')).toBeVisible();
    await expect(page.getByText('Caregiver Dashboard')).toBeVisible();
  });

  test('should exit caregiver mode', async ({ page }) => {
    await page.getByTestId('btn-enter-caregiver').click();
    await expect(page.getByTestId('caregiver-dashboard')).toBeVisible();
    await page.getByTestId('btn-exit-caregiver').click();
    await expect(page.getByTestId('caregiver-locked')).toBeVisible();
  });

  test('should show caregiver stats', async ({ page }) => {
    await page.getByTestId('btn-enter-caregiver').click();
    await expect(page.getByText('Usage Overview')).toBeVisible();
    await expect(page.getByText('Sentences Spoken')).toBeVisible();
    await expect(page.getByText('Symbols Used')).toBeVisible();
  });
});

test.describe('Caregiver Mode with PIN', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    // Set a PIN first
    await page.goto('/settings');
    await page.getByTestId('input-caregiver-pin').fill('1234');
    // Navigate to caregiver
    await page.goto('/caregiver');
    await expect(page.getByTestId('caregiver-locked')).toBeVisible({ timeout: 5000 });
  });

  test('should show PIN entry when PIN is set', async ({ page }) => {
    await page.getByTestId('btn-enter-caregiver').click();
    await expect(page.getByTestId('caregiver-pin-entry')).toBeVisible();
  });

  test('should unlock with correct PIN', async ({ page }) => {
    await page.getByTestId('btn-enter-caregiver').click();
    await page.getByTestId('pin-input').fill('1234');
    await page.getByTestId('pin-submit').click();
    await expect(page.getByTestId('caregiver-dashboard')).toBeVisible();
  });

  test('should reject incorrect PIN', async ({ page }) => {
    await page.getByTestId('btn-enter-caregiver').click();
    await page.getByTestId('pin-input').fill('9999');
    await page.getByTestId('pin-submit').click();
    // Should still be on PIN entry (with error toast)
    await expect(page.getByTestId('caregiver-pin-entry')).toBeVisible();
    await expect(page.getByTestId('toast-error')).toBeVisible();
  });

  test('should cancel PIN entry', async ({ page }) => {
    await page.getByTestId('btn-enter-caregiver').click();
    await page.getByTestId('pin-cancel').click();
    await expect(page.getByTestId('caregiver-locked')).toBeVisible();
  });
});
