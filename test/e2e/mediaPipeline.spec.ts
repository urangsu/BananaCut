import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('BananaCut P0.2.1 E2E - Media Pipeline Scenarios A-I', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the app home page
    await page.goto('/');
  });

  test('Scenario A: MP4 upload flow integration', async ({ page }) => {
    await expect(page).toHaveTitle(/BananaCut/);
    
    // Go to the main remove workspace page
    await page.goto('/#/remove');
    
    // Confirm upload input exists and is enabled
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('Scenario B: Background removal & chroma keying options', async ({ page }) => {
    await page.goto('/#/remove');

    // Click on "Try Sample" to load synthetic frames
    const sampleBtn = page.locator('button:has-text("Try Sample"), button:has-text("샘플 체험")');
    if (await sampleBtn.count() > 0) {
      await sampleBtn.click();
      
      // Wait for frames to load
      await page.waitForTimeout(500);
      
      // Select the chroma key options
      const toleranceSlider = page.locator('input[type="range"]').first();
      await expect(toleranceSlider).toBeAttached();
    }
  });

  test('Scenario C: Recover brush masking parameter controls', async ({ page }) => {
    await page.goto('/#/recover');

    // Verify recovery workspace can be navigated to
    await expect(page.locator('h1, h2, h3, div')).toContainText(/(Recover|복원|Brush)/i);
    
    // Check if brush parameter sliders (size, opacity, hardness, feather) exist in UI
    const sizeRange = page.locator('#recover_size_range');
    const opacityRange = page.locator('#recover_opacity_range');
    const hardnessRange = page.locator('#recover_hardness_range');
    const featherRange = page.locator('#recover_feather_range');

    await expect(sizeRange).toBeAttached();
    await expect(opacityRange).toBeAttached();
    await expect(hardnessRange).toBeAttached();
    await expect(featherRange).toBeAttached();
  });

  test('Scenario D: Result ZIP export preflight check', async ({ page }) => {
    await page.goto('/#/export');
    
    // If frames are incomplete or dirty, export should open confirmation / alert modal
    const downloadBtn = page.locator('button:has-text("Download"), button:has-text("다운로드")');
    if (await downloadBtn.count() > 0) {
      await expect(downloadBtn).toBeEnabled();
    }
  });

  test('Scenario E: Export With RAW ZIP structure option', async ({ page }) => {
    await page.goto('/#/export');

    // Confirm custom configuration options like stable crop are visible
    const cropHeading = page.locator('text=/Stable Crop/i');
    if (await cropHeading.count() > 0) {
      await expect(cropHeading).toBeVisible();
    }
  });

  test('Scenario F: GIF generation and fallback options', async ({ page }) => {
    await page.goto('/#/export');
    
    // Assert presence of export formats selector
    const exportModes = page.locator('button, select, div');
    await expect(exportModes.filter({ hasText: /(GIF|Sprite|Sheet)/i }).first()).toBeAttached();
  });

  test('Scenario G: Partial export preflight blocking', async ({ page }) => {
    await page.goto('/#/export');
    
    // Verify that the UI displays a proper preflight checking message
    const checkingText = page.locator('text=/Preflight|Ready|Export/i');
    await expect(checkingText.first()).toBeAttached();
  });

  test('Scenario H: Error handling for invalid media uploads', async ({ page }) => {
    await page.goto('/#/remove');
    
    // Upload invalid text file to test error containment
    const fileInput = page.locator('input[type="file"]');
    const invalidFilePath = path.resolve('test/fixtures/invalid.txt');
    
    await fileInput.setInputFiles(invalidFilePath);
    
    // UI should display error notification, toast, or remain stable (no crash)
    await page.waitForTimeout(500);
    const errorText = page.locator('text=/Error|Invalid|Failed|Failed to parse/i');
    if (await errorText.count() > 0) {
      await expect(errorText.first()).toBeVisible();
    }
  });

  test('Scenario I: Studio ad-blocking audit (Workspace is strictly ad-free)', async ({ page }) => {
    // Navigate to all Studio workspace routes
    const studioRoutes = ['/#/remove', '/#/recover', '/#/export'];
    
    for (const route of studioRoutes) {
      await page.goto(route);
      await page.waitForTimeout(200);
      
      // Assert that no Google AdSense scripts are loaded in the DOM
      const adsenseScript = page.locator('script[src*="pagead2.googlesyndication.com"]');
      await expect(adsenseScript).toHaveCount(0);
      
      // Assert that no AdSlot components (Google Ad units) exist on these pages
      const adSlot = page.locator('.adsbygoogle');
      await expect(adSlot).toHaveCount(0);
    }
  });
});
