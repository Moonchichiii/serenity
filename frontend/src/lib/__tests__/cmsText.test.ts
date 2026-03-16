import { describe, it, expect } from "vitest";
import { cmsText } from "../cmsText";

describe("cmsText", () => {
  it("returns the CMS value when it is a non-empty string", () => {
    expect(cmsText("Hello World", "fallback")).toBe("Hello World");
  });

  it("returns fallback for empty string", () => {
    expect(cmsText("", "fallback")).toBe("fallback");
  });

  it("returns fallback for whitespace-only string", () => {
    expect(cmsText("   ", "fallback")).toBe("fallback");
  });

  it("returns fallback for null", () => {
    expect(cmsText(null, "fallback")).toBe("fallback");
  });

  it("returns fallback for undefined", () => {
    expect(cmsText(undefined, "fallback")).toBe("fallback");
  });

  it("returns fallback for non-string values (number)", () => {
    expect(cmsText(42, "fallback")).toBe("fallback");
  });

  it("returns fallback for boolean", () => {
    expect(cmsText(true, "fallback")).toBe("fallback");
  });
});
