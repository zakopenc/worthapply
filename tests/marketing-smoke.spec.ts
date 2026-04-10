import { expect, test } from '@playwright/test';

const marketingPages = [
  {
    url: '/',
    title: /WorthApply|AI job application copilot/i,
    heading: 'Stop guessing which jobs are worth applying to.',
  },
  {
    url: '/features',
    title: /Features/i,
    heading: /Decide, tailor, and track applications/i,
  },
  {
    url: '/pricing',
    title: /Pricing/i,
    heading: /Start free\. Upgrade when better application decisions matter\./i,
  },
  {
    url: '/compare',
    title: /Compare/i,
    heading: /See how WorthApply compares with Jobscan, Teal, and Rezi\./i,
  },
  {
    url: '/about',
    title: /About/i,
    heading: /WorthApply exists to make job searching more strategic, less noisy, and more honest\./i,
  },
];

test.describe('marketing smoke', () => {
  for (const pageConfig of marketingPages) {
    test(`${pageConfig.url} loads with core content`, async ({ page }) => {
      await page.goto(pageConfig.url);

      await expect(page).toHaveTitle(pageConfig.title);
      await expect(page.getByRole('heading', { name: pageConfig.heading })).toBeVisible();
      await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();
    });
  }

  test('homepage primary hero CTA points to signup', async ({ page }) => {
    await page.goto('/');

    const heroCta = page.getByRole('link', { name: /analyze a job free/i }).first();
    await expect(heroCta).toBeVisible();
    await expect(heroCta).toHaveAttribute('href', '/signup');
  });

  test('mobile nav opens and exposes key routes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.getByRole('button', { name: /open menu/i }).click();

    const mobilePanel = page.locator('[class*="mobilePanelOpen"]');
    await expect(mobilePanel).toBeVisible();
    await expect(mobilePanel.getByRole('link', { name: 'Features' })).toBeVisible();
    await expect(mobilePanel.getByRole('link', { name: 'Pricing' })).toBeVisible();
    await expect(mobilePanel.getByRole('link', { name: 'Compare' })).toBeVisible();
    await expect(mobilePanel.getByRole('link', { name: 'About' })).toBeVisible();
  });
});
