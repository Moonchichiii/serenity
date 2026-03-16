import { describe, it, expect } from "vitest";
import { ensureHydratedCMS } from "../cms.loader";
import { createTestQueryClient } from "@/test/utils";
import { cmsHydratedFixture } from "@/test/fixtures";

describe("ensureHydratedCMS", () => {
  it("populates the query cache with CMS hydrated data", async () => {
    const queryClient = createTestQueryClient();

    await ensureHydratedCMS(queryClient);

    // The cache should now have the CMS data
    const cached = queryClient.getQueryData(["cms", "hydrated"]);
    expect(cached).toEqual(cmsHydratedFixture);
  });

  it("does not refetch when data is already cached", async () => {
    const queryClient = createTestQueryClient();

    // First call — fetches
    await ensureHydratedCMS(queryClient);
    const first = queryClient.getQueryData(["cms", "hydrated"]);

    // Second call — should reuse cache (ensureQueryData semantics)
    await ensureHydratedCMS(queryClient);
    const second = queryClient.getQueryData(["cms", "hydrated"]);

    expect(first).toBe(second); // same reference
  });
});
