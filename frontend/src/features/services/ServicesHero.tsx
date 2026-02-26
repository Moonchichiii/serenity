import { useMemo, useEffect, useState, type FC } from 'react'
import {
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from 'framer-motion'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useCMSPage } from '@/hooks/useCMS'
import { useModal } from '@/components/modal'
import { getLocalizedText } from '@/lib/localize'
import { getOptimizedVideoUrl } from '@/utils/cloudinary'
import { Button } from '@/components/ui/Button'
import ResponsiveImage from '@/components/ui/ResponsiveImage'
import type { ResponsiveImage as ResponsiveImageType } from '@/types/api'

// ── Constants ────────────────────────────────────────────────────────
const FALLBACK_POSTER =
  'https://res.cloudinary.com/dbzlaawqt/image/upload/v1762274193/poster_zbbwz5.webp'

const FADE_UP_TRANSITION: Transition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1],
}

const BENEFIT_STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const BENEFIT_ITEM: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } },
}

const VIDEO_BREAKPOINTS = [
  { maxWidth: 640, resolution: 640 },
  { maxWidth: 1024, resolution: 1024 },
] as const

const DEFAULT_VIDEO_RESOLUTION = 1920

type SupportedLang = 'fr' | 'en'

// ── Types ────────────────────────────────────────────────────────────
interface HeroContent {
  title: string
  priceLabel: string
  price: string
  cta: string
  benefits: string[]
  hasPrice: boolean
  hasCTA: boolean
  tagline: string
}

interface NetworkInformation {
  saveData?: boolean
}

// ── Utilities ────────────────────────────────────────────────────────
function resolveLang(language: string): SupportedLang {
  return language.startsWith('fr') ? 'fr' : 'en'
}

function toSentenceCase(s?: string): string {
  if (!s) return ''
  return s.charAt(0).toLocaleUpperCase() + s.slice(1).toLocaleLowerCase()
}

function getSaveDataPreference(): boolean {
  if (typeof navigator === 'undefined') return false
  return !!(
    navigator as unknown as { connection?: NetworkInformation }
  ).connection?.saveData
}

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
}

function resolveVideoWidth(): number {
  const width =
    typeof window !== 'undefined' ? window.innerWidth || 1920 : 1920

  for (const bp of VIDEO_BREAKPOINTS) {
    if (width <= bp.maxWidth) return bp.resolution
  }
  return DEFAULT_VIDEO_RESOLUTION
}

// ── Hooks ────────────────────────────────────────────────────────────
function useHeroContent(): HeroContent | null {
  const { t, i18n } = useTranslation()
  const page = useCMSPage()
  const lang = resolveLang(i18n.language)

  return useMemo(() => {
    if (!page) return null

    const loc = (field: string) => getLocalizedText(page, field, lang)

    const priceLabel = loc('services_hero_pricing_label')
    const price = loc('services_hero_price')
    const cta = loc('services_hero_cta')

    const benefits = [
      loc('services_hero_benefit_1'),
      loc('services_hero_benefit_2'),
      loc('services_hero_benefit_3'),
    ].filter((b) => b.trim().length > 0)

    return {
      title: loc('services_hero_title'),
      priceLabel,
      price,
      cta,
      benefits,
      hasPrice: Boolean(priceLabel || price),
      hasCTA: Boolean(cta),
      tagline:
        lang === 'fr' ? 'Bien-être au travail' : 'Corporate Wellness',
    }
  }, [page, lang])
}

function useCaptionsBlob(): string | undefined {
  const url = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const blob = new Blob(['WEBVTT\n\n'], { type: 'text/vtt' })
    return URL.createObjectURL(blob)
  }, [])

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  return url
}

