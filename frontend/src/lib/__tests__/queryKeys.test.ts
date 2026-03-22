import { describe, expect, it } from "vitest";
import { qk } from "@/lib/queryKeys";

describe("queryKeys (qk)", () => {
  it("cmsHydrated returns stable key", () => {
    expect(qk.cmsHydrated()).toEqual(["cms", "hydrated"]);
    // Referential stability across calls
    expect(qk.cmsHydrated()).toEqual(qk.cmsHydrated());
  });

  it("calendarBusy includes year and month", () => {
    expect(qk.calendarBusy(2026, 3)).toEqual([
      "calendar",
      "busy",
      2026,
      3,
    ]);
  });

  it("calendarBusy produces different keys for different months", () => {
    expect(qk.calendarBusy(2026, 3)).not.toEqual(
      qk.calendarBusy(2026, 4)
    );
  });

  it("calendarSlots includes the ISO date", () => {
    expect(qk.calendarSlots("2026-03-06")).toEqual([
      "calendar",
      "slots",
      "2026-03-06",
    ]);
  });

  it("testimonials includes minRating", () => {
    expect(qk.testimonials(4)).toEqual(["testimonials", "list", 4]);
  });

  it("testimonials with different ratings produce different keys", () => {
    expect(qk.testimonials(3)).not.toEqual(qk.testimonials(5));
  });

  it("testimonialStats returns stable key", () => {
    expect(qk.testimonialStats()).toEqual(["testimonials", "stats"]);
  });

  it("no key collisions between domains", () => {
    const keys = [
      qk.cmsHydrated(),
      qk.calendarBusy(2026, 3),
      qk.calendarSlots("2026-03-06"),
      qk.testimonials(0),
      qk.testimonialStats(),
    ];

    const serialized = keys.map((k) => JSON.stringify(k));
    const unique = new Set(serialized);
    expect(unique.size).toBe(keys.length);
  });
});
