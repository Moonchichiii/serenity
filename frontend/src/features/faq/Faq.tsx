import { useState, useCallback, useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
  type Transition,
} from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";

import { useCMSPage } from "@/hooks/useCMS";
import { useModal } from "@/components/modal";
import { getLocalizedText } from "@/lib/localize";
import { cn } from "@/lib/utils";

// ── Constants ────────────────────────────────────────────────────────
const FADE_IN_TRANSITION: Transition = {
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1],
};

const SECTION_ENTRANCE: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: FADE_IN_TRANSITION },
};

const ITEM_STAGGER: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const ITEM_ENTRANCE: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

const ANSWER_VARIANTS: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.15 },
    },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.25, delay: 0.1 },
    },
  },
};

type SupportedLang = "fr" | "en";

// ── Types ────────────────────────────────────────────────────────────
interface CmsFaqItem {
  id: number;
  question_en?: string;
  question_fr?: string;
  answer_en?: string;
  answer_fr?: string;
}

interface ResolvedFaq {
  id: number;
  question: string;
  answer: string;
}

// ── Fallback FAQ data ────────────────────────────────────────────────
const FALLBACK_KEYS = [
  "faq.items.booking",
  "faq.items.whatToExpect",
  "faq.items.cancellation",
  "faq.items.corporate",
  "faq.items.duration",
  "faq.items.contraindications",
] as const;

function buildFallbackFaqs(
  t: (key: string) => string,
): ResolvedFaq[] {
  return FALLBACK_KEYS.map((key, i) => ({
    id: i + 1,
    question: t(`${key}.question`),
    answer: t(`${key}.answer`),
  })).filter((f) => f.question && f.answer);
}

// ── Utilities ────────────────────────────────────────────────────────
function resolveLang(language: string): SupportedLang {
  return language.startsWith("fr") ? "fr" : "en";
}

function resolveFaqItems(
  raw: CmsFaqItem[],
  lang: SupportedLang,
): ResolvedFaq[] {
  return raw
    .map((item) => ({
      id: item.id,
      question: getLocalizedText(item, "question", lang),
      answer: getLocalizedText(item, "answer", lang),
    }))
    .filter(
      (f) =>
        f.question.trim().length > 0 && f.answer.trim().length > 0,
    );
}

/** Zero-pad a number to two digits. */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// ── Hooks ────────────────────────────────────────────────────────────
function useResolvedFaqs(): {
  surtitle: string;
  title: string;
  items: ResolvedFaq[];
} | null {
  const { t, i18n } = useTranslation();
  const page = useCMSPage();
  const lang = resolveLang(i18n.language);

  return useMemo(() => {
    const surtitle = t("faq.surtitle", {
      defaultValue: "Have questions?",
    });
    const title = t("faq.title", { defaultValue: "FAQs" });

    const cmsFaqs: CmsFaqItem[] = (page as any)?.faq_items ?? [];
    const items =
      cmsFaqs.length > 0
        ? resolveFaqItems(cmsFaqs, lang)
        : buildFallbackFaqs(t);

    if (items.length === 0) return null;

    return { surtitle, title, items };
  }, [page, lang, t]);
}

function useAccordion() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = useCallback(
    (id: number) =>
      setOpenId((prev) => (prev === id ? null : id)),
    [],
  );

  return { openId, toggle } as const;
}

// ── Sub-components ───────────────────────────────────────────────────

