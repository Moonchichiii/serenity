import { test, expect } from "@playwright/test";

test.describe("contact form", () => {
  test("contact modal opens and form fields render", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /contact/i }).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await expect(
      dialog.getByLabel(/full name|name|nom complet/i),
    ).toBeVisible();
    await expect(dialog.getByLabel(/email/i)).toBeVisible();
    await expect(dialog.getByLabel(/phone|téléphone/i)).toBeVisible();
    await expect(dialog.getByLabel(/subject|sujet/i)).toBeVisible();
    await expect(dialog.getByLabel(/message/i)).toBeVisible();
  });

  test("contact form validates required fields", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /contact/i }).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: /send|envoyer/i }).click();

    await expect(
      dialog.getByText(/required|requis|valid|valide|too short|trop court/i),
    ).toBeVisible();
  });

  test("contact form accepts a valid submission flow", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /contact/i }).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/full name|name|nom complet/i).fill("Jean Dupont");
    await dialog.getByLabel(/email/i).fill("jean@example.com");
    await dialog.getByLabel(/subject|sujet/i).fill("Appointment request");
    await dialog
      .getByLabel(/message/i)
      .fill("I would like to book a massage session.");

    await dialog.getByRole("button", { name: /send|envoyer/i }).click();

    await expect(
      page.getByText(/message sent successfully|success|merci|envoyé/i),
    ).toBeVisible();
  });
});
