/**
 * Motion presets for the La Serenity V2 shutter transition.
 *
 * Single source of truth for timing so desktop/mobile stay in sync and
 * future presets ("soft", "snappy") become one-line changes. All values
 * were tuned against the approved prototype (2026-07-02): fast but calm,
 * power3.inOut throughout.
 */

export const SHUTTER = {
  /** Cover: slats sweep down, cream leads as a flash of light. */
  cover: { duration: 0.3, stagger: 0.03, followLag: 0.07 },
  /** Reveal: forest retracts upward first, cream trails as afterglow. */
  reveal: { duration: 0.38, stagger: 0.03, followLag: 0.07, holdBefore: 0.04 },
  /** Content entrance after reveal starts. */
  content: { duration: 0.55, stagger: 0.06, delay: 0.2, y: 26 },
  /** First-load arrival (slightly softer than route changes). */
  arrival: { duration: 0.5, stagger: 0.04, followLag: 0.08, delay: 0.1 },
  ease: "power3.inOut",
  easeOut: "power3.out",
  /** Hard ceiling — overlay force-hides if anything hangs (network, gsap). */
  failsafeMs: 2500,
} as const;

/** Fewer slats on small screens keeps mobile light and fast. */
export function slatCountFor(viewportWidth: number): number {
  if (viewportWidth < 640) return 6;
  if (viewportWidth < 1100) return 8;
  return 11;
}
