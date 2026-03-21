import { test, expect } from "@playwright/test";

test.describe("navigation", () => {
  test("header renders correctly", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("navigation", { name: /primary/i }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: /contact/i }).first(),
    ).toBeVisible();
  });

  test("homepage anchor navigation links are present", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('a[href="#about"]').first()).toBeVisible();
    await expect(page.locator('a[href="#services"]').first()).toBeVisible();
  });

  test("gift modal opens from query param route", async ({ page }) => {
    await page.goto("/?modal=gift");

    await expect(page.getByRole("dialog")).toBeVisible();

    await expect(
      page.getByText(/select experience|proceed to payment|details/i),
    ).toBeVisible();
  });

  test("voucher success route responds", async ({ page }) => {
    await page.goto("/voucher/success?session_id=cs_test_abc123");

    await expect(
      page.getByText(
        /processing payment|payment successful|something went wrong/i,
      ),
    ).toBeVisible();
  });

  test("voucher success route without session id shows fail state", async ({
    page,
  }) => {
    await page.goto("/voucher/success");

    await expect(
      page.getByText(/something went wrong/i),
    ).toBeVisible();
  });
});
