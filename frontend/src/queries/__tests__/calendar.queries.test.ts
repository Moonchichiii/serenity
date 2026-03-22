import { describe, expect, it } from "vitest";
import { busyDaysQuery, slotsQuery } from "@/queries/calendar.queries";
import { qk } from "@/lib/queryKeys";

describe("busyDaysQuery", () => {
  it("uses the correct query key with year/month", () => {
    const opts = busyDaysQuery(2026, 3);
    expect(opts.queryKey).toEqual(qk.calendarBusy(2026, 3));
  });

  it("defines a queryFn", () => {
    expect(typeof busyDaysQuery(2026, 3).queryFn).toBe("function");
  });

  it("sets staleTime to 5 minutes", () => {
    expect(busyDaysQuery(2026, 3).staleTime).toBe(5 * 60_000);
  });

  it("sets gcTime to 1 hour", () => {
    expect(busyDaysQuery(2026, 3).gcTime).toBe(60 * 60_000);
  });

  it("produces different keys for different months", () => {
    expect(busyDaysQuery(2026, 3).queryKey).not.toEqual(
      busyDaysQuery(2026, 4).queryKey
    );
  });
});

describe("slotsQuery", () => {
  it("uses the correct query key with date", () => {
    const opts = slotsQuery("2026-03-06");
    expect(opts.queryKey).toEqual(qk.calendarSlots("2026-03-06"));
  });

  it("defines a queryFn", () => {
    expect(typeof slotsQuery("2026-03-06").queryFn).toBe("function");
  });

  it("sets staleTime to 1 minute", () => {
    expect(slotsQuery("2026-03-06").staleTime).toBe(60_000);
  });

  it("sets gcTime to 30 minutes", () => {
    expect(slotsQuery("2026-03-06").gcTime).toBe(30 * 60_000);
  });
});
