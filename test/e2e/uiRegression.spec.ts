import { test, expect } from '@playwright/test';

test.describe('BananaCut UI Regression Gate', () => {
  test('landing renders exactly one page shell', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('landing-header')).toHaveCount(1);
    await expect(page.getByTestId('landing-main')).toHaveCount(1);
    await expect(page.getByTestId('landing-footer')).toHaveCount(1);

    await expect(page.getByTestId('content-header')).toHaveCount(0);
    await expect(page.getByTestId('content-main')).toHaveCount(0);
    await expect(page.getByTestId('content-footer')).toHaveCount(0);

    await expect(page.locator('[data-layout="landing"]')).toHaveCount(2);
    await expect(page.locator('[data-layout="content"]')).toHaveCount(0);

    await expect(page.locator('header:visible')).toHaveCount(1);
    await expect(page.locator('footer:visible')).toHaveCount(1);
  });

  test('landing hero starts immediately below its own header', async ({ page }) => {
    await page.goto('/');

    const header = page.getByTestId('landing-header');
    const hero = page.locator('h1');

    const headerBox = await header.boundingBox();
    const heroBox = await hero.boundingBox();

    expect(headerBox).not.toBeNull();
    expect(heroBox).not.toBeNull();

    expect(heroBox!.y).toBeGreaterThanOrEqual(
      headerBox!.y + headerBox!.height
    );

    // Ensure space between header and hero heading is not overly bloated
    expect(
      heroBox!.y - (headerBox!.y + headerBox!.height)
    ).toBeLessThan(220);
  });
});
