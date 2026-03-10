import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should show onboarding page on first visit', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('onboarding-page')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Welcome to TalkBoard')).toBeVisible();
  });

  test('should navigate through onboarding steps', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('onboarding-page')).toBeVisible({ timeout: 10000 });

    // Step 0: Welcome
    await expect(page.getByText('Welcome to TalkBoard')).toBeVisible();
    await page.getByTestId('onboarding-next-0').click();

    // Step 1: How it works
    await expect(page.getByText('How It Works')).toBeVisible();
    await expect(page.getByText('Select Symbols')).toBeVisible();
    await expect(page.getByText('AI Generates')).toBeVisible();
    await expect(page.getByText('Speak Aloud')).toBeVisible();
    await page.getByTestId('onboarding-next-1').click();

    // Step 2: Name entry
    await expect(page.getByText("What's your name?")).toBeVisible();
    await page.getByTestId('onboarding-name-input').fill('Test User');
    await page.getByTestId('onboarding-complete').click();

    // Should redirect to home page after onboarding
    await expect(page.getByTestId('home-page')).toBeVisible({ timeout: 10000 });
  });

  test('should complete onboarding with default name', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('onboarding-page')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('onboarding-next-0').click();
    await page.getByTestId('onboarding-next-1').click();
    // Don't fill name, just complete
    await page.getByTestId('onboarding-complete').click();
    await expect(page.getByTestId('home-page')).toBeVisible({ timeout: 10000 });
  });
});
