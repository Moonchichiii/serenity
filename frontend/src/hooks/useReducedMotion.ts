import { useSyncExternalStore } from "react";
import {
  onReducedMotionChange,
  prefersReducedMotion,
} from "@/lib/motion/reducedMotion";

/**
 * Reactive prefers-reduced-motion. Updates live if the user flips the
 * OS setting mid-session. Server snapshot is `false` (no motion pref
 * known), which is safe because motion is opt-in per component.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    onReducedMotionChange,
    prefersReducedMotion,
    () => false,
  );
}
