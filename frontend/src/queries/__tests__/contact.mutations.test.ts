import { describe, expect, it } from "vitest";
import { submitContactMutationOptions } from "@/queries/contact.mutations";

describe("submitContactMutationOptions", () => {
  const opts = submitContactMutationOptions();

  it("has the correct mutation key", () => {
    expect(opts.mutationKey).toEqual(["contact", "submit"]);
  });

  it("defines a mutationFn", () => {
    expect(typeof opts.mutationFn).toBe("function");
  });
});
