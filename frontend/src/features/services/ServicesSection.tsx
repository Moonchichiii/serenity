import { useMemo, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  motion,
  useReducedMotion,
  type Variants,
  type Transition,
} from 'framer-motion'
import { Clock, Euro, ArrowRight } from 'lucide-react'

import { ServicesHero } from './ServicesHero'
import { useCMSServices } from '@/hooks/useCMS'
import { getLocalizedText } from '@/lib/localize'
import TestimonialBanner from '@/features/testimonials/TestimonialBanner'
import ResponsiveImage from '@/components/ui/ResponsiveImage'
import type { ResponsiveImage as ResponsiveImageType } from '@/types/api'
import { cn } from '@/lib/utils'

// ── Constants ────────────────────────────────────────────────────────
const FADE_IN_TRANSITION: Transition = {
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1],
}

const CARD_ENTRANCE: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
}

/** Keywords used to detect the "highlighted" service (e.g. amma). */
const HIGHLIGHT_KEYWORDS_EN = ['chair', 'amma', 'seated'] as const
const HIGHLIGHT_KEYWORDS_FR = ['amma', 'assis'] as const

const MOBILE_IMAGE_SIZES = '(max-width: 640px) 90vw'
const DESKTOP_IMAGE_SIZES = '(max-width: 1280px) 45vw, 400px'

type SupportedLang = 'fr' | 'en'

// ── Types ────────────────────────────────────────────────────────────
interface ServiceItem {
  id: number
  title_en?: string
  title_fr?: string
  description_en?: string
  description_fr?: string
  duration_minutes: number
  price: string
  image: ResponsiveImageType | null
}

interface ResolvedService {
  id: number
  title: string
  description: string
  durationMinutes: number
  price: string
  image: ResponsiveImageType | null
  isHighlighted: boolean
}

// ── Utilities ────────────────────────────────────────────────────────
function resolveLang(language: string): SupportedLang {
  return language.startsWith('fr') ? 'fr' : 'en'
}

function matchesHighlightKeywords(service: ServiceItem): boolean {
  const en = (service.title_en || '').toLowerCase()
  const fr = (service.title_fr || '').toLowerCase()

  return (
    HIGHLIGHT_KEYWORDS_EN.some((kw) => en.includes(kw)) ||
    HIGHLIGHT_KEYWORDS_FR.some((kw) => fr.includes(kw))
  )
}

function resolveServices(
  raw: ServiceItem[],
  lang: SupportedLang,
): ResolvedService[] {
  const highlightedId = raw.find(matchesHighlightKeywords)?.id ?? null

  return raw.map((s) => ({
    id: s.id,
    title: getLocalizedText(s, 'title', lang) || 'Service',
    description: getLocalizedText(s, 'description', lang) || '',
    durationMinutes: s.duration_minutes,
    price: s.price,
    image: s.image ?? null,
    isHighlighted: s.id === highlightedId,
  }))
}

// ── Hooks ────────────────────────────────────────────────────────────
function useResolvedServices(): ResolvedService[] | null {
  const services = useCMSServices()
  const { i18n } = useTranslation()
  const lang = resolveLang(i18n.language)

  return useMemo(() => {
    if (!services || services.length === 0) return null
    return resolveServices(services, lang)
  }, [services, lang])
}

// ── Sub-components ───────────────────────────────────────────────────

/** Shared price badge overlay for card images. */
const PriceBadge: FC<{
  price: string
  highlighted?: boolean
  className?: string
}> = ({ price, highlighted, className }) => (
  <div
    className={cn(
      'absolute inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-[13px] font-bold tracking-wide text-charcoal shadow-soft',
      highlighted && 'ring-2 ring-terracotta-200',
      className,
    )}
  >
    <Euro className="h-3.5 w-3.5 text-sage-600" />
    {price}
  </div>
)

/** Shared duration + price footer row. */
const CardFooter: FC<{
  durationMinutes: number
  price: string
  isHighlighted: boolean
  popularLabel: string
  showPopular?: boolean
}> = ({
  durationMinutes,
  price,
  isHighlighted,
  popularLabel,
  showPopular = false,
}) => (
  <div className="mt-auto flex items-center justify-between border-t border-warm-grey-100 pt-5">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-warm-grey-500">
      <Clock className="h-3.5 w-3.5" />
      <span>{durationMinutes} min</span>
    </div>

    {showPopular && isHighlighted ? (
      <span className="badge-warm">
        {popularLabel}
      </span>
    ) : (
      !showPopular && (
        <span className="font-serif text-[13px] font-semibold text-charcoal">
          {price} €
        </span>
      )
    )}
  </div>
)

