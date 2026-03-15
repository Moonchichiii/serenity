import { describe, expect, it } from "vitest";
import { createCheckoutMutationOptions } from "@/queries/payments.mutations";

describe("createCheckoutMutationOptions", () => {
  const opts = createCheckoutMutationOptions();

  it("has the correct mutation key", () => {
    expect(opts.mutationKey).toEqual(["payments", "checkout"]);
  });

  it("defines a mutationFn", () => {
    expect(typeof opts.mutationFn).toBe("function");
  });
});
