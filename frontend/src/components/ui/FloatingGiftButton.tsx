import { useTranslation } from "react-i18next";

import { useModal } from "@/components/modal";
import { useCMSGlobals } from "@/hooks/useCMS";
import { useMountTransition } from "@/hooks/useMountTransition";

/**
 * FloatingGiftButton — the prototype's honey badge.
 *
 * A round honey disc with the italic "Offrir / un bon cadeau →" wordmark
 * (i18n FR/EN), replacing the white icon bubble. Same behaviour: shown
 * only when gifts are enabled in the CMS, mount/unmount via the shared
 * CSS transition, opens the gift modal. Note: the CMS floating icon is
 * intentionally no longer rendered — the badge is typographic.
 */
export function FloatingGiftButton() {
  const { open } = useModal();
  const { t } = useTranslation();
  const globals = useCMSGlobals();

  const enabled = globals?.gift?.is_enabled ?? false;
  const { rendered, open: shown } = useMountTransition(enabled, 300);

  if (!globals || !rendered) return null;

  const label = t("gift.trigger", "Offer a Gift");

  return (
    <button
      type="button"
      onClick={() => open("gift")}
      aria-label={label}
      title={label}
      className={`group fixed bottom-5 right-5 z-40 flex h-20 w-20 items-center justify-center rounded-full bg-honey-300 text-sage-950 shadow-elevated transition-all duration-300 ease-out will-change-transform hover:-rotate-6 hover:scale-105 active:scale-95 motion-reduce:transition-none sm:bottom-10 sm:right-10 sm:h-28 sm:w-28 ${
        shown ? "scale-100 opacity-100" : "scale-0 opacity-0"
      }`}
    >
      <span className="pointer-events-none flex flex-col items-center leading-tight">
        <span
          className="font-heading italic"
          style={{ fontSize: "var(--typo-h4)" }}
        >
          {t("gift.badge.title", "Offrir")}
        </span>
        <span
          className="mt-1 uppercase"
          style={{
            fontSize: "0.5625rem",
            letterSpacing: "0.14em",
          }}
        >
          {t("gift.badge.sub", "un bon cadeau")}
          <span aria-hidden="true"> →</span>
        </span>
      </span>
    </button>
  );
}
