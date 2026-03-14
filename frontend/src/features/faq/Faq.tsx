import {
  useMemo,
  useState,
  useCallback,
  lazy,
  Suspense,
  type FC,
} from "react";
import { useTranslation } from "react-i18next";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { ChevronDown, MapPin } from "lucide-react";

import { useCMSPage, useCMSGlobals } from "@/hooks/useCMS";
import { cmsText } from "@/lib/cmsText";
import { cn } from "@/lib/utils";

// ── Lazy imports ─────────────────────────────────────────────────────
const LocationMap = lazy(() =>
  import("@/components/ui/LocationMap").then((m) => ({
    default: m.LocationMap,
  }))
);

// ── Constants ────────────────────────────────────────────────────────
const FADE_TRANSITION: Transition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1],
};

const EXPAND_TRANSITION: Transition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1],
};

// ── Types ────────────────────────────────────────────────────────────
interface FaqItem {
  question: string;
  answer: string;
}

type SupportedLang = "fr" | "en";

// ── Utilities ────────────────────────────────────────────────────────
function resolveLang(language: string): SupportedLang {
  return language.startsWith("fr") ? "fr" : "en";
}

function pickLocalized<T>(lang: SupportedLang, fr: T, en: T): T {
  return lang === "fr" ? fr : en;
}

function stripHtml(html?: string | null): string {
  if (!html) return "";
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent ?? el.innerText ?? "";
}

// ── Sub-components ───────────────────────────────────────────────────
const MapFallback: FC = () => (
  <div className="h-[200px] w-full animate-pulse rounded-2xl bg-sand-100" />
);

const AccordionItem: FC<{
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  reduceMotion: boolean | null;
}> = ({ item, index, isOpen, onToggle, reduceMotion }) => (
  <div
    className={cn(
      "border-b border-warm-grey-200/50 transition-colors",
      isOpen && "bg-white/30"
    )}
  >
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 text-left"
      style={{
        paddingTop: "var(--space-card-gap)",
        paddingBottom: "var(--space-card-gap)",
      }}
      aria-expanded={isOpen}
      aria-controls={`faq-answer-${index}`}
      id={`faq-question-${index}`}
    >
      <span
        className="font-medium text-charcoal"
        style={{
          fontSize: "var(--typo-body)",
          lineHeight: "var(--leading-body)",
        }}
      >
        {item.question}
      </span>
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-warm-grey-400 transition-transform duration-300",
          isOpen && "rotate-180"
        )}
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          id={`faq-answer-${index}`}
          role="region"
          aria-labelledby={`faq-question-${index}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={reduceMotion ? { duration: 0 } : EXPAND_TRANSITION}
          className="overflow-hidden"
        >
          <p
            className="text-warm-grey-500"
            style={{
              paddingBottom: "var(--space-card-gap)",
              fontSize: "var(--typo-small)",
              lineHeight: "var(--leading-small)",
            }}
          >
            {item.answer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ── Hook: CMS FAQ data ───────────────────────────────────────────────
function useFaqContent() {
  const { t, i18n } = useTranslation();
  const cmsData = useCMSPage();
  const globals = useCMSGlobals();
  const lang = resolveLang(i18n.language);

  return useMemo(() => {
    if (!cmsData) return null;

    const pick = <T,>(fr: T, en: T): T => pickLocalized(lang, fr, en);
    const txt = (fr: unknown, en: unknown, fb: string): string =>
      cmsText(pick(fr, en) as string | undefined, fb);

    const title = txt(
      cmsData.faq_title_fr,
      cmsData.faq_title_en,
      t("faq.title")
    );

    const subtitle = txt(
      cmsData.faq_subtitle_fr,
      cmsData.faq_subtitle_en,
      t("faq.subtitle")
    );

    const items: FaqItem[] = [];
    for (let i = 1; i <= 8; i++) {
      const qKey = `faq_q${i}_${lang}` as keyof typeof cmsData;
      const aKey = `faq_a${i}_${lang}` as keyof typeof cmsData;
      const q = stripHtml(cmsData[qKey] as string) || t(`faq.q${i}`);
      const a = stripHtml(cmsData[aKey] as string) || t(`faq.a${i}`);
      if (q && a) items.push({ question: q, answer: a });
    }

    const address =
      globals?.site?.address_full?.trim() || t("footer.addressFull");

    return { title, subtitle, items, address };
  }, [cmsData, globals, lang, t]);
}

// ── Main component ──────────────────────────────────────────────────
export const Faq: FC = () => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const content = useFaqContent();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback(
    (i: number) => setOpenIndex((prev) => (prev === i ? null : i)),
    []
  );

  if (!content) return null;

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-white"
      style={{
        paddingTop: "var(--space-section-y)",
        paddingBottom: "var(--space-section-y)",
      }}
      aria-labelledby="faq-heading"
    >
      <div className="noise-texture-subtle" aria-hidden="true" />

      <div
        className="container relative z-10 mx-auto max-w-5xl"
        style={{
          paddingLeft: "var(--space-container-x)",
          paddingRight: "var(--space-container-x)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={reduceMotion ? undefined : FADE_TRANSITION}
        >
          {/* ─── Header ──────────────────────────────────────────── */}
          <div
            className="max-w-2xl"
            style={{
              marginBottom: "var(--space-title-to-content)",
            }}
          >
            <h2
              id="faq-heading"
              className="font-serif font-light text-charcoal heading-accent"
              style={{
                fontSize: "var(--typo-h2)",
                lineHeight: "var(--leading-h2)",
                marginBottom: "var(--space-heading-to-paragraph)",
              }}
            >
              {content.title}
            </h2>
            {content.subtitle && (
              <p
                className="text-warm-grey-500"
                style={{
                  fontSize: "var(--typo-body)",
                  lineHeight: "var(--leading-body)",
                }}
              >
                {content.subtitle}
              </p>
            )}
          </div>

          {/* ─── Two-column: FAQ + Location ──────────────────────── */}
          <div
            className="grid grid-cols-1 lg:grid-cols-5"
            style={{ gap: "var(--space-grid-gap)" }}
          >
            {/* Accordion */}
            <div className="lg:col-span-3">
              <div className="border-t border-warm-grey-200/50">
                {content.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    item={item}
                    index={i}
                    isOpen={openIndex === i}
                    onToggle={() => toggle(i)}
                    reduceMotion={reduceMotion}
                  />
                ))}
              </div>
            </div>

            {/* Location card — sticky on desktop */}
            <div id="faq" className="lg:col-span-2 lg:sticky lg:top-32 lg:h-max">
              <div className="overflow-hidden rounded-2xl border border-warm-grey-200/50 bg-tint-cream/40">
                <Suspense fallback={<MapFallback />}>
                  <LocationMap />
                </Suspense>
                <div className="space-y-2 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-warm-grey-400" />
                    <p
                      className="font-semibold text-charcoal"
                      style={{
                        fontSize: "var(--typo-small)",
                        lineHeight: "var(--leading-small)",
                      }}
                    >
                      {t("faq.locationLabel", {
                        defaultValue: "Studio",
                      })}
                    </p>
                  </div>
                  <p
                    className="whitespace-pre-line text-warm-grey-400"
                    style={{
                      fontSize: "var(--typo-caption)",
                      lineHeight: "var(--leading-caption)",
                    }}
                  >
                    {content.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
