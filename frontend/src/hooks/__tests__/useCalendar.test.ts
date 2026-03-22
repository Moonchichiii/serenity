import { describe, it, expect } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithQuery } from "@/test/utils";
import { useBusyDays, useFreeSlots } from "@/hooks/useCalendar";
import { requestLog } from "@/mocks/handlers";
import { BusyResponseSchema, SlotsResponseSchema } from "@/test/schemas";

describe("useCalendar — Flow 2: Busy Days", () => {
  // ── Category 1: Schema ──────────────────────────────────────
  it("returns data matching BusyResponseSchema", async () => {
    const { result } = renderHookWithQuery(() => useBusyDays(2026, 3));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const parsed = BusyResponseSchema.safeParse(result.current.data);
    expect(parsed.success).toBe(true);
  });

  it("sends year and month query params", async () => {
    const { result } = renderHookWithQuery(() => useBusyDays(2026, 3));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const call = requestLog.find((r) => r.url.includes("/api/calendar/busy/"));
    expect(call).toBeDefined();

    const url = new URL(call!.url);
    expect(url.searchParams.get("year")).toBe("2026");
    expect(url.searchParams.get("month")).toBe("3");
  });

  // ── Category 2: Call Count ──────────────────────────────────
  it("fires exactly 1 GET for a given month", async () => {
    const { result } = renderHookWithQuery(() => useBusyDays(2026, 3));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const calls = requestLog.filter((r) =>
      r.url.includes("/api/calendar/busy/")
    );
    expect(calls).toHaveLength(1);
  });

  it("does NOT refetch on re-render", async () => {
    const { result, rerender } = renderHookWithQuery(() =>
      useBusyDays(2026, 3)
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender();
    rerender();

    const calls = requestLog.filter((r) =>
      r.url.includes("/api/calendar/busy/")
    );
    expect(calls).toHaveLength(1);
  });

  it("fires a NEW request for a different month", async () => {
    const { result: r1 } = renderHookWithQuery(() => useBusyDays(2026, 3));
    await waitFor(() => expect(r1.current.isSuccess).toBe(true));

    const { result: r2 } = renderHookWithQuery(() => useBusyDays(2026, 4));
    await waitFor(() => expect(r2.current.isSuccess).toBe(true));

    // Two separate query clients = two requests expected
    const calls = requestLog.filter((r) =>
      r.url.includes("/api/calendar/busy/")
    );
    expect(calls).toHaveLength(2);
  });
});

describe("useCalendar — Flow 3: Free Slots", () => {
  // ── Category 1: Schema ──────────────────────────────────────
  it("returns data matching SlotsResponseSchema", async () => {
    const { result } = renderHookWithQuery(() => useFreeSlots("2026-03-06"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const parsed = SlotsResponseSchema.safeParse(result.current.data);
    expect(parsed.success).toBe(true);
  });

  it("sends date as query param", async () => {
    const { result } = renderHookWithQuery(() => useFreeSlots("2026-03-06"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const call = requestLog.find((r) =>
      r.url.includes("/api/calendar/slots/")
    );
    expect(call).toBeDefined();

    const url = new URL(call!.url);
    expect(url.searchParams.get("date")).toBe("2026-03-06");
  });

  it("each slot has start and end ISO strings", async () => {
    const { result } = renderHookWithQuery(() => useFreeSlots("2026-03-06"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    for (const slot of result.current.data as { start: string; end: string; }[]) {
      expect(slot).toHaveProperty("start");
      expect(slot).toHaveProperty("end");
      // Verify they're parseable as dates
      expect(new Date(slot.start).toISOString()).toBeTruthy();
      expect(new Date(slot.end).toISOString()).toBeTruthy();
    }
  });

  // ── Category 2: Call Count ──────────────────────────────────
  it("fires exactly 1 GET per date selection", async () => {
    const { result } = renderHookWithQuery(() => useFreeSlots("2026-03-06"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const calls = requestLog.filter((r) =>
      r.url.includes("/api/calendar/slots/")
    );
    expect(calls).toHaveLength(1);
  });

  it("does NOT fire when dateIso is empty (enabled: false)", async () => {
    const { result } = renderHookWithQuery(() => useFreeSlots(""));

    // Should remain idle — never fires
    expect(result.current.fetchStatus).toBe("idle");

    const calls = requestLog.filter((r) =>
      r.url.includes("/api/calendar/slots/")
    );
    expect(calls).toHaveLength(0);
  });

  it("does NOT refetch same date on re-render", async () => {
    const { result, rerender } = renderHookWithQuery(() =>
      useFreeSlots("2026-03-06")
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender();
    rerender();

    const calls = requestLog.filter((r) =>
      r.url.includes("/api/calendar/slots/")
    );
    expect(calls).toHaveLength(1);
  });
});
