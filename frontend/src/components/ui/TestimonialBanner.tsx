import { useEffect, useMemo, useRef, useState } from 'react'
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
  { id: 1, name: 'Sarah Mitchell',  rating: 5, text: 'Absolutely transformative experience! The holistic approach really helped me find balance in my life. Highly recommend to anyone seeking wellness.', date: '2 weeks ago',  avatar: 'SM' },
  { id: 2, name: 'David Chen',      rating: 5, text: 'Professional, caring, and truly gifted. The sessions have made a remarkable difference in my stress levels and overall wellbeing.', date: '1 month ago', avatar: 'DC' },
  { id: 3, name: 'Emily Rodriguez', rating: 5, text: 'Best decision I ever made! The mindfulness practices changed how I approach daily challenges. Incredible support!', date: '3 weeks ago', avatar: 'ER' },
  { id: 4, name: 'Michael Thompson',rating: 5, text: 'Exceptional service and genuine care. The personalized approach made all the difference. I feel centered and peaceful.', date: '1 week ago',  avatar: 'MT' },
  { id: 5, name: 'Lisa Anderson',   rating: 5, text: 'Life-changing! The combination of traditional and modern techniques is brilliant. Highly recommend.', date: '2 months ago', avatar: 'LA' },
]

// A11y: text labels for controls
const LABELS = {
  section: 'Client testimonials',
  play: 'Play testimonials auto-scroll',
  pause: 'Pause testimonials auto-scroll',
}

export default function TestimonialBanner() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const controls = useAnimation()
  const [paused, setPaused] = useState(false)

  // duplicate for seamless loop
  const items = useMemo(() => [...TESTIMONIALS, ...TESTIMONIALS], [])
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReduced) return
    if (!trackRef.current) return

    const loopWidth = trackRef.current.scrollWidth / 2 // width of one set
    if (paused) {
      controls.stop()
      return
    }
    controls.start({
      x: [0, -loopWidth],
      transition: {
        duration: Math.max(18, loopWidth / 60), // ~60px/s
        ease: 'linear',
        repeat: Infinity,
      },
    })
  }, [controls, paused, prefersReduced])

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, __: PanInfo) => {
    setPaused(false)
  }

  return (
    <section
      aria-label={LABELS.section}
      className="mt-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h3 className="text-3xl md:text-4xl font-heading font-bold text-charcoal">
          Nos Avis
        </h3>
        <p className="text-charcoal/70 mt-2">Ce que disent nos clients</p>
      </motion.div>

      {/* Toolbar: play/pause for keyboard and SR users */}
      {!prefersReduced && (
        <div className="container mx-auto px-4 mb-2 flex justify-end">
          <button
            type="button"
            className="rounded-md px-3 py-1.5 text-sm border border-sage-300 hover:bg-sage-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-400 focus-visible:ring-offset-2"
            aria-pressed={paused}
            aria-label={paused ? LABELS.play : LABELS.pause}
            onClick={() => setPaused(p => !p)}
          >
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative overflow-hidden"
        // Pause on hover/touch
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        // Pause while keyboard focusing the moving region
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        // A11y: describe behaviour without spamming SRs while it moves
        role="region"
        aria-roledescription="marquee"
        aria-live="off"
        tabIndex={0}
      >
        {/* soft edge masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />

        <motion.div
          ref={trackRef}
          className="flex gap-6 px-6 py-2 w-max"  // w-max replaces inline width
          animate={controls}
          drag={!prefersReduced ? 'x' : false}
          dragConstraints={{ left: -99999, right: 99999 }}
          dragElastic={0.08}
          onDragStart={() => setPaused(true)}
          onDragEnd={onDragEnd}
          role="list"
        >
          {items.map((t, i) => (
            <motion.article
              key={`${t.id}-${i}`}
              whileHover={!prefersReduced ? { y: -4 } : undefined}
              role="listitem"
              className="
                w-[320px] md:w-[360px] lg:w-[380px] flex-shrink-0
                rounded-2xl p-5 md:p-6
                bg-white/85 backdrop-blur
                border-2 border-sage-200/40
                shadow-soft hover:shadow-warm transition-all
                relative testimonial-card-bg   /* gradient border bg */
              "
            >
              <div className="flex items-center gap-1.5 mb-3" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="w-5 h-5 text-honey-500 fill-honey-500" aria-hidden="true" />
                ))}
              </div>

              <p className="text-charcoal/80 leading-relaxed min-h-[88px]">
                {t.text}
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
                    {t.avatar}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-charcoal">{t.name}</p>
                  <p className="text-sm text-charcoal/60">{t.date}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
