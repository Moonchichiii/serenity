import type { gsap } from "gsap";

/**
 * Lazy GSAP loader.
 *
 * GSAP must never sit in the critical bundle: the first import happens on
 * demand (arrival reveal or first shutter navigation) and resolves once —
 * subsequent calls reuse the same promise. Components must always be able
 * to render without GSAP; animation is an enhancement, not a requirement.
 *
 * The `import type` above is erased at compile time, so the only runtime
 * reference to gsap is the dynamic import below — Vite splits it into its
 * own chunk automatically.
 */

export type GsapCore = typeof gsap;

let gsapPromise: Promise<GsapCore> | null = null;

export function loadGsap(): Promise<GsapCore> {
  gsapPromise ??= import("gsap").then((mod) => mod.gsap);
  return gsapPromise;
}
