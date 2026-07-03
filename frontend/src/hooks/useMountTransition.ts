import { useEffect, useState } from "react";

/**
 * useMountTransition — CSS enter/exit for conditionally rendered UI
 * (modals, sheets, floating buttons). The framer-motion
 * AnimatePresence replacement used across the app.
 *
 *   const { rendered, open } = useMountTransition(isOpen);
 *   if (!rendered) return null;
 *   <div className={open ? "opacity-100" : "opacity-0"} ... />
 *
 * Sequence in: mount closed → double rAF → `open` flips → CSS
 * transitions run. Sequence out: `open` flips off → CSS exit plays →
 * unmount after `closeMs` (timeout, so reduced-motion — where
 * transitions are disabled — still unmounts reliably).
 *
 * All state updates are deferred through rAF/timeout: lint-safe under
 * react-hooks v7 and never triggers cascading synchronous renders.
 */
export function useMountTransition(
  isOpen: boolean,
  closeMs = 300,
): { rendered: boolean; open: boolean } {
  const [rendered, setRendered] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    if (isOpen) {
      raf1 = requestAnimationFrame(() => {
        setRendered(true);
        raf2 = requestAnimationFrame(() => {
          raf2 = requestAnimationFrame(() => setOpen(true));
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    raf1 = requestAnimationFrame(() => setOpen(false));
    const unmount = setTimeout(() => setRendered(false), closeMs + 100);
    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(unmount);
    };
  }, [isOpen, closeMs]);

  return { rendered, open };
}
