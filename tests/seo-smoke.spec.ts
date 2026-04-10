import { expect, test } from '@playwright/test';

test.describe('seo and structured data smoke', () => {
  test('homepage has canonical, meta description, and structured data', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://worthapply.com');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /analyze job fit, tailor every application, and keep your search organized/i,
    );

    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScripts).toHaveCount(2);
  });

  test('pricing page exposes a crawlable heading and title', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page).toHaveTitle(/Pricing/i);
    await expect(page.getByRole('heading', { name: /start free\. upgrade when better application decisions matter\./i })).toBeVisible();
  });

  test('robots and sitemap endpoints respond', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toMatch(/User-agent:/i);

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toMatch(/<urlset|<sitemapindex/i);
  });
});
