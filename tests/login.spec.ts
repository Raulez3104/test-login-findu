import { test, expect } from "@playwright/test";

test("Login", async ({ page }) => {
  await page.goto("/login");

  await page.fill('input[name="email"]', "admin@gmail.com");
  await page.fill('input[name="password"]', "ijasidhoashd");
  await page.click('button[type="submit"]');

  await expect(page.locator('[data-testid="error-msg"]')).toBeVisible();
  await expect(page.locator('[data-testid="error-msg"]')).toContainText('incorrecta');

  await page.fill('input[name="email"]', "admin@gmail.com");
  await page.fill('input[name="password"]', "123456");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/dashboard/);
});

//npx playwright test --ui
//npx playwright test --headed
