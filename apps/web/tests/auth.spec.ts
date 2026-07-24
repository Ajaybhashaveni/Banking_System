import { test, expect } from '@playwright/test';

test.describe('NextGen Banking Authentication Flows', () => {
  test('should display landing page and navigate to login', async ({ page }) => {
    await page.goto('/');
    
    // Check for landing page text
    await expect(page.locator('h1')).toContainText('NextGen Banking');
    
    // Click Sign In
    await page.click('text="Sign In"');
    
    // Verify we are on login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.locator('h2')).toContainText('Welcome Back');
  });

  test('should show validation errors on empty login submission', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Click Sign In without entering data
    await page.click('button[type="submit"]');
    
    // Check for validation messages
    await expect(page.locator('text=Invalid email address')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });
});
