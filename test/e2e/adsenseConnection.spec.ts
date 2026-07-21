import { test, expect } from '@playwright/test';

test.describe('BananaCut P0 E2E - AdSense Connection & Slot Absence Gate', () => {

  const publicRoutes = ['/', '/guides', '/about', '/privacy', '/terms'];

  for (const route of publicRoutes) {
    test(`Verify AdSense static script presence and ad slot absence on ${route}`, async ({ page }) => {
      // 1. Setup route interception to mock adsbygoogle.js and block actual ad-delivery / auto-ad configs
      await page.route('**/*', (route) => {
        const url = route.request().url();
        if (url.includes('adsbygoogle.js')) {
          // Fulfill with a simple mock that satisfies the script injection check but doesn't run dynamic ad insertion code
          route.fulfill({
            contentType: 'application/javascript',
            body: 'window.adsbygoogle = window.adsbygoogle || [];'
          });
        } else if (
          url.includes('googlesyndication.com') ||
          url.includes('googleads') ||
          url.includes('pagead') ||
          url.includes('doubleclick.net')
        ) {
          route.abort();
        } else {
          route.continue();
        }
      });

      // 2. Navigate to the public route
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // 3. Assert that the static AdSense script is present in the DOM exactly 1 time (from index.html)
      const adsenseScripts = page.locator('script[src*="googlesyndication.com/pagead/js/adsbygoogle.js"]');
      await expect(adsenseScripts).toHaveCount(1);

      // 4. Confirm that the script includes the correct publisher client ID
      const scriptSrc = await adsenseScripts.getAttribute('src');
      expect(scriptSrc).toContain('client=ca-pub-6406237368816995');

      // 5. Assert that no active AdSlot components (ins.adsbygoogle or .adsbygoogle) are rendered on the page before approval
      const adSlots = page.locator('.adsbygoogle, ins.adsbygoogle');
      await expect(adSlots).toHaveCount(0);
    });
  }
});
