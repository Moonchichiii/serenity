import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithQuery } from "@/test/utils";
import { GiftForm } from "../GiftForm";
import "@/i18n/config";

// ── Module mocks ────────────────────────────────────────────────
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/hooks/useCMS", () => ({
  useCMSServices: () => [
    {
      id: 1,
      title_en: "Swedish Massage",
      title_fr: "Massage Suédois",
      price: "85.00",
      duration_minutes: 60,
    },
    {
      id: 2,
      title_en: "Deep Tissue",
      title_fr: "Massage Profond",
      price: "120.00",
      duration_minutes: 90,
    },
  ],
}));

vi.mock("@/hooks/useCalendar", () => ({
  useBusyDays: () => ({ data: { busy: [] } }),
  useFreeSlots: () => ({
    data: { times: [] },
    isFetching: false,
  }),
}));

// ── Helpers ─────────────────────────────────────────────────────
function inputByName(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(
    `input[name="${name}"], textarea[name="${name}"]`,
  );
  if (!el) throw new Error(`No element with name="${name}"`);
  return el;
}

describe("GiftForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sender/recipient fields and service selector", () => {
    renderWithQuery(<GiftForm />);

    expect(inputByName("senderName")).toBeInTheDocument();
    expect(inputByName("senderEmail")).toBeInTheDocument();
    expect(inputByName("recipientName")).toBeInTheDocument();
    expect(inputByName("recipientEmail")).toBeInTheDocument();
    expect(inputByName("message")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows service options in the dropdown", () => {
    renderWithQuery(<GiftForm />);

    const options = screen
      .getByRole("combobox")
      .querySelectorAll<HTMLOptionElement>("option");
    expect(options).toHaveLength(3);
    expect(options[1].textContent).toContain("Swedish Massage");
    expect(options[2].textContent).toContain("Deep Tissue");
  });

  it("updates displayed amount when a service is selected", async () => {
    renderWithQuery(<GiftForm />);

    // Removed the type assertion "as HTMLSelectElement" to fix the lint error
    const select = screen.getByRole("combobox");

    // fireEvent is safer than userEvent for native select elements in testing libraries
    fireEvent.change(select, { target: { value: "1" } });

    console.log("select.value after change:", (select as HTMLSelectElement).value);
    console.log("body snippet:", document.body.textContent?.slice(0, 500));

    await waitFor(
      () => {
        const text = document.body.textContent ?? "";
        console.log("waitFor — body has 85?", text.includes("85"));
        // Check for just "85" to avoid formatting/currency symbol issues
        expect(text).toContain("85");
      },
      { timeout: 5_000 },
    );
  });
});
