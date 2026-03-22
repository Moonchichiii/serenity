import { useEffect } from "react";
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
          className="
            fixed inset-0 z-9999
            h-dvh w-screen overflow-hidden
            flex flex-col items-center justify-end sm:justify-center
            p-0 sm:p-4
          "
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            data-testid="modal-backdrop"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={onClose}
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
            <div className="relative flex items-center justify-between px-5 sm:px-6 py-5 bg-sage-deep text-porcelain shrink-0 overflow-hidden">
              {/* Subtle texture */}
              <div className="absolute inset-0 opacity-10 pointer-events-none noise-texture" />

              <div className="relative z-10">
                {title ? (
                  <h2 className="font-heading text-2xl sm:text-3xl tracking-tight text-white">
                    {title}
                  </h2>
                ) : (
                  <span />
                )}
              </div>

              <button
                onClick={onClose}
                className="relative z-10 p-2 rounded-full
                           bg-white/10 hover:bg-white/20
                           transition-all text-white/90 hover:text-white
                           active:scale-95"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
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
              <div className="p-6 sm:p-6 pb-8 sm:pb-6">{children}</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(ui, document.body);
}
