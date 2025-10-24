import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useAnimation } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { Star } from 'lucide-react'
import { cmsAPI, type WagtailTestimonial } from '@/api/cms'

const LABELS = {
  section: 'Client testimonials',
  play: 'Play testimonials auto-scroll',
  pause: 'Pause testimonials auto-scroll',
}

export default function TestimonialBanner() {
  const { t } = useTranslation()
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const controls = useAnimation()
  const [paused, setPaused] = useState(false)
  const [testimonials, setTestimonials] = useState<WagtailTestimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  // Duplicate testimonials for infinite scroll
  const items = useMemo(
    () => (testimonials.length > 0 ? [...testimonials, ...testimonials] : []),
    [testimonials]
  )

  // Fetch testimonials from API (4-5 stars only)
  const fetchTestimonials = async () => {
    try {
      setIsLoading(true)
      const data = await cmsAPI.getTestimonials()
      setTestimonials(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching testimonials:', err)
      setError('Impossible de charger les avis')
      setTestimonials([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()

    // Listen for new testimonial submissions
    const handleNewTestimonial = () => {
      setTimeout(fetchTestimonials, 1000)
    }

    window.addEventListener('testimonialSubmitted', handleNewTestimonial)
    return () => window.removeEventListener('testimonialSubmitted', handleNewTestimonial)
  }, [])

  // Animation control
  useEffect(() => {
    if (prefersReduced) return
    if (!trackRef.current) return
    if (testimonials.length === 0) return

    const loopWidth = trackRef.current.scrollWidth / 2
    if (paused) {
      controls.stop()
      return
    }

    controls.start({
      x: [0, -loopWidth],
      transition: {
        duration: Math.max(18, loopWidth / 60),
        ease: 'linear',
        repeat: Infinity,
      },
    })

    return () => {
      controls.stop()
    }
  }, [controls, paused, prefersReduced, testimonials.length])

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, __: PanInfo) => {
    setPaused(false)
  }

  // Loading state
  if (isLoading) {
    return (
      <section aria-label={LABELS.section} className="mt-16">
        <div className="text-center mb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-sage-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-sage-100 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section aria-label={LABELS.section} className="mt-16">
        <div className="text-center">
          <p className="text-charcoal/60">{error}</p>
        </div>
      </section>
    )
  }

  // Empty state
  if (testimonials.length === 0) {
    return (
      <section aria-label={LABELS.section} className="mt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-3xl md:text-4xl font-heading font-bold text-charcoal">
            {t('testimonials.title', 'Nos Avis')}
          </h3>
          <p className="text-charcoal/70 mt-4">
            Soyez le premier à laisser un avis !
          </p>
          <p className="text-sm text-sage-600 mt-2">
            ⭐ Seuls les avis 4-5 étoiles approuvés sont affichés
          </p>
        </motion.div>
      </section>
    )
  }

  return (
    <section aria-label={LABELS.section} className="mt-16" id="testimonials">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h3 className="text-3xl md:text-4xl font-heading font-bold text-charcoal">
          {t('testimonials.title', 'Nos Avis')}
        </h3>
        <p className="text-charcoal/70 mt-2">
          {t('testimonials.subtitle', 'Ce que disent nos clients')}
        </p>
        <p className="text-sm text-sage-600 mt-2">
          ⭐ Seuls les avis 4-5 étoiles approuvés sont affichés
        </p>
      </motion.div>

      {!prefersReduced && (
        <div className="container mx-auto px-4 mb-2 flex justify-end">
          <button
            type="button"
            className="rounded-md px-3 py-1.5 text-sm border border-sage-300 hover:bg-sage-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-400 focus-visible:ring-offset-2"
            aria-pressed={paused}
            aria-label={paused ? LABELS.play : LABELS.pause}
            onClick={() => setPaused(p => !p)}
          >
            {paused ? t('testimonials.play', 'Lecture') : t('testimonials.pause', 'Pause')}
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        role="region"
        aria-roledescription="marquee"
        aria-live="off"
        tabIndex={0}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />

        <motion.div
          ref={trackRef}
          className="flex gap-6 px-6 py-2 w-max"
          animate={controls}
          drag={!prefersReduced ? 'x' : false}
          dragConstraints={{ left: -99999, right: 99999 }}
          dragElastic={0.08}
          onDragStart={() => setPaused(true)}
          onDragEnd={onDragEnd}
          role="list"
        >
          {items.map((tst, i) => (
            <motion.article
              key={`${tst.id}-${i}`}
              whileHover={!prefersReduced ? { y: -4 } : undefined}
              role="listitem"
              className="
                w-[320px] md:w-[360px] lg:w-[380px] flex-shrink-0
                rounded-2xl p-5 md:p-6
                bg-white/85 backdrop-blur
                border-2 border-sage-200/40
                shadow-soft hover:shadow-warm transition-all
                relative testimonial-card-bg
              "
            >
              {/* Star Rating */}
              <div
                className="flex items-center gap-1.5 mb-3"
                aria-label={`${tst.rating} out of 5 stars`}
              >
                {Array.from({ length: tst.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-5 h-5 text-honey-500 fill-honey-500"
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-charcoal/80 leading-relaxed min-h-[88px]">
                {tst.text}
              </p>

              {/* Author Info */}
              <div className="mt-5 pt-4 border-t border-sage-200/60 flex items-center gap-3">
                <img
                  src={tst.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full"
                  aria-hidden="true"
                  loading="lazy"
                />
                <div className="flex-1">
                  <p className="font-semibold text-charcoal">{tst.name}</p>
                  <p className="text-sm text-charcoal/60">
                    <time>{tst.date}</time>
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
