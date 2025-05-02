import { test, expect } from '@playwright/test';

test.describe('Industries Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the industries page before each test
    await page.goto('/industries');
    await page.waitForLoadState('networkidle');
  });

  test('should display industries page correctly', async ({ page }) => {
    // Check if the page has the expected title or heading
    await expect(page.getByRole('heading', { name: /industries/i, level: 1 })).toBeVisible();
    
    // Check if the list of industries is present
    // You may need to adjust the selector based on your actual implementation
    await expect(page.locator('ul, table')).toBeVisible();
  });

  test('should be able to add a new industry', async ({ page }) => {
    // Look for an "Add" or "Create" button
    const addButton = page.getByRole('button', { name: /add|create|new/i });
    await expect(addButton).toBeVisible();
    
    // Click the add button
    await addButton.click();
    
    // Wait for the form to appear
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Fill in the industry details
    // These form field selectors will need to be adjusted based on your actual form implementation
    await page.getByLabel(/name/i).fill('Test Industry');
    await page.getByLabel(/description/i).fill('This is a test industry created by Playwright');
    
    // Submit the form
    await page.getByRole('button', { name: /save|submit|create/i }).click();
    
    // Wait for the form to close and the page to update
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Verify the new industry appears in the list
    // This will depend on how your list is structured
    await expect(page.getByText('Test Industry')).toBeVisible();
  });

  test('should be able to view industry details', async ({ page }) => {
    // Locate and click on an industry in the list
    // You may need to adjust this selector based on your actual implementation
    const industryItem = page.getByText(/[A-Za-z]+ Industry/);
    await expect(industryItem).toBeVisible();
    await industryItem.click();
    
    // Check if we're on the detail page or if a detail panel is visible
    // Adjust based on whether clicking an industry navigates to a new page or shows details in-page
    await expect(page.getByText(/details|information|description/i)).toBeVisible();
  });

  test('should be able to edit an industry', async ({ page }) => {
    // Locate an industry and find its edit button
    // You may need to adjust these selectors based on your actual implementation
    const industryItem = page.getByText(/[A-Za-z]+ Industry/);
    await expect(industryItem).toBeVisible();
    
    // Find the edit button for this industry
    // It might be directly on the list item or you might need to click the item first
    const editButton = page.getByRole('button', { name: /edit/i });
    await editButton.click();
    
    // Wait for the edit form to appear
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Update some field
    const descriptionField = page.getByLabel(/description/i);
    await descriptionField.clear();
    await descriptionField.fill('Updated description via Playwright test');
    
    // Save the changes
    await page.getByRole('button', { name: /save|update/i }).click();
    
    // Wait for the form to close
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Verify the changes are visible
    await expect(page.getByText('Updated description via Playwright test')).toBeVisible();
  });

  test('should be able to delete an industry', async ({ page }) => {
    // Find the industry we created in the previous test
    const testIndustry = page.getByText('Test Industry');
    await expect(testIndustry).toBeVisible();
    
    // Find and click the delete button for this industry
    // This might require first clicking the industry or finding a nearby delete button
    // You may need to adjust these selectors based on your actual implementation
    const deleteButton = page.getByRole('button', { name: /delete|remove/i });
    await deleteButton.click();
    
    // There might be a confirmation dialog
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible())
      await confirmButton.click();
    
    // Verify the industry is no longer visible
    await expect(testIndustry).not.toBeVisible();
  });
}); 