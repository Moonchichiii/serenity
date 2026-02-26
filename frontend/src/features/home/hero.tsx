// features/home/Hero.tsx

import { useCallback, useEffect, useMemo, useState, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, type Transition } from 'framer-motion'

import { Button } from '@/components/ui/Button'
import ResponsiveImage from '@/components/ui/ResponsiveImage'
import CookieConsent from '@/components/ui/CookieConsent'
import { useModal } from '@/components/modal/useModal'
import { useCMSPage } from '@/hooks/useCMS'
import { cn } from '@/lib/utils'
import type {
  RenderableImage,
  WagtailHeroSlide,
} from '@/types/api'

// ── Constants ────────────────────────────────────────────────────────
const SLIDE_INTERVAL_MS = 5_000
const SLIDE_TRANSITION_MS = 1_000
const SCALE_TRANSITION_MS = 6_000

const FADE_UP: Transition = { duration: 0.6 }
const FADE_UP_DELAY_1: Transition = { duration: 0.6, delay: 0.3 }
const FADE_UP_DELAY_2: Transition = { duration: 0.6, delay: 0.4 }

// ── Types ────────────────────────────────────────────────────────────
type SupportedLang = 'fr' | 'en'

/** A slide whose image is guaranteed renderable. */
interface NormalizedSlide extends Omit<WagtailHeroSlide, 'image'> {
  image: RenderableImage
}

interface HeroSlidesResult {
  slides: NormalizedSlide[] | null
  /** True only when the CMS returned ≥ 2 real hero_slides. */
  isCarousel: boolean
}

interface HeroContent {
  title: string
  subtitle: string
  ctaPrivate: string
  ctaCorporate: string
}

// ── Utilities ────────────────────────────────────────────────────────
function resolveLang(language: string): SupportedLang {
  return language.startsWith('fr') ? 'fr' : 'en'
}

function pickLocalized<T>(lang: SupportedLang, fr: T, en: T): T {
  return lang === 'fr' ? fr : en
}

/**
 * Collapses `null | undefined | ""` into `undefined` so the
 * nullish-coalescing cascade works for empty CMS strings too.
 */
function nonEmpty(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed?.length ? trimmed : undefined
}

function scrollToElement(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (window.history?.pushState) {
    window.history.pushState(null, '', `#${id}`)
  }
}

/**
 * Derives a deterministic React key from slide content.
 * Prefers `slide.id` when the API provides one; falls back to
 * `src:index` which is stable as long as slide order is stable.
 */
function slideKey(slide: NormalizedSlide, index: number): string {
  return slide.id != null ? String(slide.id) : `${slide.image.src}:${index}`
}

// ── Type guard ───────────────────────────────────────────────────────
/**
 * Narrows a WagtailHeroSlide to one with a renderable image.
 * Drives inference through `Array.filter()` so the output
 * array is correctly typed as `NormalizedSlide[]`.
 */
function hasRenderableImage(
  slide: WagtailHeroSlide,
): slide is Omit<WagtailHeroSlide, 'image'> & { image: RenderableImage } {
  return (
    !!slide.image &&
    typeof slide.image.src === 'string' &&
    slide.image.src.length > 0
  )
}

// ── Hooks ────────────────────────────────────────────────────────────

/**
 * Normalizes CMS hero data into a flat slide array.
 * Guarantees every returned slide has a renderable `image.src`.
 * Distinguishes "real carousel" from "single fallback image".
 */
function useHeroSlides(): HeroSlidesResult {
  const cmsData = useCMSPage()

  return useMemo(() => {
    if (!cmsData) return { slides: null, isCarousel: false }

    const fromSlides = (cmsData.hero_slides ?? []).filter(
      hasRenderableImage,
    ) as NormalizedSlide[]

    if (fromSlides.length > 0) {
      return {
        slides: fromSlides,
        isCarousel: fromSlides.length >= 2,
      }
    }

    // Single fallback image — normalize without casting
    if (cmsData.hero_image?.src) {
      const img: RenderableImage = {
        ...cmsData.hero_image,
        src: cmsData.hero_image.src,
      }
      return { slides: [{ image: img }], isCarousel: false }
    }

    return { slides: null, isCarousel: false }
  }, [cmsData])
}

/**
 * Auto-advances a numeric index on a timer, pausing when
 * the document is hidden (background tab) to save CPU/battery.
 * Resets to 0 if `count` shrinks below the current index.
 */
