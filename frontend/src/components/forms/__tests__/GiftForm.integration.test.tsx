import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithApp } from "../../../test/utils";
import { GiftForm } from "../GiftForm";
import { http, HttpResponse } from "msw";
import { server } from "../../../mocks/server";

// Mock react-calendar for jsdom
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
        type="button"
        data-testid="select-date"
        onClick={() => onChange(new Date("2026-04-15T00:00:00"))}
      >
        Select April 15
      </button>
      {value ? (
        <span data-testid="selected-date">{value.toISOString()}</span>
      ) : null}
    </div>
  ),
}));

const locationAssignMock = vi.fn();

Object.defineProperty(window, "location", {
  value: { ...window.location, assign: locationAssignMock },
  writable: true,
});

const hydratedGiftFixture = {
  page: {
    id: 1,
    title: "Serenity Wellness",
  },
  services: [
    {
      id: 1,
      title_en: "Swedish Massage",
      title_fr: "Massage suédois",
      duration_minutes: 60,
      price: "85.00",
    },
    {
      id: 2,
      title_en: "Deep Tissue",
      title_fr: "Massage profond",
      duration_minutes: 90,
      price: "120.00",
    },
  ],
  globals: {
    site_name: "Serenity Wellness",
    gift: null,
  },
};

const busyDaysResponse = {
  busy: [],
};

const slotsResponse = {
  times: ["09:00", "10:30", "13:00"],
};

function setNativeSelectValue(
  selectElement: HTMLSelectElement,
  value: string,
) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    "value",
  )?.set;

  nativeInputValueSetter?.call(selectElement, value);

  // Wrap manual event dispatch in act() to prevent "not wrapped in act(...)" warnings
  act(() => {
    selectElement.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

describe("GiftForm calendar flow integration", () => {
  beforeEach(() => {
    locationAssignMock.mockClear();

    server.use(
      http.get("*/api/homepage/hydrated/", () => {
        return HttpResponse.json(hydratedGiftFixture);
      }),
      http.get("*/api/calendar/busy/", () => {
        return HttpResponse.json(busyDaysResponse);
      }),
      http.get("*/api/calendar/slots/", () => {
        return HttpResponse.json(slotsResponse);
      }),
      http.post("*/api/payments/checkout/", () => {
        return HttpResponse.json({
          url: "https://checkout.stripe.com/test_session",
          session_id: "cs_test_abc123",
        });
      }),
    );
  });

  it("shows calendar section after selecting a service", async () => {
    renderWithApp(<GiftForm />);

    const select = await screen.findByRole("combobox");
    const options = screen.getAllByRole("option");
    const serviceValue = (options[1] as HTMLOptionElement).value;

    expect(serviceValue).toBeTruthy();

    setNativeSelectValue(select as HTMLSelectElement, serviceValue);

    expect(await screen.findByTestId("mock-calendar")).toBeInTheDocument();
  });

  it("shows time slots after selecting a date on the calendar", async () => {
    const user = userEvent.setup({ delay: null });

    renderWithApp(<GiftForm />);

    const select = await screen.findByRole("combobox");
    const options = screen.getAllByRole("option");
    const serviceValue = (options[1] as HTMLOptionElement).value;

    expect(serviceValue).toBeTruthy();

    setNativeSelectValue(select as HTMLSelectElement, serviceValue);

    const calendar = await screen.findByTestId("mock-calendar");
    expect(calendar).toBeInTheDocument();

    await user.click(screen.getByTestId("select-date"));

    expect(
      await screen.findByRole("button", { name: "09:00" }),
    ).toBeInTheDocument();
  });

  it("submits the full form and calls checkout with correct payload", async () => {
    const user = userEvent.setup({ delay: null });
    let capturedPayload: unknown = null;

    server.use(
      http.post("*/api/payments/checkout/", async ({ request }) => {
        capturedPayload = await request.json();
        return HttpResponse.json({
          url: "https://checkout.stripe.com/test_session",
          session_id: "cs_test_abc123",
        });
      }),
    );

    renderWithApp(<GiftForm />);

    const select = await screen.findByRole("combobox");
    const options = screen.getAllByRole("option");
    const serviceValue = (options[1] as HTMLOptionElement).value;

    expect(serviceValue).toBeTruthy();

    setNativeSelectValue(select as HTMLSelectElement, serviceValue);

    const calendar = await screen.findByTestId("mock-calendar");
    expect(calendar).toBeInTheDocument();

    await user.click(screen.getByTestId("select-date"));

    const timeSlotButton = await screen.findByRole("button", { name: "09:00" });
    await user.click(timeSlotButton);

    // Fixed: Using placeholders since the labels aren't linked via htmlFor/id
    await user.type(screen.getByPlaceholderText(/jane doe/i), "Jean Dupont");
    await user.type(screen.getByPlaceholderText(/jane@example\.com/i), "jean@example.com");
    await user.type(screen.getByPlaceholderText(/recipient name/i), "Marie Dupont");
    await user.type(screen.getByPlaceholderText(/recipient@example\.com/i), "marie@example.com");
    await user.type(screen.getByPlaceholderText(/happy birthday/i), "Happy birthday!");

    await user.click(
      screen.getByRole("button", { name: /send gift voucher/i }),
    );

    await waitFor(() => {
      expect(capturedPayload).not.toBeNull();
    });

    expect(capturedPayload).toEqual(
      expect.objectContaining({
        service_id: 1,
        sender_name: "Jean Dupont",
        sender_email: "jean@example.com",
        recipient_name: "Marie Dupont",
        recipient_email: "marie@example.com",
        preferred_language: "en",
        start_datetime: expect.stringContaining("2026-04-15"),
        end_datetime: expect.any(String),
      }),
    );

    expect(locationAssignMock).toHaveBeenCalledWith(
      "https://checkout.stripe.com/test_session",
    );
  });
});
