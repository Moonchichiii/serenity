import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquarePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReviewSheet } from "./ReviewSheet";

interface ReviewTriggerProps {
  targetSectionId: string;
}

export function ReviewTrigger({ targetSectionId }: ReviewTriggerProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let intervalId: number | null = null;

    const setupObserver = (): boolean => {
      const targetElement = document.getElementById(targetSectionId);
      if (!targetElement) return false;

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          setIsVisible(!!entry?.isIntersecting);
        },
        {
          threshold: 0.1,
          // Appears slightly before the section fully hits viewport center
          rootMargin: "0px 0px -20% 0px",
        },
      );

      observer.observe(targetElement);
      return true;
    };

    // Try immediately
    if (!setupObserver()) {
      // If the section is lazy-loaded, keep trying until it exists
      intervalId = window.setInterval(() => {
        if (setupObserver() && intervalId !== null) {
          window.clearInterval(intervalId);
          intervalId = null;
        }
      }, 200);
    }

    return () => {
      if (intervalId !== null) window.clearInterval(intervalId);
      observer?.disconnect();
    };
  }, [targetSectionId]);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed right-4 top-1/2 z-40 -translate-y-1/2"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="flex flex-col items-center gap-1 rounded-full bg-sage-600 px-6 py-4 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-sage-700"
              aria-label={t("review.trigger")}
            >
              <MessageSquarePlus className="h-6 w-6" aria-hidden="true" />
              <span className="whitespace-nowrap text-xs font-medium">
                {t("review.trigger")}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ReviewSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
