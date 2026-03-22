import { describe, expect, it } from "vitest";
import {
  testimonialsQuery,
  testimonialStatsQuery,
} from "@/queries/testimonials.queries";
import { qk } from "@/lib/queryKeys";

describe("testimonialsQuery", () => {
  it("uses the correct query key with minRating", () => {
    const opts = testimonialsQuery(4);
    expect(opts.queryKey).toEqual(qk.testimonials(4));
  });

  it("defines a queryFn", () => {
    expect(typeof testimonialsQuery(0).queryFn).toBe("function");
  });

  it("sets staleTime to 5 minutes", () => {
    expect(testimonialsQuery(0).staleTime).toBe(5 * 60_000);
  });

  it("sets gcTime to 1 hour", () => {
    expect(testimonialsQuery(0).gcTime).toBe(60 * 60_000);
  });
});

describe("testimonialStatsQuery", () => {
  it("uses the correct query key", () => {
    const opts = testimonialStatsQuery();
    expect(opts.queryKey).toEqual(qk.testimonialStats());
  });

  it("defines a queryFn", () => {
    expect(typeof testimonialStatsQuery().queryFn).toBe("function");
  });

  it("sets staleTime to 5 minutes", () => {
    expect(testimonialStatsQuery().staleTime).toBe(5 * 60_000);
  });
});
