import { test, expect } from '@playwright/test';

test.describe('Switchlists Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the switchlists page before each test
    await page.goto('/switchlists');
    await page.waitForLoadState('networkidle');
  });

  test('should display switchlists page correctly', async ({ page }) => {
    // Check if the page has the expected title or heading
    await expect(page.getByRole('heading', { name: /switchlists/i, level: 1 })).toBeVisible();
    
    // Check if the list of switchlists is present
    await expect(page.locator('ul, table')).toBeVisible();
  });

  test('should be able to create a new switchlist', async ({ page }) => {
    // Find and click the add/create button
    const addButton = page.getByRole('button', { name: /add|create|new/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Wait for the form to appear
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Fill in the switchlist details
    // These form field selectors will need to be adjusted based on your actual form implementation
    await page.getByLabel(/name/i).fill('Test Switchlist');
    
    // There might be other required fields like date, train route, etc.
    // Select a train route if required
    const routeSelect = page.getByLabel(/route|train route/i);
    if (await routeSelect.isVisible()) {
      await routeSelect.click();
      await page.getByRole('option').first().click();
    }
    
    // Submit the form
    await page.getByRole('button', { name: /save|submit|create/i }).click();
    
    // Wait for the form to close
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Verify the new switchlist appears in the list
    await expect(page.getByText('Test Switchlist')).toBeVisible();
  });

  test('should be able to view switchlist details', async ({ page }) => {
    // Find and click on a switchlist
    const switchlistItem = page.getByText(/Test Switchlist|[A-Za-z]+ Switchlist/);
    await expect(switchlistItem).toBeVisible();
    await switchlistItem.click();
    
    // Check if we navigate to the detail page or a detail panel opens
    // This might navigate to a different URL like /switchlists/[id]
    await expect(page).toHaveURL(/\/switchlists\/.*$/);
    
    // Check if the details are visible
    await expect(page.getByText(/details|information|operations/i)).toBeVisible();
  });

  test('should be able to access switchlist operations', async ({ page }) => {
    // Find and click on a switchlist
    const switchlistItem = page.getByText(/Test Switchlist|[A-Za-z]+ Switchlist/);
    await expect(switchlistItem).toBeVisible();
    await switchlistItem.click();
    
    // Wait for navigation to the detail page
    await expect(page).toHaveURL(/\/switchlists\/.*$/);
    
    // Look for and click on operations tab/button
    const operationsButton = page.getByRole('link', { name: /operations/i });
    if (await operationsButton.isVisible()) {
      await operationsButton.click();
      
      // Check if we navigate to the operations page
      await expect(page).toHaveURL(/\/switchlists\/.*\/operations/);
      
      // Verify operations interface is visible
      await expect(page.getByText(/operations|moves|cars|engines/i)).toBeVisible();
    }
  });

  test('should be able to print a switchlist', async ({ page }) => {
    // Find and click on a switchlist
    const switchlistItem = page.getByText(/Test Switchlist|[A-Za-z]+ Switchlist/);
    await expect(switchlistItem).toBeVisible();
    await switchlistItem.click();
    
    // Wait for navigation to the detail page
    await expect(page).toHaveURL(/\/switchlists\/.*$/);
    
    // Look for and click on print button/link
    const printButton = page.getByRole('link', { name: /print/i });
    if (await printButton.isVisible()) {
      // This might open a new tab or navigate to a print-friendly page
      const printPromise = page.waitForEvent('popup');
      await printButton.click();
      const printPage = await printPromise;
      
      // Check the print page
      await printPage.waitForLoadState('networkidle');
      await expect(printPage).toHaveURL(/\/switchlists\/.*\/print/);
      
      // Verify print view is visible
      await expect(printPage.getByText(/switchlist|print|operations/i)).toBeVisible();
    }
  });

  test('should be able to delete a switchlist', async ({ page }) => {
    // Find the test switchlist
    const testSwitchlist = page.getByText('Test Switchlist');
    await expect(testSwitchlist).toBeVisible();
    
    // Find and click the delete button
    // This might require first selecting the switchlist
    const deleteButton = page.getByRole('button', { name: /delete|remove/i });
    await deleteButton.click();
    
    // There might be a confirmation dialog
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible())
      await confirmButton.click();
    
    // Verify the switchlist is removed
    await expect(testSwitchlist).not.toBeVisible();
  });
}); 