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

      // 3. Confirm that no ad request was made
      expect(adRequestDetected, `AdSense/Ad network request was detected on Studio route ${route}: ${adRequestUrl}`).toBe(false);

      // 4. Assert that no script elements with AdSense sources are injected into the DOM
      const adsenseScripts = page.locator('script[src*="googlesyndication.com"], script[src*="googleads"], script[src*="pagead"]');
      await expect(adsenseScripts).toHaveCount(0);

      // 5. Assert that no AdSlot components (e.g., .adsbygoogle) exist in the markup
      const adSlots = page.locator('.adsbygoogle, ins.adsbygoogle');
      await expect(adSlots).toHaveCount(0);
    });
  }
});
