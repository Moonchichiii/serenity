import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useAnimation } from 'framer-motion'
import { Star } from 'lucide-react'
import { cmsAPI, type WagtailTestimonial } from '@/api/cms'

export function TestimonialBanner() {
  const { t } = useTranslation()
  const [testimonials, setTestimonials] = useState<WagtailTestimonial[]>([])
  const [loading, setLoading] = useState(true)

  // --- marquee bits ---
  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const controls = useAnimation()
  const [paused, setPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const items = useMemo(
    () => (testimonials.length > 0 ? [...testimonials, ...testimonials] : []),
    [testimonials]
  )

  useEffect(() => {
    cmsAPI
      .getTestimonials(4)
      .then((data) => setTestimonials(data))
      .finally(() => setLoading(false))
  }, [])

  // drive the infinite scroll
  useEffect(() => {
    if (prefersReduced) return
    if (!trackRef.current || testimonials.length === 0) return

    const loopWidth = trackRef.current.scrollWidth / 2
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    if (paused) {
      controls.stop()
      return
    }

    controls.start({
      x: [0, -loopWidth],
      transition: {
        duration: isMobile ? Math.max(12, loopWidth / 80) : Math.max(18, loopWidth / 60),
        ease: 'linear',
        repeat: Infinity,
      },
    })

    return () => controls.stop()
  }, [controls, paused, prefersReduced, testimonials.length])

  if (loading) {
    return (
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500" />
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) return null

  return (
    <section className="py-20 bg-cream-50" id="testimonials">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-serif font-bold text-charcoal mb-4">
            {t('testimonials.title', 'What Clients Say')}
          </h2>
          <p className="text-lg text-charcoal/70">
            {t('testimonials.subtitle', 'Real experiences from real people')}
          </p>
        </motion.div>

        {/* marquee container */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          role="region"
          aria-roledescription="marquee"
          aria-live="off"
        >
          {/* soft edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-cream-50 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-cream-50 to-transparent" />

          {/* scrolling track */}
          <motion.div
            ref={trackRef}
            className="flex gap-8 w-max px-2"
            animate={prefersReduced ? undefined : controls}
          >
            {items.map((testimonial, index) => (
              <motion.div
                key={`${testimonial.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow w-[280px] md:w-[360px] lg:w-[380px] xl:w-[440px] 2xl:w-[480px] flex-shrink-0"
                role="article"
                aria-label={`${testimonial.name} – ${testimonial.rating}/5`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                    aria-hidden="true"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-charcoal">{testimonial.name}</h3>
                    <div className="flex items-center gap-0.5">
                      <div className="flex gap-0.5" aria-hidden="true">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating
                                ? 'fill-honey-400 text-honey-400'
                                : 'text-charcoal/20'
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <span className="sr-only">{testimonial.rating} out of 5</span>
                    </div>
                  </div>
                </div>

                <p className="text-charcoal/70 leading-relaxed line-clamp-4">
                  {testimonial.text}
                </p>
                <p className="text-sm text-charcoal/50 mt-4">{testimonial.date}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialBanner
