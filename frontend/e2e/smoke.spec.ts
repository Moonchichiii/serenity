import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("homepage responds and main layout renders", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("navigation", { name: /primary/i })).toBeVisible();
    await expect(page.locator("#site-footer")).toBeVisible();
  });

  test("homepage title is present", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/serenity|la serenity/i);
  });

  test("no fatal client-side crash on first load", async ({ page }) => {
    const pageErrors: string[] = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();

    expect(pageErrors).toEqual([]);
  });
});
