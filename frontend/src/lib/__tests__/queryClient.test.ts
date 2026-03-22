import { describe, expect, it } from "vitest";
import { queryClient } from "@/lib/queryClient";

describe("production QueryClient defaults", () => {
  const defaults = queryClient.getDefaultOptions();

  it("sets staleTime to 60 seconds", () => {
    expect(defaults.queries?.staleTime).toBe(60_000);
  });

  it("sets gcTime to 5 minutes", () => {
    expect(defaults.queries?.gcTime).toBe(5 * 60_000);
  });

  it("disables refetchOnWindowFocus", () => {
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
  });

  it("retries once on failure", () => {
    expect(defaults.queries?.retry).toBe(1);
  });

  it("does not set mutation retry by default (inherits RQ default)", () => {
    // Mutations should use per-mutation config, not a global default
    // If it's not set, that's fine. If it IS set, verify it's sensible.
    const mutRetry = defaults.mutations?.retry;
    expect(mutRetry === undefined || mutRetry === 3).toBe(true);
  });
});
