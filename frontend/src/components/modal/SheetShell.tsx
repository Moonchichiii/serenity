import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type SheetShellProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function SheetShell({
  isOpen,
  onClose,
  title,
  children,
  className,
}: SheetShellProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll
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
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === overlayRef.current) onClose();
            }}
            className="absolute inset-0 bg-sage-deep/60 backdrop-blur-sm"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "relative z-10 h-full w-full bg-porcelain shadow-2xl overflow-hidden flex flex-col",
              "sm:max-w-md md:max-w-lg", // Width constraints
              className,
            )}
          >
            {/* Premium Header */}
            <div className="relative flex items-center justify-between px-6 py-6 bg-sage-deep text-porcelain shrink-0 overflow-hidden">
              {/* Subtle texture in header */}
              <div className="absolute inset-0 opacity-10 pointer-events-none noise-texture" />

              <div className="relative z-10">
                <p className="flex items-center gap-2 text-terracotta-300 text-xs uppercase tracking-[0.15em] font-medium mb-1">
                  {t("shell.brand", "La Serenity Essentials")}
                </p>
                {title && (
                  <h2 className="font-heading text-3xl tracking-tight text-white">
                    {title}
                  </h2>
                )}
              </div>

              <button
                onClick={onClose}
                className="relative z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/90 hover:text-white"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 modal-scroll bg-porcelain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(ui, document.body);
}
