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

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    // Navigate client-side (sidebar visible on desktop)
    await page.getByTestId('nav-profile').click();
    await expect(page.getByTestId('profile-page')).toBeVisible({ timeout: 10000 });
  });

  test('should display user profile', async ({ page }) => {
    await expect(page.getByTestId('profile-page')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('E2E Tester')).toBeVisible();
  });

  test('should enter edit mode', async ({ page }) => {
    await expect(page.getByTestId('profile-page')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('edit-profile-btn').click();
    await expect(page.getByTestId('edit-name-input')).toBeVisible();
  });

  test('should update profile name', async ({ page }) => {
    await page.getByTestId('edit-profile-btn').click();
    await page.getByTestId('edit-name-input').clear();
    await page.getByTestId('edit-name-input').fill('New Name');
    await page.getByTestId('save-profile').click();
    await expect(page.getByText('New Name')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('History Page', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('should show empty state when no history', async ({ page }) => {
    await page.goto('/history');
    await expect(page.getByText('No History Yet')).toBeVisible();
  });
});

test.describe('Quick Phrases Page', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('should show empty state when no phrases', async ({ page }) => {
    await page.goto('/quick-phrases');
    await expect(page.getByText('No Quick Phrases')).toBeVisible();
  });
});

test.describe('Help Page', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('should display help sections', async ({ page }) => {
    await page.goto('/help');
    await expect(page.getByTestId('help-page')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'What is TalkBoard?' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'How to Use' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Accessibility' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Keyboard Shortcuts' })).toBeVisible();
  });
});
