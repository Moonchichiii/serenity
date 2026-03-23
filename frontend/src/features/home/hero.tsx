import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
} from "react";
import { useTranslation } from "react-i18next";
import { motion, type Transition } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
import CookieConsent from "@/components/ui/CookieConsent";
import { useModal } from "@/components/modal/useModal";
import { useCMSPage } from "@/hooks/useCMS";
import { cn } from "@/lib/utils";
import type { RenderableImage, WagtailHeroSlide } from "@/types/api";

const SLIDE_INTERVAL_MS = 5_000;

const FADE_UP: Transition = {
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1],
};

const FADE_UP_DELAY_1: Transition = {
  duration: 0.9,
  delay: 0.3,
  ease: [0.16, 1, 0.3, 1],
};

const FADE_UP_DELAY_2: Transition = {
  duration: 0.9,
  delay: 0.55,
  ease: [0.16, 1, 0.3, 1],
};

type SupportedLang = "fr" | "en";

interface NormalizedSlide extends Omit<WagtailHeroSlide, "image"> {
  image: RenderableImage;
}

interface HeroSlidesResult {
  slides: NormalizedSlide[] | null;
  isCarousel: boolean;
}

interface HeroContent {
  title: string;
  subtitle: string;
  ctaPrivate: string;
  ctaCorporate: string;
}

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

function slideKey(slide: NormalizedSlide, index: number): string {
  return slide.id != null ? String(slide.id) : `${slide.image.src}:${index}`;
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

function useHeroSlides(): HeroSlidesResult {
  const cmsData = useCMSPage();

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
      const img: RenderableImage = {
        ...cmsData.hero_image,
        src: cmsData.hero_image.src,
      };

      return {
        slides: [{ image: img }],
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
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [count]);

  return count > 0 ? active % count : 0;
}

function useHeroContent(
  slides: NormalizedSlide[] | null,
  isCarousel: boolean,
  activeIndex: number,
): HeroContent {
  const { t, i18n } = useTranslation();
  const cmsData = useCMSPage();
  const lang = resolveLang(i18n.language);

  const pageTitleFr = cmsData?.hero_title_fr;
  const pageTitleEn = cmsData?.hero_title_en;
  const pageSubtitleFr = cmsData?.hero_subtitle_fr;
  const pageSubtitleEn = cmsData?.hero_subtitle_en;

  return useMemo(() => {
    const activeSlide = slides?.[activeIndex];

    const slideTitle = isCarousel
      ? nonEmpty(
          pickLocalized(lang, activeSlide?.title_fr, activeSlide?.title_en),
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
      pickLocalized(lang, pageTitleFr, pageTitleEn),
    );

    const pageSubtitle = nonEmpty(
      pickLocalized(lang, pageSubtitleFr, pageSubtitleEn),
    );

    return {
      title: slideTitle ?? pageTitle ?? t("hero.title"),
      subtitle: slideSubtitle ?? pageSubtitle ?? t("hero.subtitle"),
      ctaPrivate: t("hero.ctaPrivate"),
      ctaCorporate: t("hero.ctaCorporate"),
    };
  }, [
    slides,
    isCarousel,
    activeIndex,
    lang,
    pageTitleFr,
    pageTitleEn,
    pageSubtitleFr,
    pageSubtitleEn,
    t,
  ]);
}

const SlideImage: FC<{
  slide: NormalizedSlide;
  index: number;
  isActive: boolean;
}> = ({ slide, index, isActive }) => (
  <div
    className={cn(
      "hero-slide-fade absolute inset-0",
      isActive ? "opacity-100" : "opacity-0",
    )}
    aria-hidden="true"
  >
    <div
      className={cn(
        "hero-slide-scale h-full w-full",
        isActive ? "scale-110" : "scale-100",
      )}
    >
      <ResponsiveImage
        image={slide.image}
        alt=""
        priority={index === 0}
        className="h-full w-full object-cover"
        sizes="100vw"
        optimizeWidth={1920}
      />
    </div>
  </div>
);

const BackgroundFallback: FC = () => (
  <div className="absolute inset-0 bg-sage-900" aria-hidden="true" />
);

const Overlays: FC = () => (
  <>
    <div className="absolute inset-0 bg-sage-900/30" />
    <div className="absolute inset-0 bg-linear-to-r from-sage-900/45 via-transparent to-transparent" />
  </>
);

const BottomFade: FC = () => (
  <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-28 bg-linear-to-b from-transparent to-cream" />
);

export const Hero: FC = () => {
  const { open } = useModal();
  const { slides, isCarousel } = useHeroSlides();
  const active = useAutoAdvance(slides?.length ?? 0);
  const content = useHeroContent(slides, isCarousel, active);

  const handlePrivateClick = useCallback(() => {
    open("contact", { defaultSubject: "Private session inquiry" });
  }, [open]);

  const handleCorporateClick = useCallback(() => {
    scrollToElement("services-hero");
  }, []);

  return (
    <section
      id="home"
      className="hero-section relative flex min-h-screen items-end overflow-hidden pb-40 pt-24 md:items-center md:pb-0"
    >
      <div className="absolute inset-0 z-0">
        {slides ? (
          slides.map((slide, idx) => (
            <SlideImage
              key={slideKey(slide, idx)}
              slide={slide}
              index={idx}
              isActive={active === idx}
            />
          ))
        ) : (
          <BackgroundFallback />
        )}
        <Overlays />
      </div>

      <div className="container relative z-10 mx-auto flex h-full w-full max-w-275 flex-col items-start justify-end text-left md:justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={FADE_UP}
          className="hero-heading-mb text-editorial-xl max-w-3xl text-white"
        >
          {content.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={FADE_UP_DELAY_1}
          className="hero-subtitle mb-4 max-w-xl text-white/80 md:mb-8"
        >
          {content.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={FADE_UP_DELAY_2}
          className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4"
        >
          <Button
            size="lg"
            onClick={handlePrivateClick}
            aria-label={content.ctaPrivate}
            className="hero-cta-text btn-primary h-12 rounded-full px-7 font-bold uppercase tracking-widest"
          >
            {content.ctaPrivate}
          </Button>

          <button
            type="button"
            onClick={handleCorporateClick}
            aria-label={content.ctaCorporate}
            className={cn(
              "hero-cta-text group inline-flex items-center gap-2",
              "font-semibold tracking-wide text-white/80 transition-colors duration-300",
              "hover:text-white",
            )}
          >
            {content.ctaCorporate}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </motion.div>
      </div>

      <CookieConsent />
      <BottomFade />
    </section>
  );
};
