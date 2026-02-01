
import { test, expect } from '@playwright/test';

test('Verify export functionality with real chart', async ({ page }) => {
  // Go to the app
  await page.goto('http://localhost:3000');

  // Wait for loading to finish and report to be generated
  console.log('Waiting for report to be generated...');
  await page.waitForSelector('text=Hệ thống Phân tích Vàng Thông minh', { timeout: 10000 });

  // Wait a bit more for all data to settle
  await page.waitForTimeout(5000);

  // Take a screenshot of the main UI
  await page.screenshot({ path: 'verification/main_ui_v6.png', fullPage: true });

  // Trigger export
  console.log('Triggering snapshot...');
  await page.click('button:has-text("Chụp ảnh")');

  // The export container should be created
  console.log('Checking for export container...');
  const containerExists = await page.evaluate(() => {
    return !!document.getElementById('export-container');
  });
  console.log('Export container exists:', containerExists);

  // Wait for the chart to be rendered inside the container
  await page.waitForTimeout(2000);

  // Check if the canvas is rendered
  const canvasCount = await page.evaluate(() => {
    const container = document.getElementById('export-container');
    if (!container) return -1;
    return container.querySelectorAll('canvas').length;
  });
  console.log('Number of canvases found in export container:', canvasCount);

  // Capture the export container (debugging)
  if (containerExists) {
    await page.evaluate(() => {
      const container = document.getElementById('export-container');
      if (container) {
        container.style.left = '0';
        container.style.zIndex = '9999';
      }
    });
    await page.screenshot({ path: 'verification/export_debug_v6.png', fullPage: true });
  }

  expect(canvasCount).toBeGreaterThan(0);
});
