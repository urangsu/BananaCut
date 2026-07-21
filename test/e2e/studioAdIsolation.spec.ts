import { test, expect } from '@playwright/test';

test.describe('BananaCut P0 E2E - Studio Ad Isolation Gate', () => {

  const studioRoutes = ['/remove', '/recover', '/asset', '/guide'];

  for (const route of studioRoutes) {
    test(`Verify complete ad isolation on ${route}`, async ({ page }) => {
      // 1. Set up a listener to detect any network request sent to Google AdSense / DoubleClick
      let adRequestDetected = false;
      let adRequestUrl = '';

      page.on('request', (request) => {
        const url = request.url();
        if (
          url.includes('googlesyndication.com') ||
          url.includes('googleads') ||
          url.includes('pagead') ||
          url.includes('doubleclick.net')
        ) {
          adRequestDetected = true;
          adRequestUrl = url;
        }
      });

      // 2. Navigate to the Studio route
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // 3. Confirm that no active ad-delivery/tracking request was made
      expect(adRequestDetected, `AdSense/Ad network request was detected on Studio route ${route}: ${adRequestUrl}`).toBe(false);

      // 4. Assert that google-adsense-account meta tag is exactly 1 (allowed and verified)
      const accountMeta = page.locator('meta[name="google-adsense-account"]');
      await expect(accountMeta).toHaveCount(1);
      await expect(accountMeta).toHaveAttribute('content', 'ca-pub-6406237368816995');

      // 5. Assert that no AdSense script is present on Studio routes
      const adsenseScripts = page.locator('script[src*="googlesyndication.com"], script[src*="adsbygoogle"]');
      await expect(adsenseScripts).toHaveCount(0);

      // 6. Assert that no active AdSlot components exist in the markup
      const adSlots = page.locator('.adsbygoogle, ins.adsbygoogle');
      await expect(adSlots).toHaveCount(0);

      // 7. Assert that no elements with data-ad-slot exist
      const adSlotAttrs = page.locator('[data-ad-slot]');
      await expect(adSlotAttrs).toHaveCount(0);
    });
  }
});
