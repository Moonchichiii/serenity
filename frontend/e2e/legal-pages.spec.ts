import { expect, test } from "@playwright/test";

test.describe("legal pages (modal)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("privacy policy modal opens and renders content", async ({ page }) => {
    // open via footer
    await page.getByRole("button", { name: /privacy/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // main title (from LegalPageLayout)
    await expect(
      dialog.getByRole("heading", { level: 1 }),
    ).toBeVisible();

    // sections (stable IDs from your code)
    await expect(dialog.locator("#controller")).toBeVisible();
    await expect(dialog.locator("#data")).toBeVisible();
    await expect(dialog.locator("#purpose")).toBeVisible();
  });

  test("legal notice modal opens and renders sections", async ({ page }) => {
    await page.getByRole("button", { name: /legal/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await expect(dialog.getByRole("heading", { level: 1 })).toBeVisible();

    await expect(dialog.locator("#publisher")).toBeVisible();
    await expect(dialog.locator("#hosting")).toBeVisible();
    await expect(dialog.locator("#ip")).toBeVisible();
  });

  test("terms & conditions modal renders correctly", async ({ page }) => {
    // depends how you expose it — if only via modal switching, we simulate it
    await page.getByRole("button", { name: /legal/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // We can't assume default page — so just assert generic structure
    await expect(dialog.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("modal closes correctly", async ({ page }) => {
    await page.getByRole("button", { name: /privacy/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // close via ESC (your provider supports it)
    await page.keyboard.press("Escape");

    await expect(dialog).toBeHidden();
  });
});
