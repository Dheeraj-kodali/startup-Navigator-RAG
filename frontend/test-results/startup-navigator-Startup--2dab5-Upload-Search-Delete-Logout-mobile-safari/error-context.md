# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: startup-navigator.spec.ts >> Startup Navigator E2E Flow >> Complete user journey: Register, Upload, Search, Delete, Logout
- Location: e2e\startup-navigator.spec.ts:11:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Welcome Back"
Received string:    "Create Founder Account"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    13 × locator resolved to <h1 class="text-3xl font-extrabold tracking-tight text-foreground mb-2">Create Founder Account</h1>
       - unexpected value "Create Founder Account"

```

```yaml
- heading "Create Founder Account" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Startup Navigator E2E Flow', () => {
  4  |   const timestamp = Date.now();
  5  |   const testUser = {
  6  |     name: `Test User ${timestamp}`,
  7  |     email: `test${timestamp}@example.com`,
  8  |     password: 'password123'
  9  |   };
  10 | 
  11 |   test('Complete user journey: Register, Upload, Search, Delete, Logout', async ({ page }) => {
  12 |     // 1. User Registration
  13 |     await page.goto('/auth?mode=signup');
  14 |     
  15 |     // Wait for the Sign Up form to render (checking for Steve Jobs placeholder)
  16 |     await expect(page.getByPlaceholder('Steve Jobs')).toBeVisible();
  17 |     
  18 |     await page.getByPlaceholder('Steve Jobs').fill(testUser.name);
  19 |     await page.getByPlaceholder('founder@apple.com').fill(testUser.email);
  20 |     await page.getByPlaceholder('••••••••').fill(testUser.password);
  21 |     
  22 |     await page.getByRole('button', { name: 'Create Account' }).click();
  23 |     
  24 |     // We should be redirected to login view (state change)
> 25 |     await expect(page.locator("h1")).toContainText("Welcome Back");
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  26 |     
  27 |     // 2. Login
  28 |     await page.getByPlaceholder('founder@apple.com').fill(testUser.email);
  29 |     await page.getByPlaceholder('••••••••').fill(testUser.password);
  30 |     await page.getByRole('button', { name: 'Sign In' }).click();
  31 |     
  32 |     // Wait for redirect to home or for the user's name to appear
  33 |     await expect(page.getByText(testUser.name)).toBeVisible({ timeout: 10000 });
  34 |     
  35 |     // 3. Upload & Index Document
  36 |     await page.getByRole('link', { name: 'Knowledge Base' }).click();
  37 |     await page.waitForURL('**/knowledge');
  38 |     
  39 |     const fileContent = 'A SAFE (Simple Agreement for Future Equity) is a financing contract that may be used by a startup company to raise capital in its seed financing rounds.';
  40 |     await page.setInputFiles('input[type="file"]', {
  41 |       name: 'safe-agreement.txt',
  42 |       mimeType: 'text/plain',
  43 |       buffer: Buffer.from(fileContent)
  44 |     });
  45 |     
  46 |     await page.getByPlaceholder('Enter custom title').fill('SAFE Agreement Rules');
  47 |     await page.getByRole('button', { name: 'Start Auto-Indexing' }).click();
  48 |     
  49 |     // Wait for completion (Toast message)
  50 |     await expect(page.getByText('Document uploaded and indexed successfully!')).toBeVisible({ timeout: 15000 });
  51 |     
  52 |     await expect(page.getByText('SAFE Agreement Rules')).toBeVisible();
  53 |     
  54 |     // 4. AI Search
  55 |     await page.getByRole('link', { name: 'AI Search' }).click();
  56 |     await page.waitForURL('**/ai-search');
  57 |     
  58 |     const searchInput = page.getByPlaceholder('Ask AI search...');
  59 |     await searchInput.fill('What is a SAFE agreement?');
  60 |     
  61 |     await page.locator('button[type="submit"]').click();
  62 |     
  63 |     // The response should be rendered
  64 |     await expect(page.locator('.prose')).toContainText('SAFE', { timeout: 15000 });
  65 |     
  66 |     // 5. Search History Delete
  67 |     const deleteButton = page.getByRole('button', { name: 'Delete search history' }).first();
  68 |     await deleteButton.click();
  69 |     await expect(page.getByText('History item deleted')).toBeVisible();
  70 |     
  71 |     // 6. Delete Document
  72 |     await page.getByRole('link', { name: 'Knowledge Base' }).click();
  73 |     await page.waitForURL('**/knowledge');
  74 |     
  75 |     await page.getByLabel('Delete Document').first().click();
  76 |     await page.getByLabel('Confirm Delete Document').click();
  77 |     await expect(page.getByText('Document deleted successfully.')).toBeVisible();
  78 | 
  79 |     // 7. Logout
  80 |     await page.getByRole('button', { name: 'Sign Out' }).click();
  81 |     await page.waitForURL('**/');
  82 |     await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  83 |   });
  84 | });
  85 | 
```