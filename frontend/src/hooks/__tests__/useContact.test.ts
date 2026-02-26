import { describe, it, expect } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithQuery } from "@/test/utils";
import { useSubmitContact } from "@/hooks/useContact";
import { requestLog } from "@/mocks/handlers";
import {
  ContactSubmissionSchema,
  ContactSubmissionResponseSchema,
} from "@/test/schemas";
import { contactSuccessFixture } from "@/test/fixtures";
import { act } from "@testing-library/react";

const validContactPayload = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+32 456 789 012",
  subject: "General inquiry",
  message: "I'd like to know more about your services.",
};

const corporatePayload = {
  name: "Corporate Manager",
  email: "corp@example.com",
  phone: "+32 111 222 333",
  subject: "[CORPORATE] Team Wellness Program",
  message:
    "Company: Acme Corp\nEmployees: 50\nBudget: €5000\nDetails: Monthly massage sessions",
};

describe("useContact — Flow 4: Contact Submit", () => {
  // ── Category 1: Schema ──────────────────────────────────────
  it("sends payload matching ContactSubmissionSchema", async () => {
    const { result } = renderHookWithQuery(() => useSubmitContact());

    await act(async () => {
      result.current.mutate(validContactPayload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const bodies = requestLog
      .filter((r) => r.url.includes("/api/contact/submit/"))
      .map((r) => r.body);

    expect(bodies).toHaveLength(1);

    const parsed = ContactSubmissionSchema.safeParse(bodies[0]);
    expect(parsed.success).toBe(true);
  });

  it("response matches ContactSubmissionResponseSchema", async () => {
    const { result } = renderHookWithQuery(() => useSubmitContact());

    await act(async () => {
      result.current.mutate(validContactPayload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const parsed = ContactSubmissionResponseSchema.safeParse(
      result.current.data
    );
    expect(parsed.success).toBe(true);
  });

  it("payload contains all 5 required fields", async () => {
    const { result } = renderHookWithQuery(() => useSubmitContact());

    await act(async () => {
      result.current.mutate(validContactPayload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const body = requestLog.find((r) =>
      r.url.includes("/api/contact/submit/")
    )?.body as Record<string, unknown>;

    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("email");
    expect(body).toHaveProperty("phone");
    expect(body).toHaveProperty("subject");
    expect(body).toHaveProperty("message");
    expect(Object.keys(body)).toHaveLength(5);
  });

  // ── Category 2: Call Count ──────────────────────────────────
  it("fires exactly 1 POST per submit", async () => {
    const { result } = renderHookWithQuery(() => useSubmitContact());

    await act(async () => {
      result.current.mutate(validContactPayload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const posts = requestLog.filter(
      (r) =>
        r.url.includes("/api/contact/submit/") &&
        r.method === "POST"
    );
    expect(posts).toHaveLength(1);
  });
});

describe("useContact — Flow 5: Corporate Inquiry Submit", () => {
  // ── Category 1: Schema ──────────────────────────────────────
  it("subject starts with [CORPORATE]", async () => {
    const { result } = renderHookWithQuery(() => useSubmitContact());

    await act(async () => {
      result.current.mutate(corporatePayload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const body = requestLog.find((r) =>
      r.url.includes("/api/contact/submit/")
    )?.body as Record<string, unknown>;

    expect(body.subject).toMatch(/^\[CORPORATE\]/);
  });

  it("sends to the same /api/contact/submit/ endpoint", async () => {
    const { result } = renderHookWithQuery(() => useSubmitContact());

    await act(async () => {
      result.current.mutate(corporatePayload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const calls = requestLog.filter((r) =>
      r.url.includes("/api/contact/submit/")
    );
    expect(calls).toHaveLength(1);
  });

  it("sends no extra fields beyond ContactSubmission shape", async () => {
    const { result } = renderHookWithQuery(() => useSubmitContact());

    await act(async () => {
      result.current.mutate(corporatePayload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const body = requestLog.find((r) =>
      r.url.includes("/api/contact/submit/")
    )?.body as Record<string, unknown>;

    const allowedKeys = [
      "name",
      "email",
      "phone",
      "subject",
      "message",
    ];
    const extraKeys = Object.keys(body).filter(
      (k) => !allowedKeys.includes(k)
    );
    expect(extraKeys).toHaveLength(0);
  });
});
