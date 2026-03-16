import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQuery } from "@/test/utils";
import { CorporateInquiryForm } from "../CorporateInquiryForm";
import { server } from "@/mocks/server";
import { errorOverrides } from "@/mocks/handlers";
import "@/i18n/config";

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import toast from "react-hot-toast";

describe("CorporateInquiryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders required fields and submit button", () => {
    renderWithQuery(<CorporateInquiryForm />);

    expect(
      screen.getByLabelText(/full name|nom complet/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/company|entreprise/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/event type|type d'événement/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /request quote|devis/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    renderWithQuery(<CorporateInquiryForm />);

    await user.click(
      screen.getByRole("button", { name: /request quote|devis/i })
    );

    await waitFor(() => {
      const errors = screen.getAllByText(
        /required|requis|too short|trop court/i
      );
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("submits successfully with valid data", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderWithQuery(<CorporateInquiryForm onSuccess={onSuccess} />);

    await user.type(
      screen.getByLabelText(/full name|nom complet/i),
      "Jane Doe"
    );
    await user.type(
      screen.getByLabelText(/email/i),
      "jane@company.com"
    );
    await user.type(
      screen.getByLabelText(/company|entreprise/i),
      "Acme SAS"
    );

    await user.click(
      screen.getByRole("button", { name: /request quote|devis/i })
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledTimes(1);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows error toast on server failure", async () => {
    server.use(errorOverrides.contactServerError());
    const user = userEvent.setup();
    renderWithQuery(<CorporateInquiryForm />);

    await user.type(
      screen.getByLabelText(/full name|nom complet/i),
      "Jane Doe"
    );
    await user.type(
      screen.getByLabelText(/email/i),
      "jane@company.com"
    );
    await user.type(
      screen.getByLabelText(/company|entreprise/i),
      "Acme SAS"
    );

    await user.click(
      screen.getByRole("button", { name: /request quote|devis/i })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledTimes(1);
    });
  });

  it("toggles the additional details section", async () => {
    const user = userEvent.setup();
    renderWithQuery(<CorporateInquiryForm />);

    // Additional fields should not be visible initially
    expect(
      screen.queryByLabelText(/hours|horaires/i)
    ).not.toBeInTheDocument();

    // Click toggle button
    await user.click(
      screen.getByRole("button", {
        name: /additional details|détails supplémentaires/i,
      })
    );

    // Now the extra fields should appear
    expect(
      screen.getByLabelText(/hours|horaires/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/additional notes|informations/i)
    ).toBeInTheDocument();
  });
});
