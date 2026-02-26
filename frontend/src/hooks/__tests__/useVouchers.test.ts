import { describe, it, expect } from "vitest";
import { waitFor, act } from "@testing-library/react";
import { renderHookWithQuery } from "@/test/utils";
import { useCreateVoucher } from "@/hooks/useVouchers";
import { requestLog } from "@/mocks/handlers";
import {
  GiftVoucherPayloadSchema,
  GiftVoucherResponseSchema,
} from "@/test/schemas";

const voucherWithBooking = {
  sender_name: "Alice",
  sender_email: "alice@example.com",
  recipient_name: "Bob",
  recipient_email: "bob@example.com",
  service_id: 1,
  message: "Happy birthday!",
  start_datetime: "2026-03-06T09:00:00Z",
  end_datetime: "2026-03-06T10:00:00Z",
};

const voucherWithoutBooking = {
  sender_name: "Charlie",
  sender_email: "charlie@example.com",
  recipient_name: "Diana",
  recipient_email: "diana@example.com",
  message: "Enjoy!",
};

describe("useVouchers — Flow 6: Gift Voucher Purchase", () => {
  // ── Category 1: Schema ──────────────────────────────────────
  it("sends payload matching GiftVoucherPayloadSchema (with booking)", async () => {
    const { result } = renderHookWithQuery(() => useCreateVoucher());

    await act(async () => {
      result.current.mutate(voucherWithBooking);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const body = requestLog.find((r) =>
      r.url.includes("/api/vouchers/create/"),
    )?.body;

    const parsed = GiftVoucherPayloadSchema.safeParse(body);
    expect(parsed.success).toBe(true);
  });

  it("response matches GiftVoucherResponseSchema", async () => {
    const { result } = renderHookWithQuery(() => useCreateVoucher());

    await act(async () => {
      result.current.mutate(voucherWithBooking);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const parsed = GiftVoucherResponseSchema.safeParse(
      result.current.data,
    );
    expect(parsed.success).toBe(true);
    expect(result.current.data?.code).toBeTruthy();
  });

  it("payload is snake_case (not camelCase)", async () => {
    const { result } = renderHookWithQuery(() => useCreateVoucher());

    await act(async () => {
      result.current.mutate(voucherWithBooking);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const body = requestLog.find((r) =>
      r.url.includes("/api/vouchers/create/"),
    )?.body as Record<string, unknown>;

    // Must have snake_case keys
    expect(body).toHaveProperty("sender_name");
    expect(body).toHaveProperty("sender_email");
    expect(body).toHaveProperty("recipient_name");
    expect(body).toHaveProperty("recipient_email");
    expect(body).toHaveProperty("service_id");
    expect(body).toHaveProperty("start_datetime");
    expect(body).toHaveProperty("end_datetime");

    // Must NOT have old or camelCase keys
    expect(body).not.toHaveProperty("purchaser_name");
    expect(body).not.toHaveProperty("purchaser_email");
    expect(body).not.toHaveProperty("preferred_date");
    expect(body).not.toHaveProperty("senderName");
    expect(body).not.toHaveProperty("senderEmail");
    expect(body).not.toHaveProperty("serviceId");
    expect(body).not.toHaveProperty("startDatetime");
  });

  // ── Category 1: Boundary — no booking variant ───────────────
  it("omits booking keys entirely when no booking requested", async () => {
    const { result } = renderHookWithQuery(() => useCreateVoucher());

    await act(async () => {
      result.current.mutate(voucherWithoutBooking);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const body = requestLog.find((r) =>
      r.url.includes("/api/vouchers/create/"),
    )?.body as Record<string, unknown>;

    // Booking keys must be absent, not null
    expect(body).not.toHaveProperty("service_id");
    expect(body).not.toHaveProperty("start_datetime");
    expect(body).not.toHaveProperty("end_datetime");

    // Removed field must never appear
    expect(body).not.toHaveProperty("preferred_date");
  });

  // ── Category 2: Call Count ──────────────────────────────────
  it("fires exactly 1 POST per submit", async () => {
    const { result } = renderHookWithQuery(() => useCreateVoucher());

    await act(async () => {
      result.current.mutate(voucherWithBooking);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const posts = requestLog.filter(
      (r) =>
        r.url.includes("/api/vouchers/create/") &&
        r.method === "POST",
    );
    expect(posts).toHaveLength(1);
  });

  it("does NOT trigger any query invalidations", async () => {
    const { result, queryClient } = renderHookWithQuery(() =>
      useCreateVoucher(),
    );

    // Pre-seed a cache entry to see if it gets invalidated
    queryClient.setQueryData(["cms", "hydrated"], { sentinel: true });
    queryClient.setQueryData(["testimonials", "list", 4], []);

    await act(async () => {
      result.current.mutate(voucherWithBooking);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Cache entries should still exist (not invalidated)
    expect(queryClient.getQueryData(["cms", "hydrated"])).toEqual({
      sentinel: true,
    });
    expect(
      queryClient.getQueryData(["testimonials", "list", 4]),
    ).toEqual([]);
  });
});
