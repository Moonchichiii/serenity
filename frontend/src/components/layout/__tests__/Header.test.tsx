import { describe, it, expect } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithApp } from "@/test/utils";
import { Header } from "@/components/layout/Header";
import i18n from "@/i18n/config";

describe("Header", () => {
  it("renders nav items and the language picker", async () => {
    await i18n.changeLanguage("fr");
    renderWithApp(<Header />);

    expect(screen.getAllByText("À propos").length).toBeGreaterThan(0);
    expect(screen.getAllByText("FR").length).toBeGreaterThan(0);
    // Mobile panel exists but is inert/hidden until opened
    const panel = document.getElementById("primary-mobile-menu");
    expect(panel).toHaveAttribute("aria-hidden", "true");
  });

  it("switches language via the dropdown and re-renders labels", async () => {
    await i18n.changeLanguage("fr");
    renderWithApp(<Header />);

    const [desktopPicker] = screen.getAllByRole("button", {
      name: "Choose language",
    });
    fireEvent.click(desktopPicker!);
    fireEvent.click(screen.getByRole("menuitem", { name: /English/ }));

    await waitFor(() => {
      expect(screen.getAllByText("About").length).toBeGreaterThan(0);
    });
    // Switch back to keep global i18n state clean for other tests
    await i18n.changeLanguage("fr");
  });

  it("opens and closes the mobile menu with correct inert state", async () => {
    await i18n.changeLanguage("fr");
    renderWithApp(<Header />);

    const toggle = screen.getByRole("button", { name: /menu/i });
    const panel = document.getElementById("primary-mobile-menu")!;

    fireEvent.click(toggle);
    expect(panel).toHaveAttribute("aria-hidden", "false");
    expect(panel.classList.contains("is-open")).toBe(true);

    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(panel).toHaveAttribute("aria-hidden", "true");
    });
  });
});
