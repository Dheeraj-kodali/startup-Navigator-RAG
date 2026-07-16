import { test, expect } from "@playwright/test";

test.describe("Full User Sign-Up, Sign-In, and AI Search Flow", () => {
  const testEmail = `tester-${Date.now()}@navigator.com`;
  const testPassword = "SecurePassword123!";
  const testName = "Verification Tester";

  test("should successfully sign up, log in, and use AI search on desktop", async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
    }
    
    // 1. Visit Auth Page
    await page.goto("/auth");
    await expect(page.locator("h1")).toContainText("Welcome Back");

    // 2. Click Sign Up Toggle
    await page.click("div.border-t button:has-text('Sign Up')");
    await expect(page.locator("h1")).toContainText("Create Founder Account");

    // 3. Fill Sign Up Form
    await page.fill('input[placeholder="Steve Jobs"]', testName);
    await page.fill('input[placeholder="founder@apple.com"]', testEmail);
    await page.fill('input[placeholder="••••••••"]', testPassword);
    
    // Submit Sign Up
    await page.click("button:has-text('Create Account')");

    // 4. Verify Success Message and Toggle back to Sign In
    await expect(page.locator("text=Account created")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Welcome Back");

    // 5. Fill Sign In Form with the newly registered user
    await page.fill('input[placeholder="founder@apple.com"]', testEmail);
    await page.fill('input[placeholder="••••••••"]', testPassword);
    
    // Submit Sign In
    await page.click("form button:has-text('Sign In')");

    // 6. Verify Redirected to Homepage
    await page.waitForURL('**/', { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Navigate Your Startup Journey");

    // 7. Verify LocalStorage has Token
    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).not.toBeNull();

    // 8. Go to AI Search Page
    await page.goto("/ai-search");
    await expect(page.locator("h2")).toContainText("Ask Startup Navigator AI");

    // 9. Input Search Query and Submit
    await page.fill('input[placeholder="Ask AI search..."]', "Should I register as LLC or C-Corp?");
    await page.click("form button[type='submit']");

    // 10. Verify User Query Bubble Appears
    await expect(page.locator("text=Should I register as LLC or C-Corp?")).toBeVisible();
    
    // 11. Verify AI Response bubble or loading state appears
    await expect(page.getByText('Searching knowledge base...').first()).toBeVisible();
  });
});
