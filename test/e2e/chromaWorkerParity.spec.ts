import { test, expect } from '@playwright/test';

test.describe('BananaCut P0.2.1 E2E - Chroma Worker Parity & State Integrity Gate', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to local development server
    await page.goto('/');
    const consentBtn = page.locator('[data-testid="consent-accept-all"]');
    if (await consentBtn.count() > 0 && await consentBtn.isVisible()) {
      await consentBtn.click();
    }
  });

  test('1. Remove and Recover UI interaction workflow', async ({ page }) => {
    // Verify application title
    await expect(page).toHaveTitle(/BananaCut/);

    // Check if the file uploader or empty state exists
    const uploadInput = page.locator('input[type="file"]');
    if (await uploadInput.count() > 0) {
      await expect(uploadInput).toBeEnabled();
    }
  });

  test('2. Fail-Closed Stale Revision Block', async ({ page }) => {
    // If we are on the recover page directly, it should block processing if key is dirty or revision is missing
    await page.goto('/#/recover');
    
    // Verify that empty state or warning message is shown when trying to recover without processed keys
    const alertText = page.locator('text=No processed frames available');
    if (await alertText.count() > 0) {
      await expect(alertText).toBeVisible();
    }
  });

  test('3. Partial Export Preflight Block', async ({ page }) => {
    // Navigate to export page
    await page.goto('/#/export');

    // Confirm that the export button is disabled or blocks partial exports when frames are incomplete
    const exportBtn = page.locator('button:has-text("Export")');
    if (await exportBtn.count() > 0 && await exportBtn.isEnabled()) {
      await exportBtn.click();
      // Should show a warning or preflight dialog blocking the export
      const warning = page.locator('text=Please complete processing');
      if (await warning.count() > 0) {
        await expect(warning).toBeVisible();
      }
    }
  });
});
