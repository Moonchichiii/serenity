import { describe, it, expect } from "vitest";
import { SHUTTER, slatCountFor } from "../config";

describe("slatCountFor", () => {
  it("uses 6 slats on phones", () => {
    expect(slatCountFor(375)).toBe(6);
    expect(slatCountFor(639)).toBe(6);
  });

  it("uses 8 slats on tablets", () => {
    expect(slatCountFor(640)).toBe(8);
    expect(slatCountFor(1099)).toBe(8);
  });

  it("uses 11 slats on desktop", () => {
    expect(slatCountFor(1100)).toBe(11);
    expect(slatCountFor(1920)).toBe(11);
  });
});

describe("SHUTTER preset", () => {
  it("keeps a full route transition under ~1.5s on desktop", () => {
    const slats = slatCountFor(1440);
    const cover =
      SHUTTER.cover.followLag +
      SHUTTER.cover.duration +
      (slats - 1) * SHUTTER.cover.stagger;
    const reveal =
      SHUTTER.reveal.holdBefore +
      SHUTTER.reveal.followLag +
      SHUTTER.reveal.duration +
      (slats - 1) * SHUTTER.reveal.stagger;
    expect(cover + reveal).toBeLessThan(1.5);
  });

  it("has a failsafe ceiling above the longest possible timeline", () => {
    expect(SHUTTER.failsafeMs).toBeGreaterThan(1500);
  });
});
