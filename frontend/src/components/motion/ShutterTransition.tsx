/* eslint-disable react-refresh/only-export-components -- context module: provider + hook belong together */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { SHUTTER, slatCountFor } from "@/lib/motion/config";
import { loadGsap } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * ShutterTransition — the La Serenity V2 signature.
 *
 * A full-viewport overlay of vertical slats in two tones: cream sweeps
 * first like a flash of light, deep forest follows; on reveal the forest
 * retracts and cream trails as an afterglow. "Volets qui s'ouvrent."
 *
 * Design rules honoured here:
 *  - GSAP is lazy-loaded; the page never depends on it to function.
 *  - prefers-reduced-motion (live) skips all slat animation entirely.
 *  - transform-only animation: no layout writes, no CLS.
 *  - every timeline is killed on unmount; a failsafe force-hides the
 *    overlay if anything (network, gsap import) hangs.
 */

type ShutterContextValue = {
  /**
   * Play cover → run the action (typically a typed router.navigate call
   * made at the call-site) → play reveal. Under reduced motion the action
   * simply runs with no overlay.
   */
  run: (action: () => void | Promise<unknown>) => Promise<void>;
  isTransitioning: boolean;
};

const ShutterContext = createContext<ShutterContextValue | null>(null);

export function useShutter(): ShutterContextValue {
  const ctx = useContext(ShutterContext);
  if (!ctx) {
    throw new Error("useShutter must be used inside <ShutterProvider>");
  }
  return ctx;
}

type Props = {
  children: ReactNode;
  /** Play the first-load arrival reveal. Defaults to true. */
  arrival?: boolean;
};

export function ShutterProvider({ children, arrival = true }: Props) {
  const reduced = useReducedMotion();
  const [slats, setSlats] = useState(() =>
    slatCountFor(typeof window !== "undefined" ? window.innerWidth : 1280),
  );
  // Overlay starts covered only when an arrival reveal will actually play.
  const [covered, setCovered] = useState(arrival && !reduced);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const creamRef = useRef<HTMLDivElement>(null);
  const forestRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const killersRef = useRef<Array<() => void>>([]);

  const registerKiller = (kill: () => void) => {
    killersRef.current.push(kill);
  };

  /* Rebuild slat count on resize (debounced, never mid-transition). */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      if (busyRef.current) return;
      clearTimeout(timer);
      timer = setTimeout(() => setSlats(slatCountFor(window.innerWidth)), 180);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* Kill any live timelines on unmount. */
  useEffect(
    () => () => {
      killersRef.current.forEach((kill) => kill());
      killersRef.current = [];
    },
    [],
  );

  /* First-load arrival: page is revealed behind retracting slats. */
  useEffect(() => {
    if (!arrival || reduced || !covered) return;

    let cancelled = false;
    const failsafe = setTimeout(() => setCovered(false), SHUTTER.failsafeMs);

    void loadGsap()
      .then((gsap) => {
        if (cancelled) return;
        const cream = creamRef.current?.children;
        const forest = forestRef.current?.children;
        if (!cream || !forest) {
          setCovered(false);
          return;
        }
        const a = SHUTTER.arrival;
        gsap.set([cream, forest], { scaleY: 1, transformOrigin: "50% 100%" });
        const tl = gsap.timeline({
          delay: a.delay,
          onComplete: () => {
            clearTimeout(failsafe);
            setCovered(false);
          },
        });
        registerKiller(() => tl.kill());
        tl.to(forest, {
          scaleY: 0,
          duration: a.duration,
          ease: SHUTTER.ease,
          stagger: a.stagger,
        }).to(
          cream,
          {
            scaleY: 0,
            duration: a.duration,
            ease: SHUTTER.ease,
            stagger: a.stagger,
          },
          `<${a.followLag}`,
        );
      })
      .catch(() => setCovered(false));

    return () => {
      cancelled = true;
      clearTimeout(failsafe);
    };
    // Intentionally mount-only: arrival plays once per app load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = useCallback(
    async (action: () => void | Promise<unknown>) => {
      /* Reduced motion, or a transition already in flight: just act. */
      if (reduced || busyRef.current) {
        await action();
        return;
      }

      busyRef.current = true;
      setIsTransitioning(true);
      setCovered(true);

      const finish = () => {
        busyRef.current = false;
        setIsTransitioning(false);
        setCovered(false);
      };
      const failsafe = setTimeout(finish, SHUTTER.failsafeMs);

      try {
        const gsap = await loadGsap();
        const cream = creamRef.current?.children;
        const forest = forestRef.current?.children;
        if (!cream || !forest) {
          await action();
          return;
        }

        const c = SHUTTER.cover;
        const r = SHUTTER.reveal;

        /* COVER — cream leads, forest follows. */
        gsap.set([cream, forest], { scaleY: 0, transformOrigin: "50% 0%" });
        await new Promise<void>((resolve) => {
          const tl = gsap.timeline({ onComplete: resolve });
          registerKiller(() => tl.kill());
          tl.to(cream, {
            scaleY: 1,
            duration: c.duration,
            ease: SHUTTER.ease,
            stagger: c.stagger,
          }).to(
            forest,
            {
              scaleY: 1,
              duration: c.duration,
              ease: SHUTTER.ease,
              stagger: c.stagger,
            },
            c.followLag,
          );
        });

        /* Swap happens fully hidden behind the shutter. */
        await action();
        window.scrollTo(0, 0);

        /* REVEAL — forest retracts, cream trails. */
        await new Promise<void>((resolve) => {
          const tl = gsap.timeline({
            delay: r.holdBefore,
            onComplete: resolve,
          });
          registerKiller(() => tl.kill());
          gsap.set([cream, forest], { transformOrigin: "50% 100%" });
          tl.to(forest, {
            scaleY: 0,
            duration: r.duration,
            ease: SHUTTER.ease,
            stagger: r.stagger,
          }).to(
            cream,
            {
              scaleY: 0,
              duration: r.duration,
              ease: SHUTTER.ease,
              stagger: r.stagger,
            },
            `<${r.followLag}`,
          );
        });
      } catch {
        /* GSAP unavailable — degrade to an instant, functional swap. */
        await action();
      } finally {
        clearTimeout(failsafe);
        finish();
      }
    },
    [reduced],
  );

  const value = useMemo(() => ({ run, isTransitioning }), [run, isTransitioning]);

  const slatIndexes = useMemo(
    () => Array.from({ length: slats }, (_, i) => i),
    [slats],
  );

  return (
    <ShutterContext.Provider value={value}>
      {children}
      <div
        aria-hidden="true"
        data-testid="shutter-overlay"
        className="pointer-events-none fixed inset-0 z-[100]"
        style={{ display: covered || isTransitioning ? "block" : "none" }}
      >
        <div ref={creamRef} className="absolute inset-0 flex">
          {slatIndexes.map((i) => (
            <div
              key={`c-${i}`}
              className="h-full flex-1 will-change-transform"
              style={{
                backgroundColor: "var(--color-cream, #f5f0e7)",
                transform: covered && !isTransitioning ? "scaleY(1)" : "scaleY(0)",
              }}
            />
          ))}
        </div>
        <div ref={forestRef} className="absolute inset-0 flex">
          {slatIndexes.map((i) => (
            <div
              key={`f-${i}`}
              className="h-full flex-1 will-change-transform"
              style={{
                backgroundColor: "var(--color-sage-950, #182b25)",
                transform: covered && !isTransitioning ? "scaleY(1)" : "scaleY(0)",
              }}
            />
          ))}
        </div>
      </div>
    </ShutterContext.Provider>
  );
}
