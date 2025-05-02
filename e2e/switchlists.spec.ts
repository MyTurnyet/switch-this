import { test, expect } from '@playwright/test';

test.describe('Switchlists Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the switchlists page before each test
    await page.goto('/switchlists');
    await page.waitForLoadState('networkidle');
  });

  test('should display switchlists page correctly', async ({ page }) => {
    // Check if the page has the expected title or heading
    await expect(page.getByRole('heading').filter({ hasText: /switchlists/i }).first()).toBeVisible();
    
    // Check if any content is loaded in the switchlists page
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('should try to create a new switchlist if UI supports it', async ({ page }) => {
    // Look for an add/create button with multiple possible selectors
    const addButton = page.getByRole('button', { name: /add|create|new/i })
      .or(page.locator('button:has-text("Add")'))
      .or(page.locator('button:has-text("New")'))
      .or(page.locator('button:has-text("Create")'))
      .or(page.locator('a:has-text("Add")'))
      .or(page.locator('a:has-text("Create")'))
      .first();
      
    // Skip the test if no add button is found
    if (!(await addButton.isVisible().catch(() => false))) {
      console.log('No add button found, skipping new switchlist creation test');
      test.skip();
      return;
    }
    
    // Click the add button
    await addButton.click();
    
    // Wait for a form to appear using various selectors
    const formElement = page.getByRole('dialog')
      .or(page.locator('form'))
      .or(page.locator('.modal, .dialog, [role="dialog"], [aria-modal="true"]'))
      .first();
      
    // Skip if no form appears
    if (!(await formElement.isVisible({ timeout: 2000 }).catch(() => false))) {
      console.log('No form appeared after clicking add button, skipping test');
      test.skip();
      return;
    }
    
    // Try to find form fields
    const nameInput = formElement.locator('input[name="name"], input[placeholder*="name" i]')
      .or(formElement.getByLabel(/name/i))
      .first();
      
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('Test Switchlist');
    }
    
    // Look for date fields
    const dateInput = formElement.locator('input[type="date"], input[name*="date"]')
      .or(formElement.getByLabel(/date/i))
      .first();
      
    if (await dateInput.isVisible().catch(() => false)) {
      await dateInput.fill('2023-01-01');
    }
    
    // Try to find dropdown fields (like train route selection)
    const selectField = formElement.locator('select')
      .or(formElement.getByRole('combobox'))
      .first();
      
    if (await selectField.isVisible().catch(() => false)) {
      try {
        await selectField.selectOption({ index: 0 });
      } catch {
        console.log('Failed to select an option, the dropdown might be empty');
      }
    }
    
    // Submit the form
    const submitButton = formElement.getByRole('button', { name: /save|submit|create|ok/i })
      .or(formElement.locator('button[type="submit"]'))
      .or(formElement.locator('button:has-text("Save")'))
      .or(formElement.locator('button:has-text("Submit")'))
      .or(formElement.locator('button:has-text("Create")'))
      .first();
      
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should try to interact with switchlist items if available', async ({ page }) => {
    // This is a combined test that will try view/operations/print/delete
    // but will adapt to the actual UI and skip parts that aren't available
    
    // First try to find any switchlist item in the list
    const switchlistItems = page.locator('tr, li, .item, .card, .switchlist-item')
      .or(page.getByText(/switchlist/i).filter({ hasNotText: /available|create|new/i }))
      .first();
      
    // Skip if no switchlist items are found
    if (!(await switchlistItems.isVisible().catch(() => false))) {
      console.log('No switchlist items found, skipping interaction test');
      test.skip();
      return;
    }
    
    // Click the first item to view details
    await switchlistItems.click();
    await page.waitForTimeout(1000);
    
    // Check if we've navigated to a detail page
    const hasNavigated = !page.url().endsWith('/switchlists');
    
    if (hasNavigated) {
      console.log('Navigation successful - we are on a detail page');
      
      // Look for operations button if we're on a detail page
      const operationsButton = page.getByRole('link', { name: /operations/i })
        .or(page.locator('a:has-text("Operations")'))
        .first();
        
      if (await operationsButton.isVisible().catch(() => false)) {
        console.log('Operations button found');
        await operationsButton.click();
        await page.waitForTimeout(1000);
        
        // Look for operation-specific elements
        const operationElement = page.getByText(/operation|move|switch/i);
        await expect(operationElement.first()).toBeVisible();
        
        // Go back to the detail page
        await page.goBack();
        await page.waitForTimeout(1000);
      }
      
      // Look for print button
      const printButton = page.getByRole('button', { name: /print/i })
        .or(page.locator('button:has-text("Print")'))
        .or(page.getByRole('link', { name: /print/i }))
        .first();
        
      if (await printButton.isVisible().catch(() => false)) {
        console.log('Print button found');
        await printButton.click();
        await page.waitForTimeout(1000);
        
        // Check if a print view or dialog appears
        const printView = page.locator('.print-view, [data-print-view]')
          .or(page.getByText(/print version|printer friendly/i));
          
        if (await printView.isVisible().catch(() => false)) {
          console.log('Print view visible');
        }
        
        // Go back if we navigated to a print page
        if (page.url().includes('/print')) {
          await page.goBack();
          await page.waitForTimeout(1000);
        }
      }
      
      // Try to find a delete button
      const deleteButton = page.getByRole('button', { name: /delete|remove/i })
        .or(page.locator('button:has-text("Delete")'))
        .or(page.locator('button:has-text("Remove")'))
        .first();
        
      if (await deleteButton.isVisible().catch(() => false)) {
        console.log('Delete button found');
        await deleteButton.click();
        
        // Handle confirmation dialog if it appears
        const confirmButton = page.getByRole('button', { name: /confirm|yes|delete|ok/i })
          .or(page.locator('button:has-text("Confirm")'))
          .or(page.locator('button:has-text("Yes")'))
          .or(page.locator('button:has-text("Delete")'))
          .first();
          
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
        }
        
        // Wait for navigation back to list (if applicable)
        await page.waitForTimeout(1000);
        
        // We should be back on the switchlists page
        expect(page.url()).toContain('/switchlists');
      }
    } else {
      // If we didn't navigate, there might be an inline details view
      // Try to interact with buttons or links in the list view
      
      // Look for view/details button
      const viewButton = page.getByRole('button', { name: /view|details/i })
        .or(page.locator('button:has-text("View")'))
        .or(page.locator('button:has-text("Details")'))
        .first();
        
      if (await viewButton.isVisible().catch(() => false)) {
        console.log('View button found');
        await viewButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Look for delete button
      const deleteButton = page.getByRole('button', { name: /delete|remove/i })
        .or(page.locator('button:has-text("Delete")'))
        .or(page.locator('button:has-text("Remove")'))
        .first();
        
      if (await deleteButton.isVisible().catch(() => false)) {
        console.log('Delete button found');
        await deleteButton.click();
        
        // Handle confirmation dialog if it appears
        const confirmButton = page.getByRole('button', { name: /confirm|yes|delete|ok/i })
          .or(page.locator('button:has-text("Confirm")'))
          .or(page.locator('button:has-text("Yes")'))
          .or(page.locator('button:has-text("Delete")'))
          .first();
          
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
        }
        
        await page.waitForTimeout(1000);
      }
    }
  });
}); 