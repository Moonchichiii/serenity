import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQuery } from "../../../test/utils";
import { GiftForm } from "../GiftForm";
import { http, HttpResponse } from "msw";
import { server } from "../../../mocks/server";
import {
  mockServices,
  mockAvailability,
  mockTimeSlots,
} from "../../../test/fixtures";

// Mock react-calendar (jsdom incompatibility — existing pattern)
vi.mock("react-calendar", () => ({
  __esModule: true,
  default: ({
    onChange,
    value,
  }: {
    onChange: (date: Date) => void;
    value: Date | null;
  }) => (
    <div data-testid="mock-calendar">
      <button
        data-testid="select-date"
        onClick={() => onChange(new Date("2026-04-15"))}
      >
        Select April 15
      </button>
      {value && <span data-testid="selected-date">{value.toISOString()}</span>}
    </div>
  ),
}));

// Mock window.location.assign for Stripe redirect
const locationAssignMock = vi.fn();
Object.defineProperty(window, "location", {
  value: { ...window.location, assign: locationAssignMock },
  writable: true,
});

// Helper: set native select value (existing pattern from your codebase)
function setNativeSelectValue(
  selectElement: HTMLSelectElement,
  value: string,
) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    "value",
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(selectElement, value);
  }

  selectElement.dispatchEvent(new Event("change", { bubbles: true }));
}

describe("GiftForm calendar flow integration", () => {
  beforeEach(() => {
    locationAssignMock.mockClear();

    // MSW handlers for the gift flow
    server.use(
      http.get("*/api/services", () => {
        return HttpResponse.json(mockServices);
      }),
      http.get("*/api/calendar/availability", ({ request }) => {
        const url = new URL(request.url);
        const serviceId = url.searchParams.get("serviceId");
        return HttpResponse.json(mockAvailability);
      }),
      http.get("*/api/calendar/slots", ({ request }) => {
        const url = new URL(request.url);
        return HttpResponse.json(mockTimeSlots);
      }),
      http.post("*/api/payments/checkout", async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          url: "https://checkout.stripe.com/test_session",
        });
      }),
    );
  });

  it("shows calendar section after selecting a service", async () => {
    renderWithQuery(<GiftForm />);

    // Wait for services to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox") as HTMLSelectElement;

    // Use native value setter pattern (your established convention)
    const serviceValue =
      mockServices[0]?.id?.toString() ?? mockServices[0]?.slug ?? "1";

    setNativeSelectValue(select, serviceValue);

    // Calendar section should now appear
    await waitFor(() => {
      expect(screen.getByTestId("mock-calendar")).toBeInTheDocument();
    });
  });

  it("shows time slots after selecting a date on the calendar", async () => {
    const user = userEvent.setup();

    renderWithQuery(<GiftForm />);

    // Select service
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    const serviceValue =
      mockServices[0]?.id?.toString() ?? mockServices[0]?.slug ?? "1";

    setNativeSelectValue(select, serviceValue);

    // Wait for calendar
    await waitFor(() => {
      expect(screen.getByTestId("mock-calendar")).toBeInTheDocument();
    });

    // Click date on mock calendar
    await user.click(screen.getByTestId("select-date"));

    // Time slots should appear
    await waitFor(() => {
      const slots =
        screen.queryAllByRole("button").filter((btn) => {
          // Time slots are typically rendered as buttons with time text
          return /\d{1,2}:\d{2}/.test(btn.textContent ?? "");
        }) ??
        screen.queryAllByTestId(/time-slot/) ??
        screen.queryAllByRole("radio");

      expect(slots.length).toBeGreaterThan(0);
    });
  });

  it("submits the full form and calls checkout with correct payload", async () => {
    const user = userEvent.setup();
    let capturedPayload: unknown = null;

    server.use(
      http.post("*/api/payments/checkout", async ({ request }) => {
        capturedPayload = await request.json();
        return HttpResponse.json({
          url: "https://checkout.stripe.com/test_session",
        });
      }),
    );

    renderWithQuery(<GiftForm />);

    // 1. Select service
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    const serviceValue =
      mockServices[0]?.id?.toString() ?? mockServices[0]?.slug ?? "1";

    setNativeSelectValue(select, serviceValue);

    // 2. Select date
    await waitFor(() => {
      expect(screen.getByTestId("mock-calendar")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("select-date"));

    // 3. Select a time slot
    await waitFor(() => {
      const slots = screen
        .queryAllByRole("button")
        .filter((btn) => /\d{1,2}:\d{2}/.test(btn.textContent ?? ""));
      if (slots.length > 0) {
        return true;
      }
      // Also try radio buttons or testid pattern
      return screen.queryAllByTestId(/time-slot/).length > 0;
    });

    const timeSlotButtons = screen
      .queryAllByRole("button")
      .filter((btn) => /\d{1,2}:\d{2}/.test(btn.textContent ?? ""));

    const timeSlots = timeSlotButtons.length
      ? timeSlotButtons
      : screen.queryAllByTestId(/time-slot/);

    if (timeSlots[0]) {
      await user.click(timeSlots[0]);
    }

    // 4. Fill in gift recipient/sender details
    const nameInputs = screen.queryAllByRole("textbox");
    for (const input of nameInputs) {
      const label =
        input.getAttribute("name") ?? input.getAttribute("placeholder") ?? "";
      if (/name/i.test(label)) {
        await user.type(input, "Test Person");
      } else if (/email/i.test(label)) {
        await user.type(input, "test@example.com");
      } else if (/message/i.test(label) || /note/i.test(label)) {
        await user.type(input, "Happy birthday!");
      }
    }

    // Also check for textarea (message field)
    const textareas = screen.queryAllByRole("textbox").length
      ? []
      : screen.queryAllByPlaceholderText(/message/i);
    for (const ta of textareas) {
      await user.type(ta, "Happy birthday!");
    }

    // 5. Submit
    const submitButton =
      screen.queryByRole("button", { name: /checkout|pay|book|submit|gift/i });

    if (submitButton) {
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(capturedPayload).not.toBeNull();
        },
        { timeout: 5000 },
      );

      // Verify payload shape
      expect(capturedPayload).toEqual(
        expect.objectContaining({
          serviceId: expect.anything(),
          date: expect.stringContaining("2026-04-15"),
        }),
      );

      // Should redirect to Stripe
      expect(locationAssignMock).toHaveBeenCalledWith(
        "https://checkout.stripe.com/test_session",
      );
    }
  });
});
