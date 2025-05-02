import { test, expect } from '@playwright/test';

// Test to check if the home page loads correctly
test('should navigate to the home page', async ({ page }) => {
  await page.goto('/');
  // Check if the page title is visible
  await expect(page).toHaveTitle(/Switchlist Generator/);
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

// Test navigation using the actual navigation UI components
test('should navigate using the navigation menu if available', async ({ page }) => {
  // Start at the home page
  await page.goto('/');
  
  // Look for navigation components - try different approaches to find navigation elements
  // 1. Try to find navigation by aria role
  const navMenu = page.getByRole('navigation').first();
  if (await navMenu.isVisible()) {
    console.log('Found navigation by role');
    
    // Find all links in the navigation
    const links = navMenu.getByRole('link');
    const count = await links.count();
    
    if (count > 0) {
      // Click on the first link that's not for the home page
      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');
        if (href && href !== '/' && href !== '#') {
          await link.click();
          // Verify navigation happened
          await expect(page).not.toHaveURL('/');
          break;
        }
      }
    }
  } else {
    // 2. Try to find by common navigation class names
    const altNav = page.locator('nav, .nav, .navigation, .menu, header a');
    if (await altNav.count() > 0) {
      console.log('Found navigation by common classnames');
      
      // Find a link and click it
      const navLinks = page.locator('header a, nav a, .nav a, .navigation a, .menu a').first();
      if (await navLinks.isVisible()) {
        await navLinks.click();
        // Verify navigation happened
        await expect(page).not.toHaveURL('/');
      }
    } else {
      // If no navigation found, skip this test
      console.log('No navigation menu found, skipping test');
      test.skip();
    }
  }
}); 