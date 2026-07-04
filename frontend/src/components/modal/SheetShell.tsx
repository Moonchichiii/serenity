import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useMountTransition } from "@/hooks/useMountTransition";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ModalId } from "./modalTypes";

type SheetShellProps = {
  isOpen: boolean;
  onClose: () => void;
  modalId?: ModalId;
  children: React.ReactNode;
  className?: string;
};

export function SheetShell({
  isOpen,
  onClose,
  modalId,
  children,
  className,
}: SheetShellProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const title = useMemo(() => {
    if (!modalId) return undefined;

    const modalTitleMap: Partial<Record<ModalId, string>> = {
      gift: t("gift.trigger", "Gift Voucher"),
          booking: t("booking.title", "Book a session"),
      contact: t("contact.form.title", "Contact"),
      corporate: t("corp.subjectPrefix", "Corporate Inquiry"),
      legal: t("footer.legalNotice", "Legal"),
      cmsLogin: t("modal.cmsLogin", "CMS Login"),
    };

    return modalTitleMap[modalId] ?? modalId;
  }, [modalId, t]);

  const headingId = modalId ? `${modalId}-modal-title` : undefined;

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

  const { rendered, open } = useMountTransition(isOpen, 320);

  if (!rendered) return null;

  const ui = (
    <div className="fixed inset-0 z-9999 flex justify-end">
      <div
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
        className={`absolute inset-0 bg-sage-deep/60 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            data-testid={modalId ? `${modalId}-modal` : "modal-shell"}
        className={cn(
          "relative z-10 flex h-full w-full flex-col overflow-hidden bg-porcelain shadow-2xl",
          "sm:max-w-md md:max-w-lg",
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full",
          className,
        )}
      >
            <div className="relative flex items-center justify-between overflow-hidden bg-sage-deep px-6 py-6 text-porcelain shrink-0">
              <div className="noise-texture pointer-events-none absolute inset-0 opacity-10" />

              <div className="relative z-10">
                <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-terracotta-300">
                  {t("shell.brand", "La Serenity Essentials")}
                </p>

                {title && (
                  <h2
                    id={headingId}
                    className="font-heading text-3xl tracking-tight text-white"
                  >
                    {title}
                  </h2>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="relative z-10 rounded-full bg-white/10 p-2 text-white/90 transition-all hover:bg-white/20 hover:text-white"
                aria-label={t("review.close", "Close")}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="modal-scroll flex-1 overflow-y-auto bg-porcelain p-6 md:p-8">
              {children}
            </div>
      </div>
    </div>
  );

  return createPortal(ui, document.body);
}
