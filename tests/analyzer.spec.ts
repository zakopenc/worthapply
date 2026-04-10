import { test, expect } from '@playwright/test';

test.describe('Analyzer Page Smoke Test', () => {
  test('should load the analyzer page correctly', async ({ page }) => {
    // Note: This requires bypassing or mocking auth in a real test scenario.
    // Assuming the page handles unauthenticated states by redirecting to login.
    await page.goto('/analyzer');
    
    // Check if the title is set or we got redirected
    const url = page.url();
    if (url.includes('/login')) {
      await expect(page.locator('text=Sign In')).toBeVisible();
    } else {
      await expect(page.locator('text=Analyze Job Fit')).toBeVisible();
    }
  });

  test('should load the underlying landing page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/WorthApply/);
    await expect(page.locator('text=Stop applying blindly')).toBeVisible();
  });
});