const FaqItem: FC<{
  item: ResolvedFaq;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  variants: Variants | undefined;
  reduceMotion: boolean | null;
}> = ({ item, index, isOpen, onToggle, variants, reduceMotion }) => (
  <motion.div variants={variants} className="border-b border-warm-grey-200">
    <button
      type="button"
      id={`faq-trigger-${item.id}`}
      aria-expanded={isOpen}
      aria-controls={`faq-panel-${item.id}`}
      onClick={onToggle}
      className="group flex w-full items-center gap-6 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 sm:gap-10 md:py-7"
    >
      {/* Number */}
      <span className="shrink-0 text-sm font-medium text-warm-grey-400 tabular-nums">
        {pad(index + 1)}
      </span>

      {/* Question */}
      <span
        className={cn(
          "flex-1 font-serif text-lg font-medium transition-colors duration-200 sm:text-xl md:text-[1.35rem]",
          isOpen
            ? "text-charcoal"
            : "text-charcoal/80 group-hover:text-charcoal",
        )}
      >
        {item.question}
      </span>

      {/* Icon */}
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center transition-colors duration-200",
          isOpen
            ? "text-charcoal"
            : "text-warm-grey-400 group-hover:text-charcoal",
        )}
      >
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.25, ease: "easeInOut" }
          }
        >
          <ArrowUpRight className="h-5 w-5" />
        </motion.span>
      </span>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key={`panel-${item.id}`}
          id={`faq-panel-${item.id}`}
          role="region"
          aria-labelledby={`faq-trigger-${item.id}`}
          variants={reduceMotion ? undefined : ANSWER_VARIANTS}
          initial="collapsed"
          animate="expanded"
          exit="collapsed"
          className="overflow-hidden"
        >
          <div className="pb-7 pl-[calc(theme(spacing.6)+theme(fontSize.sm))] sm:pl-[calc(theme(spacing.10)+theme(fontSize.sm))]">
            <p className="max-w-2xl text-base leading-relaxed text-warm-grey-500">
              {item.answer}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const ContactCta: FC<{
  onContact: () => void;
  reduceMotion: boolean | null;
}> = ({ onContact, reduceMotion }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }
      }
      className="mt-14 flex flex-col items-center gap-2 border-t border-warm-grey-200 pt-10 text-center md:mt-16"
    >
      <p className="text-sm text-warm-grey-400">
        {t("faq.cta.title", {
          defaultValue: "Can't find your answer?",
        })}
      </p>
      <button
        type="button"
        onClick={onContact}
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-charcoal transition-colors duration-200 hover:text-sage-700"
      >
        {t("faq.cta.button", { defaultValue: "Get in touch" })}
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
    </motion.div>
  );
};

// ── Main component ───────────────────────────────────────────────────
export const Faq: FC = () => {
  const { t } = useTranslation();
  const { open } = useModal();
  const reduceMotion = useReducedMotion();
  const content = useResolvedFaqs();
  const { openId, toggle } = useAccordion();

  const listVariants = reduceMotion ? undefined : ITEM_STAGGER;
  const itemVariants = reduceMotion ? undefined : ITEM_ENTRANCE;

  const openContact = useCallback(
    () =>
      open("contact", {
        defaultSubject: t("faq.cta.subject", {
          defaultValue: "Question",
        }),
      }),
    [open, t],
  );

  if (!content) return null;

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="section-spacious relative overflow-hidden bg-tint-cream"
    >
      <div className="container relative z-10 mx-auto px-6 sm:px-8 md:px-12 lg:px-20">
        {/* Header — left-aligned */}
        <motion.div
          variants={reduceMotion ? undefined : SECTION_ENTRANCE}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-12 md:mb-16"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-warm-grey-400">
            {content.surtitle}
          </p>
          <h2
            id="faq-heading"
            className="font-serif text-5xl font-bold text-charcoal sm:text-6xl md:text-7xl"
          >
            {content.title}
          </h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="mx-auto max-w-4xl border-t border-warm-grey-200"
        >
          {content.items.map((item, idx) => (
            <FaqItem
              key={item.id}
              item={item}
              index={idx}
              isOpen={openId === item.id}
              onToggle={() => toggle(item.id)}
              variants={itemVariants}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>

        {/* Contact CTA */}
        <ContactCta
          onContact={openContact}
          reduceMotion={reduceMotion}
        />
      </div>
    </section>
  );
};
