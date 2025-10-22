import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useAnimation } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { Star } from 'lucide-react'

type Testimonial = {
  id: number
  name: string
  rating: number
  text: string
  date: string
  avatar: string
}

const TESTIMONIALS: Testimonial[] = [
  { id: 1, name: 'Sarah Mitchell',  rating: 5, text: 'Absolutely transformative experience! The holistic approach really helped me find balance in my life. Highly recommend to anyone seeking wellness.', date: '2025-09-08',  avatar: 'SM' },
  { id: 2, name: 'David Chen',      rating: 5, text: 'Professional, caring, and truly gifted. The sessions have made a remarkable difference in my stress levels and overall wellbeing.', date: '2025-08-15', avatar: 'DC' },
  { id: 3, name: 'Emily Rodriguez', rating: 5, text: 'Best decision I ever made! The mindfulness practices changed how I approach daily challenges. Incredible support!', date: '2025-09-01', avatar: 'ER' },
  { id: 4, name: 'Michael Thompson',rating: 5, text: 'Exceptional service and genuine care. The personalized approach made all the difference. I feel centered and peaceful.', date: '2025-09-13',  avatar: 'MT' },
  { id: 5, name: 'Lisa Anderson',   rating: 5, text: 'Life-changing! The combination of traditional and modern techniques is brilliant. Highly recommend.', date: '2025-07-22', avatar: 'LA' },
]

const LABELS = {
  section: 'Client testimonials',
  play: 'Play testimonials auto-scroll',
  pause: 'Pause testimonials auto-scroll',
}

export default function TestimonialBanner() {
  const { t, i18n } = useTranslation()
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const controls = useAnimation()
  const [paused, setPaused] = useState(false)
  const items = useMemo(() => [...TESTIMONIALS, ...TESTIMONIALS], [])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (prefersReduced) return
    if (!trackRef.current) return

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
  }, [controls, paused, prefersReduced])

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, __: PanInfo) => {
    setPaused(false)
  }

  return (
    <section aria-label={LABELS.section} className="mt-16">
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
        <p className="text-charcoal/70 mt-2">{t('testimonials.subtitle', 'Ce que disent nos clients')}</p>
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
            {paused ? t('testimonials.play', 'Play') : t('testimonials.pause', 'Pause')}
          </button>
        </div>
      )}

      <div
        ref={(el) => {
          containerRef.current = el
        }}
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
              <div className="flex items-center gap-1.5 mb-3" aria-label={`${tst.rating} out of 5 stars`}>
                {Array.from({ length: tst.rating }).map((_, idx) => (
                  <Star key={idx} className="w-5 h-5 text-honey-500 fill-honey-500" aria-hidden="true" />
                ))}
              </div>

              <p className="text-charcoal/80 leading-relaxed min-h-[88px]">
                {tst.text}
              </p>

              <div className="mt-5 pt-4 border-t border-sage-200/60 flex items-center gap-3">
                <div
                  className="
                    grid place-items-center w-10 h-10 rounded-full
                    text-sm font-semibold text-charcoal
                    ring-2 ring-white/80 conic-avatar
                  "
                  aria-hidden="true"
                >
                  <span className="bg-white/85 w-9 h-9 rounded-full grid place-items-center">
                    {tst.avatar}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-charcoal">{tst.name}</p>
                  <p className="text-sm text-charcoal/60">
                    {new Date(tst.date).toLocaleDateString(i18n.language || 'fr', { year: 'numeric', month: 'short' })}
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
