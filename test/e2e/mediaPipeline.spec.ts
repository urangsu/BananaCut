import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('BananaCut P0 E2E - Media Pipeline Gate', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const consentBtn = page.locator('[data-testid="consent-accept-all"]');
    if (await consentBtn.count() > 0 && await consentBtn.isVisible()) {
      await consentBtn.click();
    }
  });

  test('Scenario A & B: MP4 upload, frame extraction, chromakey, and process-all flow', async ({ page }) => {
    // Increase test timeout to 2 minutes for heavy video processing
    test.setTimeout(120000);

    // Navigate to clean route
    await page.goto('/remove');
    await expect(page).toHaveTitle(/BananaCut/);

    // Locate the file input using data-testid
    const fileInput = page.locator('[data-testid="remove-file-input"]').first();
    await expect(fileInput).toBeAttached();

    // Resolve the synthetic MP4 path
    const mp4Path = path.resolve('test/fixtures/green-screen-2s.mp4');

    // Upload the file
    await fileInput.setInputFiles(mp4Path);

    // Wait for the import plan/warning modal to appear and accept it
    const importModal = page.locator('[data-testid="import-plan-modal"]');
    await expect(importModal).toBeVisible({ timeout: 10000 });
    const confirmBtn = page.locator('[data-testid="import-plan-confirm"]');
    await confirmBtn.click();

    // Assert extraction progress is displayed
    const progressText = page.locator('[data-testid="extraction-progress"]');
    await expect(progressText.first()).toBeAttached();

    // Wait for frames ready status (up to 30 seconds for FFmpeg WASM startup and decoding)
    const completeText = page.locator('[data-testid="extraction-complete"]');
    await expect(completeText.first()).toBeVisible({ timeout: 45000 });

    // Verify frames are loaded and frame-count shows 24 frames
    const frameCount = page.locator('[data-testid="frame-count"]');
    await expect(frameCount).toContainText('24');

    // Select settings and process all frames using process-key-button
    const processBtn = page.locator('[data-testid="process-key-button"]');
    await expect(processBtn).toBeEnabled();
    await processBtn.click();

    // Verify batch processing finishes and displays process-complete
    const processComplete = page.locator('[data-testid="process-complete"]');
    await expect(processComplete).toBeAttached({ timeout: 60000 });

    // Open Download format selection modal
    const downloadOpenBtn = page.locator('[data-testid="download-modal-open"]');
    await expect(downloadOpenBtn).toBeEnabled();
    await downloadOpenBtn.click();

    // Verify modal options are shown
    const zipDownloadBtn = page.locator('[data-testid="export-zip"]');
    await expect(zipDownloadBtn).toBeVisible();

    const gifDownloadBtn = page.locator('[data-testid="export-gif"]');
    await expect(gifDownloadBtn).toBeVisible();
  });

  test('Scenario C: Recover brush masking parameter controls', async ({ page }) => {
    // Navigate to clean recover route
    await page.goto('/recover');

    // Check if recovery workspace canvas and controls are displayed
    const canvas = page.locator('[data-testid="recover-canvas"]');
    await expect(canvas).toBeAttached();

    // Check if brush parameter sliders (size, opacity, hardness, feather) exist
    const sizeRange = page.locator('[data-testid="recover-brush-size"]');
    const opacityRange = page.locator('[data-testid="recover-brush-opacity"]');
    const hardnessRange = page.locator('[data-testid="recover-brush-hardness"]');
    const featherRange = page.locator('[data-testid="recover-brush-feather"]');

    await expect(sizeRange).toBeAttached();
    await expect(opacityRange).toBeAttached();
    await expect(hardnessRange).toBeAttached();
    await expect(featherRange).toBeAttached();

    // Test slider value modifications
    await sizeRange.fill('55');
    await expect(sizeRange).toHaveValue('55');

    await opacityRange.fill('85');
    await expect(opacityRange).toHaveValue('85');

    // Check export zip button
    const exportBtn = page.locator('[data-testid="recover-export-zip-btn"]');
    await expect(exportBtn).toBeAttached();
  });

  test('Scenario H: Error handling for invalid media uploads', async ({ page }) => {
    await page.goto('/remove');

    const fileInput = page.locator('[data-testid="remove-file-input"]').first();
    const invalidFilePath = path.resolve('test/fixtures/invalid.txt');

    await fileInput.setInputFiles(invalidFilePath);

    // Verify that the UI displays the invalid format modal
    const importModal = page.locator('[data-testid="import-plan-modal"]');
    await expect(importModal).toBeVisible();
    await expect(importModal).toContainText(/(MP4|MOV|PNG|upload|업로드)/i);

    // Verify can dismiss the warning modal
    const confirmBtn = page.locator('[data-testid="import-plan-confirm"]');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
    await expect(importModal).toBeHidden();
  });

});
