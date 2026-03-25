import { test, expect } from '@playwright/test';

test.describe('Text Selection & Annotation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/articles');

    await page.click('button:has-text("New Article")');
    await page.fill('#title', 'Test Article');
    await page.fill('#body', 'Hello World Test String For Selection');
    await page.click('button:has-text("Create")');

    await page.click('button:has-text("View")');
  });

  test('should create article and navigate to viewer', async ({ page }) => {
    const title = page.locator('h2');
    await expect(title).toContainText('Test Article');

    const textContainer = page.locator('.article-text');
    await expect(textContainer).toContainText('Hello World');
  });

  test('should open color picker when text is selected', async ({ page }) => {
    const textContainer = page.locator('.article-text');

    await textContainer.selectText();
    await textContainer.dispatchEvent('mouseup');

    const picker = page.locator('.color-picker');
    await expect(picker).toBeVisible();
  });

  test('should dismiss picker on cancel', async ({ page }) => {
    const textContainer = page.locator('.article-text');

    await textContainer.selectText();
    await textContainer.dispatchEvent('mouseup');

    const picker = page.locator('.color-picker');
    await expect(picker).toBeVisible();

    await page.click('button:has-text("Cancel")');
    await expect(picker).not.toBeVisible();
  });
});