function useVideoSource(shouldDisable: boolean): string | null {
  const page = useCMSPage()
  const [src, setSrc] = useState<string | null>(null)

  const directUrl = page?.services_hero_video_url?.trim()
  const publicId = page?.services_hero_video_public_id?.trim()

  useEffect(() => {
    if (shouldDisable) {
      queueMicrotask(() => setSrc(null))
      return
    }

    if (directUrl) {
      queueMicrotask(() => setSrc(directUrl))
      return
    }

    if (!publicId) {
      queueMicrotask(() => setSrc(null))
      return
    }

    const update = () =>
      setSrc(getOptimizedVideoUrl(publicId, resolveVideoWidth(), 'eco'))

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [directUrl, publicId, shouldDisable])

  return src
}

// ── Sub-components ───────────────────────────────────────────────────
const VideoBackground: FC<{
  src: string
  posterUrl: string
  captionsUrl?: string
  disabled: boolean
}> = ({ src, posterUrl, captionsUrl, disabled }) => (
  <video
    className="absolute inset-0 h-full w-full object-cover object-center"
    poster={posterUrl}
    autoPlay={!disabled}
    muted
    playsInline
    loop={!disabled}
    preload="metadata"
  >
    <source src={src} type="video/mp4" />
    {captionsUrl && <track kind="captions" src={captionsUrl} default />}
  </video>
)

const PosterBackground: FC<{
  image: ResponsiveImageType | null | undefined
}> = ({ image }) => (
  <ResponsiveImage
    image={image}
    alt=""
    aria-hidden="true"
    className="absolute inset-0 h-full w-full object-cover object-center"
  />
)

const Overlays: FC = () => (
  <>
    <div
      className="absolute inset-0 bg-stone-900/40 backdrop-contrast-[.90]"
      aria-hidden="true"
    />
    <div
      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
      aria-hidden="true"
    />
  </>
)

const PriceBadge: FC<{ label: string; price: string }> = ({
  label,
  price,
}) => (
  <div className="flex justify-center lg:justify-start">
    <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-2 shadow-lg backdrop-blur-md">
      {label && (
        <span className="text-xs font-bold uppercase tracking-wide text-stone-200 sm:text-sm">
          {label}
        </span>
      )}
      {price && (
        <span className="font-serif text-xl tracking-tight text-white sm:text-2xl">
          {price}
        </span>
      )}
    </div>
  </div>
)

const BenefitItem: FC<{
  text: string
  variants: Variants | undefined
}> = ({ text, variants }) => (
  <li>
    <motion.div variants={variants} className="group flex items-start gap-4">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors group-hover:bg-white/20">
        <Check className="h-5 w-5" />
      </div>
      <span className="text-lg font-medium leading-snug text-stone-100 drop-shadow-md sm:text-xl">
        {text}
      </span>
    </motion.div>
  </li>
)

const BenefitsList: FC<{
  benefits: string[]
  variants: Variants | undefined
  itemVariants: Variants | undefined
}> = ({ benefits, variants, itemVariants }) => (
  <div className="relative pl-0 lg:pl-10">
    <div className="absolute left-0 top-2 bottom-2 hidden w-px bg-gradient-to-b from-transparent via-white/30 to-transparent lg:block" />
    <motion.ul
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="space-y-6"
    >
      {benefits.map((b, i) => (
        <BenefitItem key={i} text={b} variants={itemVariants} />
      ))}
    </motion.ul>
  </div>
)

// ── Main component ───────────────────────────────────────────────────
export const ServicesHero: FC = () => {
  const { t } = useTranslation()
  const { open } = useModal()
  const reduceMotion = useReducedMotion()
  const content = useHeroContent()
  const captionsUrl = useCaptionsBlob()

  const shouldDisableVideo =
    getSaveDataPreference() || getPrefersReducedMotion()
  const videoSrc = useVideoSource(shouldDisableVideo)

  const page = useCMSPage()
  const poster = page?.services_hero_poster_image
  const posterUrl = poster?.src ?? FALLBACK_POSTER

  const benefitStagger = reduceMotion ? undefined : BENEFIT_STAGGER
  const benefitItem = reduceMotion ? undefined : BENEFIT_ITEM

  if (!content) return null

  return (
    <section
      id="services-hero"
      aria-label={t('services.hero.label', {
        defaultValue: 'Services Overview',
      })}
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden py-12 lg:min-h-[85vh]"
    >
      {/* Background */}
      {videoSrc ? (
        <VideoBackground
          src={videoSrc}
          posterUrl={posterUrl}
          captionsUrl={captionsUrl}
          disabled={shouldDisableVideo}
        />
      ) : (
        <PosterBackground image={poster} />
      )}

      <Overlays />

      {/* Content */}
      <div className="container relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={reduceMotion ? { duration: 0 } : FADE_UP_TRANSITION}
          className="mx-auto w-full max-w-6xl"
        >
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
            {/* Left — headline + price + CTA */}
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <span className="hidden text-xs font-bold uppercase tracking-[0.2em] text-sage-200 drop-shadow-md lg:block">
                {content.tagline}
              </span>

              <h2 className="font-serif text-4xl font-medium leading-[1.15] text-white drop-shadow-lg sm:text-5xl md:text-6xl">
                {toSentenceCase(content.title)}
              </h2>

              {content.hasPrice && (
                <PriceBadge
                  label={content.priceLabel}
                  price={content.price}
                />
              )}

              {content.hasCTA && (
                <div className="pt-2">
                  <Button
                    variant="default"
                    size="lg"
                    aria-label={content.cta || 'Contact Corporate'}
                    className="h-14 w-full rounded-full border border-white/10 px-10 text-base font-semibold tracking-wide shadow-lg transition-all hover:shadow-white/20 sm:w-auto"
                    onClick={() =>
                      open('corporate', {
                        defaultEventType: 'corporate',
                      })
                    }
                  >
                    {toSentenceCase(content.cta)}
                  </Button>
                </div>
              )}
            </div>

            {/* Right — benefits */}
            {content.benefits.length > 0 && (
              <BenefitsList
                benefits={content.benefits}
                variants={benefitStagger}
                itemVariants={benefitItem}
              />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
