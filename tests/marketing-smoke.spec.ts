import { expect, test } from '@playwright/test';

const marketingPages = [
  {
    url: '/',
    title: /Know if you're the right fit, before you apply/i,
    heading: /Know if you're the right fit before you apply/i,
  },
  {
    url: '/features',
    title: /Features — Job Fit Analysis, Resume Tailoring & Application Tracking/i,
    heading: /A fit-first platform for smarter applications/i,
  },
  {
    url: '/pricing',
    title: /Pricing — Unlimited Job Fit Analyses at \$39\/mo/i,
    heading: /Simple, Transparent Pricing/i,
  },
  {
    url: '/compare',
    title: /WorthApply vs Jobscan vs Teal vs Rezi/i,
    heading: /How WorthApply compares/i,
  },
  {
    url: '/about',
    title: /About \| WorthApply/i,
    heading: /WorthApply exists to make job searching more strategic, less noisy, and more honest\./i,
  },
];

test.describe('marketing smoke', () => {
  for (const pageConfig of marketingPages) {
    test(`${pageConfig.url} loads with core content`, async ({ page }) => {
      await page.goto(pageConfig.url);

      await expect(page).toHaveTitle(pageConfig.title);
      await expect(page.getByRole('heading', { name: pageConfig.heading })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Sign in', exact: true }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Get started', exact: true }).first()).toBeVisible();
    });
  }

  test('homepage primary hero CTA points to signup', async ({ page }) => {
    await page.goto('/');

    const heroCta = page.locator('main').getByRole('link', { name: /Analyze Your Resume Free/i });
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