function useAutoAdvance(count: number): number {
  const [active, setActive] = useState(0)

  // Reset if count shrinks (CMS hydration / language switch)
  useEffect(() => {
    if (count > 0 && active >= count) {
      setActive(0)
    }
  }, [active, count])

  useEffect(() => {
    if (count < 2) return

    let intervalId: number | null = null

    const start = () => {
      if (intervalId !== null) return
      intervalId = window.setInterval(() => {
        setActive((prev) => (prev + 1) % count)
      }, SLIDE_INTERVAL_MS)
    }

    const stop = () => {
      if (intervalId === null) return
      window.clearInterval(intervalId)
      intervalId = null
    }

    const handleVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    start()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [count])

  return active
}

/**
 * Resolves hero copy with the cascade:
 *   slide-specific text → page-level CMS text → i18n fallback
 *
 * Slide-specific text is only attempted when the CMS returned
 * real carousel slides (not the single-image fallback).
 *
 * Individual CMS primitives are used as deps (not the full
 * cmsData object) to minimize unnecessary recalculations.
 */
function useHeroContent(
  slides: NormalizedSlide[] | null,
  isCarousel: boolean,
  activeIndex: number,
): HeroContent {
  const { t, i18n } = useTranslation()
  const cmsData = useCMSPage()
  const lang = resolveLang(i18n.language)

  // Extract primitives to keep useMemo deps stable
  const pageTitleFr = cmsData?.hero_title_fr
  const pageTitleEn = cmsData?.hero_title_en
  const pageSubtitleFr = cmsData?.hero_subtitle_fr
  const pageSubtitleEn = cmsData?.hero_subtitle_en

  return useMemo(() => {
    const activeSlide = slides?.[activeIndex]

    // Only attempt slide-level copy for real carousel slides
    const slideTitle = isCarousel
      ? nonEmpty(
          pickLocalized(
            lang,
            activeSlide?.title_fr,
            activeSlide?.title_en,
          ),
        )
      : undefined

    const slideSubtitle = isCarousel
      ? nonEmpty(
          pickLocalized(
            lang,
            activeSlide?.subtitle_fr,
            activeSlide?.subtitle_en,
          ),
        )
      : undefined

    const pageTitle = nonEmpty(pickLocalized(lang, pageTitleFr, pageTitleEn))
    const pageSubtitle = nonEmpty(
      pickLocalized(lang, pageSubtitleFr, pageSubtitleEn),
    )

    return {
      title: slideTitle ?? pageTitle ?? t('hero.title'),
      subtitle: slideSubtitle ?? pageSubtitle ?? t('hero.subtitle'),
      ctaPrivate: t('hero.ctaPrivate'),
      ctaCorporate: t('hero.ctaCorporate'),
    }
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
  ])
}

// ── Sub-components ───────────────────────────────────────────────────

/** Purely decorative slide image with Ken Burns–style scale. */
const SlideImage: FC<{
  slide: NormalizedSlide
  index: number
  isActive: boolean
}> = ({ slide, index, isActive }) => (
  <div
    className={cn(
      'absolute inset-0 transition-opacity ease-in-out',
      isActive ? 'opacity-100' : 'opacity-0',
    )}
    style={{ transitionDuration: `${SLIDE_TRANSITION_MS}ms` }}
    aria-hidden="true"
  >
    <div
      className={cn(
        'h-full w-full transition-transform ease-linear',
        isActive ? 'scale-110' : 'scale-100',
      )}
      style={{ transitionDuration: `${SCALE_TRANSITION_MS}ms` }}
    >
      <ResponsiveImage
        image={slide.image}
        alt=""
        priority={index === 0}
        className="h-full w-full object-cover"
        sizes="100vw"
      />
    </div>
  </div>
)

const BackgroundFallback: FC = () => (
  <div className="absolute inset-0 bg-stone-200" aria-hidden="true" />
)

const Overlays: FC = () => (
  <>
    <div className="absolute inset-0 bg-stone-100/60 mix-blend-hard-light" />
    <div className="absolute inset-0 bg-gradient-to-t from-stone-50/90 via-stone-50/40 to-stone-50/20" />
  </>
)

const BottomFade: FC = () => (
  <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-t from-background to-transparent" />
)

// ── Main component ──────────────────────────────────────────────────
export const Hero: FC = () => {
  const { open } = useModal()
  const { slides, isCarousel } = useHeroSlides()
  const active = useAutoAdvance(slides?.length ?? 0)
  const content = useHeroContent(slides, isCarousel, active)

  const handlePrivateClick = useCallback(() => {
    open('contact', { defaultSubject: 'Private session inquiry' })
  }, [open])

  const handleCorporateClick = useCallback(() => {
    scrollToElement('services-hero')
  }, [])

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20"
    >
      {/* Background slideshow */}
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

      {/* Content */}
      <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={FADE_UP}
          className="mb-6 max-w-5xl font-serif text-5xl font-medium text-stone-900 drop-shadow-sm md:text-6xl lg:text-7xl"
        >
          {content.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={FADE_UP_DELAY_1}
          className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-stone-600 md:text-2xl"
        >
          {content.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={FADE_UP_DELAY_2}
          className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            onClick={handlePrivateClick}
            aria-label={content.ctaPrivate}
            className="h-14 w-full rounded-full px-8 text-base shadow-warm transition-transform hover:-translate-y-1 hover:shadow-elevated sm:w-auto"
          >
            {content.ctaPrivate}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            type="button"
            onClick={handleCorporateClick}
            aria-label={content.ctaCorporate}
            className="h-14 w-full rounded-full px-8 text-base shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md sm:w-auto"
          >
            {content.ctaCorporate}
          </Button>
        </motion.div>
      </div>

      <CookieConsent />
      <BottomFade />
    </section>
  )
}
