import { expect, test } from '@playwright/test';

test.describe('auth smoke', () => {
  test('login page renders the core sign-in flow', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/WorthApply — Account/i);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
  });

  test('signup page renders the core registration flow', async ({ page }) => {
    await page.goto('/signup');

    await expect(page).toHaveTitle(/WorthApply — Account/i);
    await expect(page.getByRole('heading', { name: /start free with worthapply/i })).toBeVisible();
    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
  });

  test('signup form enforces minimum password length in browser', async ({ page }) => {
    await page.goto('/signup');

    await page.getByLabel('Full name').fill('QA Test User');
    await page.getByLabel('Email').fill('qatesty@example.com');
    await page.getByLabel('Password').fill('short');

    await page.getByRole('button', { name: /create account/i }).click();

    const message = await page.getByLabel('Password').evaluate((input) => (input as HTMLInputElement).validationMessage);
    expect(message.toLowerCase()).toContain('8');
  });
});