/** Mobile snap-scroll card. */
const MobileServiceCard: FC<{
  service: ResolvedService
}> = ({ service }) => (
  <article
    className={cn(
      'flex w-[85vw] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border bg-card shadow-card',
      service.isHighlighted
        ? 'border-terracotta-200'
        : 'border-warm-grey-200',
    )}
  >
    {service.image?.src && (
      <div className="relative h-56 w-full overflow-hidden">
        <ResponsiveImage
          image={service.image}
          alt={service.image.title || service.title}
          className="h-full w-full object-cover"
          sizes={MOBILE_IMAGE_SIZES}
        />
        <PriceBadge
          price={service.price}
          highlighted={service.isHighlighted}
          className="top-4 right-4"
        />
      </div>
    )}

    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h3 className="mb-3 font-serif text-2xl font-medium text-charcoal">
          {service.title}
        </h3>
        <p className="line-clamp-4 text-sm leading-relaxed text-warm-grey-500">
          {service.description}
        </p>
      </div>

      <CardFooter
        durationMinutes={service.durationMinutes}
        price={service.price}
        isHighlighted={service.isHighlighted}
        popularLabel=""
      />
    </div>
  </article>
)

/** Desktop grid card with entrance animation. */
const DesktopServiceCard: FC<{
  service: ResolvedService
  index: number
  variants: Variants | undefined
  popularLabel: string
}> = ({ service, index, variants, popularLabel }) => (
  <motion.article
    variants={variants}
    custom={index}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    whileHover={{ y: -3 }}
    className={cn(
      'group relative flex flex-col overflow-hidden rounded-2xl bg-card transition-all duration-500',
      service.isHighlighted
        ? 'card-warm ring-1 ring-terracotta-100'
        : 'card',
    )}
  >
    {service.image?.src && (
      <div className="relative h-64 w-full overflow-hidden">
        <ResponsiveImage
          image={service.image}
          alt={service.image.title || service.title}
          className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          sizes={DESKTOP_IMAGE_SIZES}
        />
        <div className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-1.5 text-[13px] font-bold text-charcoal shadow-soft backdrop-blur">
          <span>{service.price} €</span>
        </div>
      </div>
    )}

    <div className="flex flex-1 flex-col p-8">
      <div className="mb-6">
        <h3 className="mb-3 font-serif text-2xl font-medium text-charcoal">
          {service.title}
        </h3>
        <p className="text-base font-light leading-relaxed text-warm-grey-500">
          {service.description}
        </p>
      </div>

      <CardFooter
        durationMinutes={service.durationMinutes}
        price={service.price}
        isHighlighted={service.isHighlighted}
        popularLabel={popularLabel}
        showPopular
      />
    </div>
  </motion.article>
)

const MobileCarousel: FC<{
  services: ResolvedService[]
  slideLabel: string
}> = ({ services, slideLabel }) => (
  <div className="relative md:hidden">
    <div className="mb-4 flex justify-end px-4">
      <div className="badge-honey flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
        <span>{slideLabel}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>

    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-8">
      {services.map((s) => (
        <MobileServiceCard key={s.id} service={s} />
      ))}
      <div className="w-2 shrink-0" aria-hidden="true" />
    </div>
  </div>
)

const DesktopGrid: FC<{
  services: ResolvedService[]
  cardVariants: Variants | undefined
  popularLabel: string
}> = ({ services, cardVariants, popularLabel }) => (
  <div className="hidden max-w-7xl gap-8 md:grid md:grid-cols-2 lg:gap-10 xl:grid-cols-3 mx-auto">
    {services.map((s, i) => (
      <DesktopServiceCard
        key={s.id}
        service={s}
        index={i}
        variants={cardVariants}
        popularLabel={popularLabel}
      />
    ))}
  </div>
)

const EmptyState: FC = () => (
  <div className="py-20 text-center">
    <p className="text-warm-grey-500">No services available yet.</p>
  </div>
)

// ── Main component ───────────────────────────────────────────────────
export const Services: FC = () => {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const services = useResolvedServices()

  const cardVariants = reduceMotion ? undefined : CARD_ENTRANCE

  const slideLabel = t('services.slide', { defaultValue: 'SLIDE' })
  const popularLabel = t('services.mostPopular', {
    defaultValue: 'Popular',
  })

  return (
    <div className="services-page bg-tint-sand">
      <ServicesHero />

      <section
        id="services"
        aria-labelledby="services-heading"
        className="section-spacious relative overflow-hidden"
      >
        {/* Decorative blob */}
        <div
          className="organic-blob organic-blob-terracotta absolute -top-40 right-0 h-96 w-96"
          aria-hidden="true"
        />

        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={
              reduceMotion ? { duration: 0 } : FADE_IN_TRANSITION
            }
            className="mb-12 px-1 text-left md:mb-20 md:text-center"
          >
            <h2
              id="services-heading"
              className="text-editorial-lg mb-4 text-charcoal md:mb-6 heading-accent md:heading-accent-center"
            >
              {t('services.title')}
            </h2>
            <p className="text-lg leading-relaxed text-warm-grey-500 md:mx-auto md:text-xl max-w-2xl">
              {t('services.subtitle')}
            </p>
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
  )
}
