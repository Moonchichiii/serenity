import { describe, expect, it } from "vitest";
import { cmsHydratedQuery } from "@/queries/cms.queries";
import { qk } from "@/lib/queryKeys";

describe("cmsHydratedQuery", () => {
  it("uses the correct query key", () => {
    const opts = cmsHydratedQuery();
    expect(opts.queryKey).toEqual(qk.cmsHydrated());
  });

  it("defines a queryFn", () => {
    const opts = cmsHydratedQuery();
    expect(typeof opts.queryFn).toBe("function");
  });

  it("sets staleTime to 5 minutes", () => {
    const opts = cmsHydratedQuery();
    expect(opts.staleTime).toBe(5 * 60_000);
  });

  it("sets gcTime to 1 hour", () => {
    const opts = cmsHydratedQuery();
    expect(opts.gcTime).toBe(60 * 60_000);
  });
});
