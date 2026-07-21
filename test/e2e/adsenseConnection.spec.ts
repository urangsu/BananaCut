import { test, expect } from '@playwright/test';

test.describe('BananaCut P0 E2E - AdSense Connection & Slot Absence Gate', () => {

  const publicRoutes = ['/', '/guides', '/about', '/privacy', '/terms'];

  for (const route of publicRoutes) {
    test(`Verify AdSense static script presence and ad slot absence on ${route}`, async ({ page }) => {
      // 1. Navigate to the public route
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // 2. Assert that the static AdSense script is present in the DOM exactly 1 time (from index.html)
      const adsenseScripts = page.locator('script[src*="googlesyndication.com/pagead/js/adsbygoogle.js"]');
      await expect(adsenseScripts).toHaveCount(1);

      // 3. Confirm that the script includes the correct publisher client ID
      const scriptSrc = await adsenseScripts.getAttribute('src');
      expect(scriptSrc).toContain('client=ca-pub-6406237368816995');

      // 4. Assert that no active AdSlot components (ins.adsbygoogle or .adsbygoogle) are rendered on the page before approval
      const adSlots = page.locator('.adsbygoogle, ins.adsbygoogle');
      await expect(adSlots).toHaveCount(0);
    });
  }
});
