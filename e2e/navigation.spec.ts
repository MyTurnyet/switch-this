import { test, expect } from '@playwright/test';

// Test to check if the home page loads correctly
test('should navigate to the home page', async ({ page }) => {
  await page.goto('/');
  // Check if the page title is visible
  await expect(page).toHaveTitle(/Switch This/);
});

// Test to check if the industries page loads correctly
test('should navigate to the industries page', async ({ page }) => {
  await page.goto('/industries');
  await expect(page).toHaveURL(/.*industries/);
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
});

// Test to check if the locations page loads correctly
test('should navigate to the locations page', async ({ page }) => {
  await page.goto('/locations');
  await expect(page).toHaveURL(/.*locations/);
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
});

// Test to check if the rolling-stock page loads correctly
test('should navigate to the rolling stock page', async ({ page }) => {
  await page.goto('/rolling-stock');
  await expect(page).toHaveURL(/.*rolling-stock/);
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
});

// Test to check if the train-routes page loads correctly
test('should navigate to the train routes page', async ({ page }) => {
  await page.goto('/train-routes');
  await expect(page).toHaveURL(/.*train-routes/);
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
});

// Test to check if the switchlists page loads correctly
test('should navigate to the switchlists page', async ({ page }) => {
  await page.goto('/switchlists');
  await expect(page).toHaveURL(/.*switchlists/);
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
});

// Test to check if the about page loads correctly
test('should navigate to the about page', async ({ page }) => {
  await page.goto('/about');
  await expect(page).toHaveURL(/.*about/);
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
});

// Test navigation between pages using the navigation menu
test('should navigate between pages using the navigation menu', async ({ page }) => {
  // Start at the home page
  await page.goto('/');
  
  // Find and click on navigation links
  // Note: You'll need to update these selectors based on your actual navigation component structure
  
  // Navigate to Industries
  await page.getByRole('link', { name: /industries/i }).click();
  await expect(page).toHaveURL(/.*industries/);
  
  // Navigate to Locations
  await page.getByRole('link', { name: /locations/i }).click();
  await expect(page).toHaveURL(/.*locations/);
  
  // Navigate to Rolling Stock
  await page.getByRole('link', { name: /rolling stock/i }).click();
  await expect(page).toHaveURL(/.*rolling-stock/);
  
  // Navigate to Train Routes
  await page.getByRole('link', { name: /train routes/i }).click();
  await expect(page).toHaveURL(/.*train-routes/);
  
  // Navigate to Switchlists
  await page.getByRole('link', { name: /switchlists/i }).click();
  await expect(page).toHaveURL(/.*switchlists/);
  
  // Navigate to About
  await page.getByRole('link', { name: /about/i }).click();
  await expect(page).toHaveURL(/.*about/);
  
  // Navigate back to Home
  await page.getByRole('link', { name: /home/i }).click();
  await expect(page).toHaveURL(/\//);
}); 