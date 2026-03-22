import {
  useMemo,
  useState,
  useEffect,
  type FC,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

import { ServicesHero } from "./ServicesHero";
import { useCMSServices } from "@/hooks/useCMS";
import { getLocalizedText } from "@/lib/localize";
import TestimonialBanner from "@/features/testimonials/TestimonialBanner";
import type { ResponsiveImage as ResponsiveImageType } from "@/types/api";
import ResponsiveImage from "@/components/ui/ResponsiveImage";

// ── Types & Constants ────────────────────────────────────────────────
type SupportedLang = "fr" | "en";

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

interface ResolvedService {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  price: string;
  image: ResponsiveImageType | null;
}

const DESKTOP_PAGE_SIZE = 3;

// ── Utilities ────────────────────────────────────────────────────────
function formatPrice(price: string): string {
  const trimmed = price.trim();
  if (!trimmed) return "";
  if (trimmed.includes("€")) return trimmed;
  return `${trimmed} €`;
}

function resolveLang(language: string): SupportedLang {
  return language.startsWith("fr") ? "fr" : "en";
}

function resolveServices(
  raw: ServiceItem[],
  lang: SupportedLang
): ResolvedService[] {
  return raw.map((s) => ({
    id: s.id,
    title: getLocalizedText(s, "title", lang) || "Service",
    description:
      getLocalizedText(s, "description", lang) || "",
    durationMinutes: s.duration_minutes,
    price: s.price,
    image: s.image ?? null,
  }));
}

function accentFirstWord(text: string): ReactNode {
  const words = text.split(" ");

  if (words.length <= 1) {
    return (
      <span className="font-serif italic font-light">
        {text}
      </span>
    );
  }

  const first = words.shift();
  const second = words.shift();
  const rest = words.join(" ");

  return (
    <>
      <span className="font-serif italic font-light mr-2">
        {first}
      </span>
      {second && (
        <span
          className="font-bold mr-2"
          style={{ color: "var(--color-honey-300)" }}
        >
          {second}
        </span>
      )}
      {rest}
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

// ── Sub-components ───────────────────────────────────────────────────

// 1. DESKTOP ITEM
const EditorialServiceItem: FC<{
  service: ResolvedService;
}> = ({ service }) => (
  <article className="group flex cursor-pointer flex-col gap-6">
    <div className="relative aspect-4/5 w-full overflow-hidden bg-sage-deep/80">
      {service.image && (
        <ResponsiveImage
          image={service.image}
          alt={service.title}
          className="h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
          optimizeWidth={800}
        />
      )}
      <div className="absolute inset-0 bg-sage-deep/10 transition-opacity duration-500 group-hover:opacity-0" />
    </div>

    <div className="flex flex-col gap-3 pr-4">
      <div className="flex items-baseline justify-between gap-4 border-b border-sage-700 pb-4">
        <h3
          className="font-serif tracking-tight text-porcelain"
          style={{
            fontSize: "var(--typo-h3)",
            lineHeight: "var(--leading-h3)",
          }}
        >
          {service.title}
        </h3>
        <span
          className="shrink-0 font-medium tracking-widest text-terracotta-300"
          style={{
            fontSize: "var(--typo-small)",
            lineHeight: "var(--leading-small)",
          }}
        >
          {formatPrice(service.price)}
        </span>
      </div>

      <p
        className="line-clamp-3 font-light text-sage-100/90"
        style={{
          fontSize: "var(--typo-small)",
          lineHeight: "var(--leading-small)",
        }}
      >
        {service.description}
      </p>

      <span
        className="mt-2 font-semibold uppercase tracking-[0.15em] text-sage-400 transition-colors group-hover:text-terracotta-300"
        style={{
          fontSize: "var(--typo-overline)",
          lineHeight: "var(--leading-overline)",
        }}
      >
        {service.durationMinutes} Min
      </span>
    </div>
  </article>
);

// 2. MOBILE APOTHECARY LIST ITEM
const MobileListItem: FC<{
  service: ResolvedService;
  onClick: () => void;
}> = ({ service, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full flex-col gap-2 border-b border-white/10 py-6 text-left transition-colors hover:border-sage-600 active:bg-white/5"
  >
    <div className="flex w-full items-baseline justify-between gap-4">
      <h3
        className="font-serif tracking-tight text-porcelain transition-colors group-hover:text-white"
        style={{
          fontSize: "var(--typo-h4)",
          lineHeight: "var(--leading-h4)",
        }}
      >
        {service.title}
      </h3>
      <span
        className="shrink-0 font-medium tracking-widest text-terracotta-300"
        style={{
          fontSize: "var(--typo-small)",
          lineHeight: "var(--leading-small)",
        }}
      >
        {formatPrice(service.price)}
      </span>
    </div>
    <span
      className="font-semibold uppercase tracking-[0.15em] text-sage-400"
      style={{
        fontSize: "var(--typo-overline)",
        lineHeight: "var(--leading-overline)",
      }}
    >
      {service.durationMinutes} Min
    </span>
  </button>
);

// 3. MOBILE DRAWER
const MobileServiceDrawer: FC<{
  service: ResolvedService | null;
  onClose: () => void;
}> = ({ service, onClose }) => {
  useEffect(() => {
    if (service) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [service]);

  return (
    <AnimatePresence>
      {service && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-sage-deep/80 backdrop-blur-sm md:hidden"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
            }}
            className="fixed bottom-0 left-0 right-0 z-50 flex h-[85vh] flex-col overflow-hidden rounded-t-[2rem] bg-sage-deep shadow-[0_-10px_40px_rgba(0,0,0,0.3)] md:hidden"
          >
            <div className="relative h-2/5 w-full bg-sage-deep/80">
              {service.image && (
                <ResponsiveImage
                  image={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover opacity-90"
                  optimizeWidth={800}
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-sage-deep via-sage-deep/40 to-transparent" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close service details"
                className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-sage-deep/60 text-white backdrop-blur-md transition-colors hover:bg-black/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-10 pt-6">
              <span
                className="mb-3 block font-semibold uppercase tracking-[0.2em] text-terracotta-400"
                style={{
                  fontSize: "var(--typo-overline)",
                  lineHeight: "var(--leading-overline)",
                }}
              >
                {service.durationMinutes} Minutes
              </span>
              <h3
                className="mb-6 font-serif text-porcelain"
                style={{
                  fontSize: "var(--typo-h2)",
                  lineHeight: "var(--leading-h2)",
                }}
              >
                {service.title}
              </h3>
              <p
                className="mb-8 font-light text-sage-200/90"
                style={{
                  fontSize: "var(--typo-body)",
                  lineHeight: "var(--leading-body)",
                }}
              >
                {service.description}
              </p>

              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <span
                  className="font-serif text-porcelain"
                  style={{
                    fontSize: "var(--typo-h3)",
                    lineHeight: "var(--leading-h3)",
                  }}
                >
                  {formatPrice(service.price)}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const DesktopGrid: FC<{ services: ResolvedService[] }> = ({
  services,
}) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(
    services.length / DESKTOP_PAGE_SIZE
  );
  const visible = services.slice(
    page * DESKTOP_PAGE_SIZE,
    page * DESKTOP_PAGE_SIZE + DESKTOP_PAGE_SIZE
  );

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="hidden md:block">
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-(--space-grid-gap)">
        {visible.map((s) => (
          <EditorialServiceItem key={s.id} service={s} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-20 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() =>
              setPage((p) => Math.max(0, p - 1))
            }
            disabled={!canPrev}
            aria-label="Previous services"
            className="group flex h-14 w-14 items-center justify-center rounded-full border border-sage-700 text-porcelain transition-all duration-300 hover:border-terracotta-300 hover:text-terracotta-300 disabled:opacity-20 disabled:hover:border-sage-700 disabled:hover:text-porcelain"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </button>
          <button
            type="button"
            onClick={() =>
              setPage((p) =>
                Math.min(totalPages - 1, p + 1)
              )
            }
            disabled={!canNext}
            aria-label="Next services"
            className="group flex h-14 w-14 items-center justify-center rounded-full border border-sage-700 text-porcelain transition-all duration-300 hover:border-terracotta-300 hover:text-terracotta-300 disabled:opacity-20 disabled:hover:border-sage-700 disabled:hover:text-porcelain"
          >
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────
export const Services: FC = () => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const services = useResolvedServices();

  const [selectedMobileService, setSelectedMobileService] =
    useState<ResolvedService | null>(null);

  return (
    <div className="services-page">
      <ServicesHero />

      <section
        id="services"
        aria-labelledby="services-heading"
        className="bg-sage-deep py-(--space-section-y)"
      >
        <div className="container mx-auto px-(--space-container-x)">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.8 }
            }
            className="flex flex-col items-start gap-8 border-b border-white/10 md:flex-row md:items-end md:justify-between"
            style={{
              marginBottom: "var(--space-grid-gap)",
              paddingBottom:
                "var(--space-title-to-content)",
            }}
          >
            <div className="max-w-2xl">
              <p
                className="mb-6 font-semibold uppercase tracking-[0.25em] text-terracotta-400"
                style={{
                  fontSize: "var(--typo-overline)",
                  lineHeight: "var(--leading-overline)",
                }}
              >
                {t("services.label", {
                  defaultValue: "Notre Expertise",
                })}
              </p>
              <h2
                id="services-heading"
                className="text-editorial-lg text-porcelain"
              >
                {accentFirstWord(
                  t("services.title", {
                    defaultValue:
                      "Nos soins signatures",
                  })
                )}
              </h2>
            </div>
            <p
              className="max-w-md font-light text-sage-100/90"
              style={{
                fontSize: "var(--typo-body)",
                lineHeight: "var(--leading-body)",
              }}
            >
              {t("services.subtitle", {
                defaultValue:
                  "A tailored approach to physical and mental equilibrium.",
              })}
            </p>
          </motion.div>

          {!services ? (
            <div
              className="py-20 text-center text-sage-400"
              style={{
                fontSize: "var(--typo-body)",
                lineHeight: "var(--leading-body)",
              }}
            >
              No services available yet.
            </div>
          ) : (
            <>
              <p
                className="mb-2 text-sage-300/75 md:hidden"
                style={{
                  fontSize: "var(--typo-caption)",
                  lineHeight: "var(--leading-caption)",
                }}
              >
                {t("services.mobileHint", {
                  defaultValue:
                    "Tap a service to view details.",
                })}
              </p>

              <div className="flex flex-col md:hidden">
                {services.map((s) => (
                  <MobileListItem
                    key={s.id}
                    service={s}
                    onClick={() =>
                      setSelectedMobileService(s)
                    }
                  />
                ))}
              </div>

              <DesktopGrid services={services} />
            </>
          )}
        </div>
      </section>

      <MobileServiceDrawer
        service={selectedMobileService}
        onClose={() => setSelectedMobileService(null)}
      />

      <TestimonialBanner />
    </div>
  );
};
