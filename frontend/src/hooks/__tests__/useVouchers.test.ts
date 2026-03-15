import { describe, it, expect } from "vitest";
import { waitFor, act } from "@testing-library/react";
import { renderHookWithQuery } from "@/test/utils";
import { useCreateCheckoutMutation } from "@/queries/payments.mutations";
import { requestLog } from "@/mocks/handlers";
import type { CheckoutRequest } from "@/types/api/payments";

describe("useCreateCheckoutMutation — Flow: Payments & Vouchers", () => {
  const validPayload: CheckoutRequest = {
    sender_name: "Alice",
    sender_email: "alice@example.com",
    recipient_name: "Bob",
    recipient_email: "bob@example.com",
    message: "Happy Birthday!",
    amount: 150,
    preferred_language: "en",
    service_id: 1,
  };

  it("sends payload matching expected CheckoutRequest shape", async () => {
    const { result } = renderHookWithQuery(() => useCreateCheckoutMutation());

    await act(async () => {
      // Catch the navigation or ignore it since it's just a mutation test
      result.current.mutate(validPayload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const body = requestLog.find((r) =>
      r.url.includes("/api/payments/checkout/")
    )?.body as Record<string, unknown>;

    expect(body.sender_name).toBe("Alice");
    expect(body.amount).toBe(150);
    expect(body.service_id).toBe(1);
    expect(body.preferred_language).toBe("en");
  });

  it("fires exactly 1 POST to checkout endpoint per submit", async () => {
    const { result } = renderHookWithQuery(() => useCreateCheckoutMutation());

    await act(async () => {
      result.current.mutate(validPayload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const posts = requestLog.filter(
      (r) =>
        r.url.includes("/api/payments/checkout/") && r.method === "POST"
    );
    // Might be greater than 1 if other tests ran, so we check relative length or just clear logs
    // Assuming requestLog is cleared between tests in your setup:
    expect(posts).toHaveLength(1);
  });
});
