import { AnimatePresence, motion } from "framer-motion";
import { TicketPercent } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useModal } from "@/components/modal";
import { useCMSGlobals } from "@/hooks/useCMS";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
import { getOptimizedCloudinaryUrl } from "@/utils/cloudinary";

export function FloatingGiftButton() {
  const { open } = useModal();
  const { t } = useTranslation();
  const globals = useCMSGlobals();

  if (!globals) return null;

  const enabled = globals.gift?.is_enabled ?? false;
  const icon = globals.gift?.floating_icon ?? null;
  const label = t("gift.trigger", "Offer a Gift");

  return (
    <AnimatePresence>
      {enabled && (
        <motion.button
          key="gift-button"
          type="button"
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => open("gift")}
          className="group fixed bottom-6 right-6 z-40 sm:bottom-10 sm:right-10"
          aria-label={label}
          title={label}
        >
          <span className="sr-only">{label}</span>

          <div className="absolute inset-0 animate-pulse-warm rounded-full bg-terracotta-400 opacity-30" />

          <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white/50 bg-white/90 p-1.5 shadow-elevated backdrop-blur-sm transition-all group-hover:border-terracotta-200 sm:h-18 sm:w-18">
            {icon?.src ? (
              <ResponsiveImage
                image={icon}
                alt=""
                aria-hidden="true"
                className="h-12 w-12 object-contain drop-shadow-sm sm:h-14 sm:w-14"
                sizes="(min-width: 640px) 56px, 48px"
                optimizeWidth={96}
                srcSet={[
                  `${getOptimizedCloudinaryUrl(icon.src, 48)} 48w`,
                  `${getOptimizedCloudinaryUrl(icon.src, 64)} 64w`,
                  `${getOptimizedCloudinaryUrl(icon.src, 96)} 96w`,
                  `${getOptimizedCloudinaryUrl(icon.src, 112)} 112w`,
                ].join(", ")}
              />
            ) : (
              <TicketPercent
                className="h-8 w-8 text-terracotta-500"
                strokeWidth={1.5}
              />
            )}
          </div>

          <span
            className="pointer-events-none absolute right-full top-1/2 mr-4 hidden -translate-x-2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-charcoal/90 px-4 py-2 text-xs font-medium tracking-wide text-white opacity-0 shadow-lg transition-all group-hover:translate-x-0 group-hover:opacity-100 sm:block"
            aria-hidden="true"
          >
            {label}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
