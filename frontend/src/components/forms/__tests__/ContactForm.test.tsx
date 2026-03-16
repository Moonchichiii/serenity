import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQuery } from "@/test/utils";
import { ContactForm } from "../Contactform";
import { server } from "@/mocks/server";
import { errorOverrides } from "@/mocks/handlers";
import "@/i18n/config";

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import toast from "react-hot-toast";

describe("ContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all fields and the submit button", () => {
    renderWithQuery(<ContactForm />);

    expect(screen.getByLabelText(/full name|nom complet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone|téléphone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject|sujet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send|envoyer/i })
    ).toBeInTheDocument();
  });

  it("applies defaultSubject to the subject field", () => {
    renderWithQuery(<ContactForm defaultSubject="Booking inquiry" />);

    const subject = screen.getByLabelText(/subject|sujet/i);
    expect(subject).toHaveValue("Booking inquiry");
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ContactForm />);

    await user.click(
      screen.getByRole("button", { name: /send|envoyer/i })
    );

    await waitFor(() => {
      // At minimum, name and email errors should appear
      const errors = screen.getAllByText(
        /required|requis|too short|trop court/i
      );
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("submits successfully with valid data and calls onSuccess", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderWithQuery(<ContactForm onSuccess={onSuccess} />);

    await user.type(
      screen.getByLabelText(/full name|nom complet/i),
      "Jean Dupont"
    );
    await user.type(screen.getByLabelText(/email/i), "jean@example.com");
    await user.type(
      screen.getByLabelText(/subject|sujet/i),
      "Appointment request"
    );
    await user.type(
      screen.getByLabelText(/message/i),
      "I would like to book a massage session please."
    );

    await user.click(
      screen.getByRole("button", { name: /send|envoyer/i })
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledTimes(1);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows error toast on server 500", async () => {
    server.use(errorOverrides.contactServerError());
    const user = userEvent.setup();
    renderWithQuery(<ContactForm />);

    await user.type(
      screen.getByLabelText(/full name|nom complet/i),
      "Jean Dupont"
    );
    await user.type(screen.getByLabelText(/email/i), "jean@example.com");
    await user.type(
      screen.getByLabelText(/subject|sujet/i),
      "Appointment request"
    );
    await user.type(
      screen.getByLabelText(/message/i),
      "I would like to book a massage session please."
    );

    await user.click(
      screen.getByRole("button", { name: /send|envoyer/i })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledTimes(1);
    });
  });
});
