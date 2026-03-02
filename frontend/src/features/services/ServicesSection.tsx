import { useMemo, useState, type FC, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  motion,
  useReducedMotion,
  type Variants,
  type Transition,
} from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ServicesHero } from "./ServicesHero";
import { useCMSServices } from "@/hooks/useCMS";
import { getLocalizedText } from "@/lib/localize";
import TestimonialBanner from "@/features/testimonials/TestimonialBanner";
import type { ResponsiveImage as ResponsiveImageType } from "@/types/api";
import {
  CARD_ENTRANCE,
  MobileServiceCard,
  DesktopServiceCard,
  type ResolvedService,
} from "@/components/ui/ServiceCards";

// ── Constants ────────────────────────────────────────────────────────
const FADE_IN_TRANSITION: Transition = {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1],
};

const HIGHLIGHT_KEYWORDS_EN = ["chair", "amma", "seated"] as const;
const HIGHLIGHT_KEYWORDS_FR = ["amma", "assis"] as const;

type SupportedLang = "fr" | "en";

const DESKTOP_PAGE_SIZE = 3;

// ── Types ────────────────────────────────────────────────────────────
interface ServiceItem {
  id: number;
  title_en?: string;
  title_fr?: string;
  description_en?: string;
  description_fr?: string;
  duration_minutes: number;
  price: string;
  image: ResponsiveImageType | null;
}

// ── Utilities ────────────────────────────────────────────────────────
function resolveLang(language: string): SupportedLang {
  return language.startsWith("fr") ? "fr" : "en";
}

function matchesHighlightKeywords(service: ServiceItem): boolean {
  const en = (service.title_en || "").toLowerCase();
  const fr = (service.title_fr || "").toLowerCase();
  return (
    HIGHLIGHT_KEYWORDS_EN.some((kw) => en.includes(kw)) ||
    HIGHLIGHT_KEYWORDS_FR.some((kw) => fr.includes(kw))
  );
}

function resolveServices(
  raw: ServiceItem[],
  lang: SupportedLang,
): ResolvedService[] {
  const highlightedId = raw.find(matchesHighlightKeywords)?.id ?? null;
  return raw.map((s) => ({
    id: s.id,
    title: getLocalizedText(s, "title", lang) || "Service",
    description: getLocalizedText(s, "description", lang) || "",
    durationMinutes: s.duration_minutes,
    price: s.price,
    image: s.image ?? null,
    isHighlighted: s.id === highlightedId,
  }));
}

/** Wraps the last word of a string in an italic accent span. */
function accentLastWord(text: string): ReactNode {
  const words = text.split(" ");
  if (words.length <= 1)
    return <span className="italic text-honey-300">{text}</span>;
  const last = words.pop();
  return (
    <>
      {words.join(" ")}{" "}
      <span className="italic text-honey-300">{last}</span>
    </>
  );
}

// ── Hooks ────────────────────────────────────────────────────────────
function useResolvedServices(): ResolvedService[] | null {
  const services = useCMSServices();
  const { i18n } = useTranslation();
  const lang = resolveLang(i18n.language);

  return useMemo(() => {
    if (!services || services.length === 0) return null;
    return resolveServices(services, lang);
  }, [services, lang]);
}

// ── Layout sub-components ────────────────────────────────────────────

const MobileCarousel: FC<{
  services: ResolvedService[];
  slideLabel: string;
}> = ({ services, slideLabel }) => (
  <div className="relative md:hidden">
    <div className="mb-5 flex justify-end px-4">
      <div className="badge-honey flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
        <span>{slideLabel}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>

    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-10">
      {services.map((s) => (
        <MobileServiceCard key={s.id} service={s} />
      ))}
      <div className="w-2 shrink-0" aria-hidden="true" />
    </div>
  </div>
);

const DesktopGrid: FC<{
  services: ResolvedService[];
  cardVariants: Variants | undefined;
  popularLabel: string;
}> = ({ services, cardVariants, popularLabel }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(services.length / DESKTOP_PAGE_SIZE);
  const visible = services.slice(
    page * DESKTOP_PAGE_SIZE,
    page * DESKTOP_PAGE_SIZE + DESKTOP_PAGE_SIZE,
  );

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="hidden md:block">
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-6 lg:gap-7">
        {visible.map((s, i) => (
          <DesktopServiceCard
            key={s.id}
            service={s}
            index={i}
            variants={cardVariants}
            popularLabel={popularLabel}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!canPrev}
            aria-label="Previous services"
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/20 text-white/70 transition-all duration-300 hover:border-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() =>
              setPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={!canNext}
            aria-label="Next services"
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/20 text-white/70 transition-all duration-300 hover:border-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

const EmptyState: FC = () => (
  <div className="py-20 text-center">
    <p className="text-warm-grey-300 text-lg">
      No services available yet.
    </p>
  </div>
);

// ── Main component ───────────────────────────────────────────────────
export const Services: FC = () => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const services = useResolvedServices();

  const cardVariants = reduceMotion ? undefined : CARD_ENTRANCE;

  const slideLabel = t("services.slide", { defaultValue: "SLIDE" });
  const popularLabel = t("services.mostPopular", {
    defaultValue: "Popular",
  });

  return (
    <div className="services-page bg-porcelain">
      <ServicesHero />

      <section
        id="services"
        aria-labelledby="services-heading"
        className="section-spacious relative overflow-hidden bg-sage-900"
      >
        <div className="hidden" aria-hidden="true" />
        <div className="hidden" aria-hidden="true" />
        <div className="hidden" aria-hidden="true" />

        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          {/* ── Header: editorial split layout ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={
              reduceMotion ? { duration: 0 } : FADE_IN_TRANSITION
            }
            className="mb-14 md:mb-20"
          >
            {/* Mobile: stacked */}
            <div className="px-1 text-left md:hidden">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-warm-grey-400">
                {t("services.label", { defaultValue: "WHAT WE DO" })}
              </p>
              <h2
                id="services-heading"
                className="text-editorial-lg mb-5 text-porcelain"
              >
                {accentLastWord(t("services.title"))}
              </h2>
              <p className="text-base leading-relaxed text-warm-grey-300 font-light">
                {t("services.subtitle")}
              </p>
            </div>

            {/* Desktop: two-column split */}
            <div className="hidden md:flex md:items-end md:justify-between md:gap-16">
              <div className="max-w-xl">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-warm-grey-400 md:mb-5">
                  {t("services.label", {
                    defaultValue: "WHAT WE DO",
                  })}
                </p>
                <h2
                  id="services-heading"
                  className="text-editorial-lg text-porcelain"
                >
                  {accentLastWord(t("services.title"))}
                </h2>
              </div>
              <p className="max-w-sm text-base leading-relaxed text-warm-grey-300 font-light lg:text-lg">
                {t("services.subtitle")}
              </p>
            </div>
          </motion.div>

          {/* Cards */}
          {!services ? (
            <EmptyState />
          ) : (
            <>
              <MobileCarousel
                services={services}
                slideLabel={slideLabel}
              />
              <DesktopGrid
                services={services}
                cardVariants={cardVariants}
                popularLabel={popularLabel}
              />
            </>
          )}
        </div>
      </section>

      <TestimonialBanner />
    </div>
  );
};
