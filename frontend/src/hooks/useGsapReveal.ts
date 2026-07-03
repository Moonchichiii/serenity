import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { loadGsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/reducedMotion";
import { SHUTTER } from "@/lib/motion/config";

/**
 * useGsapReveal — staggered entrance for a section's key elements.
 *
 * Marks: give children `data-reveal` and pass the section ref here.
 * Plays once (not on re-renders or carousel slide changes).
 *
 * `whenVisible: true` defers the entrance until the scope scrolls into
 * view (IntersectionObserver, fires once) — for sections below the fold.
 *
 * Per the V2 GSAP performance rules:
 *  - animations are created inside `gsap.context(..., scope)` and torn
 *    down with `ctx.revert()` on unmount;
 *  - transform/opacity only;
 *  - reduced motion never even loads gsap (stricter than matchMedia:
 *    zero animation JS is fetched at all);
 *  - content is visible by default — hidden only pre-paint when motion
 *    will actually play, with a 4s failsafe restore.
 */

type Options = {
  delay?: number;
  y?: number;
  stagger?: number;
  duration?: number;
  selector?: string;
  /** Defer until the scope enters the viewport (below-fold sections). */
  whenVisible?: boolean;
};

const FAILSAFE_MS = 4000;

export function useGsapReveal(
  scope: RefObject<HTMLElement | null>,
  {
    delay = 0,
    y = SHUTTER.content.y,
    stagger = SHUTTER.content.stagger,
    duration = SHUTTER.content.duration,
    selector = "[data-reveal]",
    whenVisible = false,
  }: Options = {},
): void {
  const playedRef = useRef(false);

  useLayoutEffect(() => {
    if (playedRef.current) return;

    const root = scope.current;
    if (!root || prefersReducedMotion()) {
      playedRef.current = true;
      return;
    }

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (targets.length === 0) {
      playedRef.current = true;
      return;
    }

    /* Hide pre-paint so the entrance never flashes final state first. */
    for (const el of targets) {
      el.style.opacity = "0";
    }

    const restore = () => {
      for (const el of targets) {
        el.style.removeProperty("opacity");
        el.style.removeProperty("transform");
      }
    };

    let killed = false;
    let ctx: { revert: () => void } | null = null;
    let observer: IntersectionObserver | null = null;
    const failsafe = setTimeout(() => {
      if (!playedRef.current) restore();
    }, FAILSAFE_MS);

    const play = () => {
      if (killed || playedRef.current) return;
      playedRef.current = true;
      void loadGsap()
        .then((gsap) => {
          if (killed) return;
          ctx = gsap.context(() => {
            gsap.fromTo(
              targets,
              { y, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration,
                ease: SHUTTER.easeOut,
                stagger,
                delay,
                clearProps: "transform,opacity",
              },
            );
          }, root);
        })
        .catch(restore);
    };

    if (whenVisible && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer?.disconnect();
            play();
          }
        },
        { threshold: 0.15 },
      );
      observer.observe(root);
    } else {
      play();
    }

    return () => {
      killed = true;
      clearTimeout(failsafe);
      observer?.disconnect();
      ctx?.revert();
      restore();
    };
    // Mount-only by design: entrance plays once per section mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
