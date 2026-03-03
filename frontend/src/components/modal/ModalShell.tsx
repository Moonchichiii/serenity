import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalShellProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
};

export function ModalShell({
  isOpen,
  onClose,
  title,
  children,
  className,
  scrollable = true,
}: ModalShellProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const ui = (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={overlayRef}
          className="
            fixed inset-0 z-[9999]
            h-[100dvh] w-screen overflow-hidden
            flex flex-col items-center justify-end sm:justify-center
            p-0 sm:p-4
          "
          aria-modal="true"
          role="dialog"
          onMouseDown={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className={cn(
              "relative z-10 flex flex-col overflow-hidden",
              "bg-porcelain border border-warm-grey-200/40",
              "shadow-elevated",
              "w-full sm:w-[92vw]",
              "max-w-lg",
              "max-h-[92dvh] sm:max-h-[85vh]",
              "rounded-t-3xl sm:rounded-3xl",
              className,
            )}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Mobile Drag Handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-warm-grey-300" />
            </div>

            {/* Header */}
            <div
              className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4
                          bg-sand-50/80 backdrop-blur-sm
                          border-b border-warm-grey-200/50 shrink-0"
            >
              {title ? (
                <h2
                  className="font-heading text-charcoal truncate pr-4"
                  style={{
                    fontSize: "var(--typo-h4)",
                    lineHeight: "var(--leading-h4)",
                  }}
                >
                  {title}
                </h2>
              ) : (
                <span />
              )}

              <button
                onClick={onClose}
                className="rounded-xl p-2.5 text-charcoal/40
                           hover:text-charcoal hover:bg-warm-grey-100
                           transition-all duration-200 active:scale-95"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Scroll Container */}
            <div
              className={cn(
                "flex-1 min-h-0 overscroll-contain",
                scrollable
                  ? "overflow-y-auto modal-scroll"
                  : "overflow-hidden",
              )}
            >
              <div className="p-6 sm:p-6 pb-8 sm:pb-6">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(ui, document.body);
}
