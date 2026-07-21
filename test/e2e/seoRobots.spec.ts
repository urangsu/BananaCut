import { test, expect } from '@playwright/test';

test.describe('BananaCut P0 E2E - SEO Robots & SPA Transition Gate', () => {

  const noindexRoutes = ['/remove', '/recover', '/asset', '/guide'];
  const indexRoutes = [
    '/',
    '/guides',
    '/guides/remove-background-from-video',
    '/examples',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ];

  // 1. Verify Studio/noindex routes
  for (const route of noindexRoutes) {
    test(`Verify robots noindex,follow on Studio route ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      const robotsMeta = page.locator('meta[name="robots"]');
      await expect(robotsMeta).toHaveCount(1);
      await expect(robotsMeta).toHaveAttribute('content', 'noindex,follow');
    });
  }

  // 2. Verify Public/index routes
  for (const route of indexRoutes) {
    test(`Verify robots index,follow on Public route ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      const robotsMeta = page.locator('meta[name="robots"]');
      await expect(robotsMeta).toHaveCount(1);
      await expect(robotsMeta).toHaveAttribute('content', 'index,follow');
    });
  }

  // 3. SPA transition test
  test('Verify dynamic robots meta tag transitions correctly on SPA navigation', async ({ page }) => {
    // A. Start on /remove
    await page.goto('/remove');
    await page.waitForLoadState('domcontentloaded');

    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveCount(1);
    await expect(robotsMeta).toHaveAttribute('content', 'noindex,follow');

    // Dismiss consent modal if present
    const acceptBtn = page.locator('[data-testid="consent-accept-all"]');
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
    }

    // B. Navigate SPA-style to /privacy (a public route with index,follow)
    // Click the privacy link which is directly visible in the sidebar/footer
    const privacyLink = page.locator('a[href="/privacy"]').first();
    await privacyLink.click();
    await page.waitForURL('**/privacy');

    // Confirm index,follow
    await expect(robotsMeta).toHaveAttribute('content', 'index,follow');

    // C. Navigate SPA-style back to /remove (a Studio route with noindex,follow)
    // Click the "Open Studio" button which is directly visible in the header
    const openStudioLink = page.locator('a[href="/remove"]').first();
    await openStudioLink.click();
    await page.waitForURL('**/remove');

    // Confirm noindex,follow
    await expect(robotsMeta).toHaveAttribute('content', 'noindex,follow');
  });
});
