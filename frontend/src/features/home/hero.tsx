import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
} from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import CookieConsent from "@/components/ui/CookieConsent";
import { useModal } from "@/components/modal/useModal";
import { useCMSPage } from "@/hooks/useCMS";
import { renderAccentTitle } from "@/lib/accentTitle";
import { cn } from "@/lib/utils";
import type { RenderableImage, WagtailHeroSlide } from "@/types/api";

// ── Constants ────────────────────────────────────────────
const SLIDE_INTERVAL_MS = 5_000;

// ── Types ────────────────────────────────────────────────
type SupportedLang = "fr" | "en";

interface NormalizedSlide extends Omit<WagtailHeroSlide, "image"> {
  image: RenderableImage;
}

interface HeroSlidesResult {
  slides: NormalizedSlide[] | null;
  isCarousel: boolean;
}

interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaPrivate: string;
  ctaCorporate: string;
}

// ── Helpers ──────────────────────────────────────────────
function resolveLang(language: string): SupportedLang {
  return language.startsWith("fr") ? "fr" : "en";
}

function pickLocalized<T>(lang: SupportedLang, fr: T, en: T): T {
  return lang === "fr" ? fr : en;
}

function nonEmpty(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed?.length ? trimmed : undefined;
}

function scrollToElement(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "start" });

  if (window.history?.pushState) {
    window.history.pushState(null, "", `#${id}`);
  }
}

function hasRenderableImage(
  slide: WagtailHeroSlide,
): slide is Omit<WagtailHeroSlide, "image"> & {
  image: RenderableImage;
} {
  return (
    !!slide.image &&
    typeof slide.image.src === "string" &&
    slide.image.src.length > 0
  );
}

// ── Hooks ────────────────────────────────────────────────
function useHeroSlides(
  cmsData: ReturnType<typeof useCMSPage>,
): HeroSlidesResult {
  return useMemo(() => {
    if (!cmsData) {
      return { slides: null, isCarousel: false };
    }

    const fromSlides = (cmsData.hero_slides ?? []).filter(
      hasRenderableImage,
    ) as NormalizedSlide[];

    if (fromSlides.length > 0) {
      return {
        slides: fromSlides,
        isCarousel: fromSlides.length >= 2,
      };
    }

    if (cmsData.hero_image?.src) {
      const image: RenderableImage = {
        ...cmsData.hero_image,
        src: cmsData.hero_image.src,
      };

      return {
        slides: [{ image }],
        isCarousel: false,
      };
    }

    return { slides: null, isCarousel: false };
  }, [cmsData]);
}

function useAutoAdvance(count: number): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (count < 2) return;

    let intervalId: number | null = null;

    const start = () => {
      if (intervalId !== null) return;

      intervalId = window.setInterval(() => {
        setActive((prev) => (prev + 1) % count);
      }, SLIDE_INTERVAL_MS);
    };

    const stop = () => {
      if (intervalId === null) return;

      window.clearInterval(intervalId);
      intervalId = null;
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener(
        "visibilitychange",
        handleVisibility,
      );
    };
  }, [count]);

  return count > 0 ? active % count : 0;
}

function useHeroContent(
  cmsData: ReturnType<typeof useCMSPage>,
  slides: NormalizedSlide[] | null,
  isCarousel: boolean,
  activeIndex: number,
): HeroContent {
  const { t, i18n } = useTranslation();
  const lang = resolveLang(i18n.language);

  return useMemo(() => {
    const activeSlide = slides?.[activeIndex];

    const slideTitle = isCarousel
      ? nonEmpty(
          pickLocalized(
            lang,
            activeSlide?.title_fr,
            activeSlide?.title_en,
          ),
        )
      : undefined;

    const slideSubtitle = isCarousel
      ? nonEmpty(
          pickLocalized(
            lang,
            activeSlide?.subtitle_fr,
            activeSlide?.subtitle_en,
          ),
        )
      : undefined;

    const pageTitle = nonEmpty(
      pickLocalized(
        lang,
        cmsData?.hero_title_fr,
        cmsData?.hero_title_en,
      ),
    );

    const pageSubtitle = nonEmpty(
      pickLocalized(
        lang,
        cmsData?.hero_subtitle_fr,
        cmsData?.hero_subtitle_en,
      ),
    );

    return {
      eyebrow: t("hero.eyebrow"),
      title: slideTitle ?? pageTitle ?? t("hero.title"),
      subtitle:
        slideSubtitle ?? pageSubtitle ?? t("hero.subtitle"),
      ctaPrivate: t("hero.ctaPrivate"),
      ctaCorporate: t("hero.ctaCorporate"),
    };
  }, [slides, isCarousel, activeIndex, cmsData, lang, t]);
}

