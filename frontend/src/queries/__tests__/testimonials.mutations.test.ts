import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  submitTestimonialMutationOptions,
  replyToTestimonialMutationOptions,
} from "@/queries/testimonials.mutations";

describe("submitTestimonialMutationOptions", () => {
  const qc = new QueryClient();
  const opts = submitTestimonialMutationOptions(qc);

  it("has the correct mutation key", () => {
    expect(opts.mutationKey).toEqual(["testimonials", "submit"]);
  });

  it("defines a mutationFn", () => {
    expect(typeof opts.mutationFn).toBe("function");
  });

  it("defines an onSuccess callback", () => {
    expect(typeof opts.onSuccess).toBe("function");
  });
});

describe("replyToTestimonialMutationOptions", () => {
  const qc = new QueryClient();
  const opts = replyToTestimonialMutationOptions(qc);

  it("has the correct mutation key", () => {
    expect(opts.mutationKey).toEqual(["testimonials", "reply"]);
  });

  it("defines a mutationFn", () => {
    expect(typeof opts.mutationFn).toBe("function");
  });

  it("defines an onSuccess callback", () => {
    expect(typeof opts.onSuccess).toBe("function");
  });
});
