import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  prefersReducedMotion,
  onReducedMotionChange,
} from "../reducedMotion";

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql = {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn(
      (_: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.add(cb);
      },
    ),
    removeEventListener: vi.fn(
      (_: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.delete(cb);
      },
    ),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mql),
  );
  return { mql, listeners };
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("prefersReducedMotion", () => {
  it("returns false when the user has no reduction preference", () => {
    mockMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("returns true when reduce is preferred", () => {
    mockMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
  });
});

describe("onReducedMotionChange", () => {
  it("subscribes and unsubscribes a change listener", () => {
    const { mql, listeners } = mockMatchMedia(false);
    const cb = vi.fn();
    const unsubscribe = onReducedMotionChange(cb);
    expect(mql.addEventListener).toHaveBeenCalledTimes(1);
    expect(listeners.size).toBe(1);

    unsubscribe();
    expect(mql.removeEventListener).toHaveBeenCalledTimes(1);
    expect(listeners.size).toBe(0);
  });
});