// ── Presentational components ────────────────────────────
const BottomFade: FC = () => (
  <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-28 bg-linear-to-b from-transparent to-cream" />
);

// ── Hero ─────────────────────────────────────────────────
export const Hero: FC = () => {
  const cmsData = useCMSPage();
  const { open } = useModal();

  const { slides, isCarousel } = useHeroSlides(cmsData);
  const slideCount = slides?.length ?? 0;
  const active = useAutoAdvance(slideCount);
  const content = useHeroContent(
    cmsData,
    slides,
    isCarousel,
    active,
  );

  const handlePrivateClick = useCallback(() => {
    open("contact", { defaultSubject: "Private session inquiry" });
  }, [open]);

  const handleCorporateClick = useCallback(() => {
    scrollToElement("services-hero");
  }, []);

  return (
    <section
      id="home"
      className="hero-section relative flex min-h-[100svh] items-end overflow-hidden pb-28 pt-24 sm:pb-40 md:items-center md:pb-0"
    >
      {/* Prototype forest canvas — CMS hero photos intentionally not
          rendered in V2 (flat typographic hero per the approved design) */}
      <div className="absolute inset-0 z-0 bg-sage-950" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(110% 75% at 72% 8%, rgba(230, 234, 78, 0.05), transparent 55%)",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-sage-950 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div
        className="reveal-stagger container relative z-10 mx-auto flex h-full w-full max-w-275 flex-col items-start justify-end px-[var(--space-container-x)] text-left md:justify-center"
      >
        <p className="hero-eyebrow mb-5" data-reveal>
          {content.eyebrow}
        </p>

        <h1
          className="hero-heading-mb max-w-4xl text-hero-display text-balance text-white"
          data-reveal
        >
          {renderAccentTitle(content.title)}
        </h1>

        <p
          className="max-w-xs text-sm/relaxed text-white/85 line-clamp-2 sm:line-clamp-none sm:max-w-xl sm:text-base/relaxed"
          style={{
            marginBottom: "clamp(1.5rem, 1rem + 2vw, 2.5rem)",
          }}
          data-reveal
        >
          {content.subtitle}
        </p>

        {/* CTAs */}
        <div
          className="flex w-full flex-col items-start gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-5"
          data-reveal
        >
          <Button
            size="lg"
            onClick={handlePrivateClick}
            aria-label={content.ctaPrivate}
            className={cn(
              "hero-cta-text btn-accent rounded-full font-bold uppercase",
              "h-11 w-full px-5 text-xs tracking-wider",
              "sm:h-12 sm:w-auto sm:px-7 sm:text-sm sm:tracking-widest",
            )}
          >
            {content.ctaPrivate}
          </Button>

          <button
            type="button"
            onClick={handleCorporateClick}
            aria-label={content.ctaCorporate}
            className={cn(
              "hero-cta-text group inline-flex items-center justify-center gap-2",
              "h-11 rounded-full px-6 sm:h-12",
              "text-sm font-semibold tracking-wide text-white/90 sm:text-base",
              "ring-1 ring-inset ring-white/50",
              "transition-all duration-300",
              "hover:-translate-y-0.5 hover:bg-white/10 hover:text-white hover:ring-white/90",
            )}
          >
            {content.ctaCorporate}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <CookieConsent />
      <BottomFade />
    </section>
  );
};
