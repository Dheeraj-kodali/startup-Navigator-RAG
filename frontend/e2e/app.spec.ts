import { test, expect } from "@playwright/test";

test.describe("Startup Navigator Portal E2E Tests", () => {
  
  test("homepage loads and displays categories list", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Startup Navigator/);
    await expect(page.locator("h1")).toContainText("Navigate Your Startup Journey");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("navigation links work correctly on desktop", async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
    }
    await page.goto("/");
    
    // Desktop link click
    await page.locator('nav').getByRole('link', { name: 'Resources' }).click();
    await page.waitForURL('**/resources');
    
    await page.locator('nav').getByRole('link', { name: 'About' }).click();
    await page.waitForURL('**/about');
  });

  test("authentication toggles between forms", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator("h1")).toContainText("Welcome Back");
    
    // Toggle: Sign In -> Sign Up
    await page.click("div.border-t button:has-text('Sign Up')");
    await expect(page.locator("h1")).toContainText("Create Founder Account");
    
    // Toggle: Sign Up -> Sign In
    // In signup mode, the switch button says "Sign In" (within "Already have an account? Sign In")
    await page.click("div.border-t button:has-text('Sign In')");
    await expect(page.locator("h1")).toContainText("Welcome Back");
    
    // Toggle: Sign In -> Forgot Password
    await page.click("text=Forgot Password?");
    await expect(page.locator("h1")).toContainText("Reset Password");

    // Toggle: Forgot Password -> Sign In
    await page.click("text=Back to Sign In");
    await expect(page.locator("h1")).toContainText("Welcome Back");
  });

  test("AI Search page functions", async ({ page }) => {
    await page.goto("/ai-search");
    await expect(page.locator("h2")).toContainText("Ask Startup Navigator AI");
    
    const suggestionBtn = page.locator("button:has-text('Should I form an LLC')");
    await expect(suggestionBtn).toBeVisible();
  });

  test("responsiveness checks for desktop vs mobile layout views", async ({ page, isMobile }) => {
    await page.goto("/");
    
    const desktopNav = page.locator("nav .hidden.md\\:flex");
    if (isMobile) {
      await expect(desktopNav).not.toBeVisible();
    } else {
      await expect(desktopNav).toBeVisible();
    }
  });

});
