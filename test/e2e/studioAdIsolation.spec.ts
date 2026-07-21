import { test, expect } from '@playwright/test';

test.describe('BananaCut P0 E2E - Studio Ad Isolation Gate', () => {

  const studioRoutes = ['/remove', '/recover', '/asset'];

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

      // 4. Assert that no AdSense script is present on Studio routes
      const adsenseScripts = page.locator('script[src*="googlesyndication.com/pagead/js/adsbygoogle.js"]');
      await expect(adsenseScripts).toHaveCount(0);

      // 5. Assert that no active AdSlot components exist in the markup
      const adSlots = page.locator('.adsbygoogle, ins.adsbygoogle');
      await expect(adSlots).toHaveCount(0);
    });
  }
});
