import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useMountTransition } from "@/hooks/useMountTransition";
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
  const { rendered, open } = useMountTransition(isOpen, 250);

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

  if (!rendered) return null;

  const ui = (
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
      <div
        data-testid="modal-backdrop"
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onMouseDown={onClose}
      />

      <div
        className={cn(
          "relative z-10 flex flex-col overflow-hidden",
          "bg-porcelain border border-warm-grey-200/40",
          "shadow-elevated",
          "w-full sm:w-[92vw]",
          "max-w-lg",
          "max-h-[92dvh] sm:max-h-[85vh]",
          "rounded-t-3xl sm:rounded-3xl",
          "transition-all duration-200 ease-out motion-reduce:transition-none",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-[0.97] opacity-0",
          className,
        )}
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
      </div>
    </div>
  );

  return createPortal(ui, document.body);
}
