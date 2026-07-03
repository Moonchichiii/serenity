/**
 * prefers-reduced-motion utilities (framework-free).
 * The React hook in src/hooks/useReducedMotion.ts builds on these.
 */

const QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

/** Subscribe to changes. Returns an unsubscribe function. */
export function onReducedMotionChange(
  callback: (reduced: boolean) => void,
): () => void {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => undefined;
  }
  const mq = window.matchMedia(QUERY);
  const handler = (event: MediaQueryListEvent) => callback(event.matches);
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}
