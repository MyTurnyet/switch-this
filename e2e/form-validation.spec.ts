import { test, expect } from '@playwright/test';

test.describe('Form Validations', () => {
  test('should validate required fields when creating an industry', async ({ page }) => {
    // Navigate to industries page
    await page.goto('/industries');
    await page.waitForLoadState('networkidle');
    
    // Click add/create button
    const addButton = page.getByRole('button', { name: /add|create|new/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Wait for form dialog to open
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Try to submit without filling required fields
    const submitButton = page.getByRole('button', { name: /save|submit|create/i });
    await submitButton.click();
    
    // Check if validation errors are displayed
    await expect(page.getByText(/required|cannot be empty/i)).toBeVisible();
    
    // Fill in a required field
    await page.getByLabel(/name/i).fill('Test Industry');
    
    // Submit the form
    await submitButton.click();
    
    // Check if the form was submitted successfully
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Verify the industry was created
    await expect(page.getByText('Test Industry')).toBeVisible();
    
    // Clean up - delete the test industry
    const deleteButton = page.getByRole('button', { name: /delete|remove/i });
    await deleteButton.click();
    
    // Confirm deletion if a confirmation dialog appears
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible())
      await confirmButton.click();
  });

  test('should validate input formats for rolling stock creation', async ({ page }) => {
    // Navigate to rolling stock page
    await page.goto('/rolling-stock');
    await page.waitForLoadState('networkidle');
    
    // Click add/create button
    const addButton = page.getByRole('button', { name: /add|create|new/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Wait for form dialog to open
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Try entering invalid data (e.g., letters in number fields)
    // Adjust these selectors based on your actual form fields
    const numberField = page.getByLabel(/number|id/i);
    await numberField.fill('ABC'); // Non-numeric input for a number field
    
    // Try to submit the form
    const submitButton = page.getByRole('button', { name: /save|submit|create/i });
    await submitButton.click();
    
    // Check for validation error
    await expect(page.getByText(/invalid|must be a number/i)).toBeVisible();
    
    // Fix the input and fill in other required fields
    await numberField.fill('12345');
    
    // Fill in other required fields (adjust as needed)
    const typeField = page.getByLabel(/type/i);
    if (await typeField.isVisible())
      await typeField.selectOption({ label: 'Boxcar' });
    
    // Submit the form again
    await submitButton.click();
    
    // Check if the form was submitted successfully
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Verify the rolling stock was created
    await expect(page.getByText('12345')).toBeVisible();
    
    // Clean up - delete the test rolling stock
    const deleteButton = page.getByRole('button', { name: /delete|remove/i });
    await deleteButton.click();
    
    // Confirm deletion if a confirmation dialog appears
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible())
      await confirmButton.click();
  });

  test('should validate form interactions for train routes', async ({ page }) => {
    // Navigate to train routes page
    await page.goto('/train-routes');
    await page.waitForLoadState('networkidle');
    
    // Click add/create button
    const addButton = page.getByRole('button', { name: /add|create|new/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Wait for form dialog to open
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Test dynamic form behavior
    // For example, selecting an option might reveal additional fields
    // Adjust these selectors based on your actual form
    const typeSelect = page.getByLabel(/type|category/i);
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption({ label: 'Local' });
      
      // Check if additional fields appear based on selection
      await expect(page.getByLabel(/origin|destination|stops/i)).toBeVisible();
    }
    
    // Fill in form fields
    await page.getByLabel(/name/i).fill('Test Route');
    
    // Add additional details as needed
    const additionalFields = page.getByLabel(/origin|destination/i);
    if (await additionalFields.first().isVisible())
      await additionalFields.first().fill('Test Origin');
    
    if (await additionalFields.nth(1).isVisible())
      await additionalFields.nth(1).fill('Test Destination');
    
    // Submit the form
    const submitButton = page.getByRole('button', { name: /save|submit|create/i });
    await submitButton.click();
    
    // Check if the form was submitted successfully
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Verify the route was created
    await expect(page.getByText('Test Route')).toBeVisible();
    
    // Clean up - delete the test route
    const deleteButton = page.getByRole('button', { name: /delete|remove/i });
    await deleteButton.click();
    
    // Confirm deletion if a confirmation dialog appears
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible())
      await confirmButton.click();
  });
}); 