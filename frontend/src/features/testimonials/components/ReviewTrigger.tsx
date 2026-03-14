import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquarePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReviewSheet } from "./ReviewSheet";

interface ReviewTriggerProps {
  targetSectionId: string;
  hideSectionId?: string;
}

export function ReviewTrigger({
  targetSectionId,
  hideSectionId,
}: ReviewTriggerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isInTargetSection, setIsInTargetSection] = useState(false);
  const [isInHideSection, setIsInHideSection] = useState(false);

  const isVisible = useMemo(
    () => isInTargetSection && !isInHideSection,
    [isInTargetSection, isInHideSection],
  );

  useEffect(() => {
    let targetObserver: IntersectionObserver | null = null;
    let hideObserver: IntersectionObserver | null = null;
    let intervalId: number | null = null;

    const setupObservers = (): boolean => {
      const targetElement = document.getElementById(targetSectionId);
      const hideElement = hideSectionId
        ? document.getElementById(hideSectionId)
        : null;

      if (!targetElement) return false;
      if (hideSectionId && !hideElement) return false;

      targetObserver?.disconnect();
      hideObserver?.disconnect();

      targetObserver = new IntersectionObserver(
        ([entry]) => {
          setIsInTargetSection(!!entry?.isIntersecting);
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -20% 0px",
        },
      );

      targetObserver.observe(targetElement);

      if (hideElement) {
        hideObserver = new IntersectionObserver(
          ([entry]) => {
            setIsInHideSection(!!entry?.isIntersecting);
          },
          {
            threshold: 0.05,
            rootMargin: "0px 0px -10% 0px",
          },
        );

        hideObserver.observe(hideElement);
      }

      return true;
    };

    if (!setupObservers()) {
      intervalId = window.setInterval(() => {
        if (setupObservers() && intervalId !== null) {
          window.clearInterval(intervalId);
          intervalId = null;
        }
      }, 200);
    }

    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      targetObserver?.disconnect();
      hideObserver?.disconnect();
    };
  }, [targetSectionId, hideSectionId]);

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
              type="button"
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
