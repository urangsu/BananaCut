import { test, expect } from '@playwright/test';

test.describe('BananaCut P0 E2E - AdSense Connection & Slot Absence Gate', () => {

  const publicRoutes = ['/', '/guides', '/about', '/privacy', '/terms'];

  for (const route of publicRoutes) {
    test(`Verify AdSense meta tag and slot/script absence on ${route}`, async ({ page }) => {
      // 1. Navigate to the public route
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      // 2. Assert that google-adsense-account meta tag is exactly 1 and matches publisher ID
      const accountMeta = page.locator('meta[name="google-adsense-account"]');
      await expect(accountMeta).toHaveCount(1);
      await expect(accountMeta).toHaveAttribute('content', 'ca-pub-6406237368816995');

      // 3. Assert that AdSense scripts are 0
      const adsenseScripts = page.locator('script[src*="googlesyndication.com"], script[src*="adsbygoogle"]');
      await expect(adsenseScripts).toHaveCount(0);

      // 4. Assert that no active AdSlot components (ins.adsbygoogle or .adsbygoogle) are rendered
      const adSlots = page.locator('.adsbygoogle, ins.adsbygoogle');
      await expect(adSlots).toHaveCount(0);

      // 5. Assert that no elements with data-ad-slot exist
      const adSlotAttrs = page.locator('[data-ad-slot]');
      await expect(adSlotAttrs).toHaveCount(0);
    });
  }
});
