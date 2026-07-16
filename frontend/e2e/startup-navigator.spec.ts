import { test, expect } from '@playwright/test';

test.describe('Startup Navigator E2E Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'password123'
  };

  test('Complete user journey: Register, Upload, Search, Delete, Logout', async ({ page }) => {
    // 1. User Registration
    await page.goto('/auth?mode=signup');
    
    // Wait for the Sign Up form to render (checking for Steve Jobs placeholder)
    await expect(page.getByPlaceholder('Steve Jobs')).toBeVisible();
    
    await page.getByPlaceholder('Steve Jobs').fill(testUser.name);
    await page.getByPlaceholder('founder@apple.com').fill(testUser.email);
    await page.getByPlaceholder('••••••••').fill(testUser.password);
    
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // We should be redirected to login view (state change)
    await expect(page.locator("h1")).toContainText("Welcome Back");
    
    // 2. Login
    await page.getByPlaceholder('founder@apple.com').fill(testUser.email);
    await page.getByPlaceholder('••••••••').fill(testUser.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for redirect to home or for the user's name to appear
    await expect(page.getByText(testUser.name)).toBeVisible({ timeout: 10000 });
    
    // 3. Upload & Index Document
    await page.getByRole('link', { name: 'Knowledge Base' }).click();
    await page.waitForURL('**/knowledge');
    
    const fileContent = 'A SAFE (Simple Agreement for Future Equity) is a financing contract that may be used by a startup company to raise capital in its seed financing rounds.';
    await page.setInputFiles('input[type="file"]', {
      name: 'safe-agreement.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(fileContent)
    });
    
    await page.getByPlaceholder('Enter custom title').fill('SAFE Agreement Rules');
    await page.getByRole('button', { name: 'Start Auto-Indexing' }).click();
    
    // Wait for completion (Toast message)
    await expect(page.getByText('Document uploaded and indexed successfully!')).toBeVisible({ timeout: 15000 });
    
    await expect(page.getByText('SAFE Agreement Rules')).toBeVisible();
    
    // 4. AI Search
    await page.getByRole('link', { name: 'AI Search' }).click();
    await page.waitForURL('**/ai-search');
    
    const searchInput = page.getByPlaceholder('Ask AI search...');
    await searchInput.fill('What is a SAFE agreement?');
    
    await page.locator('button[type="submit"]').click();
    
    // The response should be rendered
    await expect(page.locator('.prose')).toContainText('SAFE', { timeout: 15000 });
    
    // 5. Search History Delete
    const deleteButton = page.getByRole('button', { name: 'Delete search history' }).first();
    await deleteButton.click();
    await expect(page.getByText('History item deleted')).toBeVisible();
    
    // 6. Delete Document
    await page.getByRole('link', { name: 'Knowledge Base' }).click();
    await page.waitForURL('**/knowledge');
    
    await page.getByLabel('Delete Document').first().click();
    await page.getByLabel('Confirm Delete Document').click();
    await expect(page.getByText('Document deleted successfully.')).toBeVisible();

    // 7. Logout
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await page.waitForURL('**/');
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });
});
