import { expect, test } from "@playwright/test";

test.describe("navigation", () => {
  test("header renders correctly", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("navigation", { name: /primary/i }),
    ).toBeVisible();

    await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^contact$/i }).first()).toBeVisible();
  });

  test("homepage anchor navigation links are present", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('a[href="#about"]').first()).toBeVisible();
    await expect(page.locator('a[href="#services"]').first()).toBeVisible();
    await expect(page.locator('a[href="#services-hero"]').first()).toBeVisible();
  });

  test("gift modal opens from floating button", async ({ page }) => {
    await page.goto("/");

    const giftTrigger = page.getByRole("button", { name: /offer a gift/i });
    await expect(giftTrigger).toBeVisible();
    await giftTrigger.click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: /choose a treatment/i }),
    ).toBeVisible();
  });

  test("contact modal opens from header", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /^contact$/i }).first().click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("voucher success route responds", async ({ page }) => {
    await page.goto("/voucher/success?session_id=demo-session-1234");

    await expect(
      page.getByRole("heading", { name: /processing payment|payment successful|something went wrong/i }),
    ).toBeVisible();
  });

  test("voucher success route without session id shows fail state", async ({ page }) => {
    await page.goto("/voucher/success");

    await expect(
      page.getByRole("heading", { name: /something went wrong/i }),
    ).toBeVisible();
  });
});
