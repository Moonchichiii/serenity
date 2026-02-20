import { memo, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Star, MessageCircle, Quote } from 'lucide-react'

import { useCMSTestimonials } from '@/lib/cmsSelectors'
import type { WagtailTestimonial } from '@/types/api'
import { TestimonialModal } from '@/components/modals/TestimonialModal'

export function TestimonialBanner() {
  const { t } = useTranslation()
  const allTestimonials = useCMSTestimonials()

  const testimonials = useMemo(
    () => (allTestimonials || []).filter((item) => item.rating >= 4),
    [allTestimonials],
  )

  const [selectedTestimonial, setSelectedTestimonial] =
    useState<WagtailTestimonial | null>(null)

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const items = useMemo(() => {
    if (testimonials.length === 0) return []
    if (isMobile) return testimonials
    if (testimonials.length < 4) {
      return [
        ...testimonials,
        ...testimonials,
        ...testimonials,
        ...testimonials,
      ]
    }
    return [...testimonials, ...testimonials]
  }, [testimonials, isMobile])

  const [paused, setPaused] = useState(false)

  // ✅ Removed unused `xTranslation` ref

  if (!testimonials || testimonials.length === 0) return null

  const handleCardClick = (testimonial: WagtailTestimonial) => {
    if (!isMobile) setPaused(true)
    setSelectedTestimonial(testimonial)
  }

  const handleModalClose = () => {
    setSelectedTestimonial(null)
    setPaused(false)
  }

  const renderCard = (
    testimonial: WagtailTestimonial,
    index: number,
  ) => (
    <article
      key={`${testimonial.id}-${index}`}
      onClick={() => handleCardClick(testimonial)}
      className="bg-white border border-stone-100 rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 w-[280px] sm:w-[320px] md:w-[380px] flex-shrink-0 cursor-pointer group relative snap-center"
    >
      <Quote className="absolute top-6 right-6 w-6 h-6 sm:w-8 sm:h-8 text-stone-100 fill-stone-100 group-hover:text-sage-100 group-hover:fill-sage-100 transition-colors" />

      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt=""
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sage-50 text-sage-600 flex items-center justify-center text-base sm:text-lg font-serif font-medium">
            {testimonial.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="font-serif font-medium text-stone-900 text-base sm:text-lg truncate">
            {testimonial.name}
          </h3>
          <div className="flex gap-0.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                  i < testimonial.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm sm:text-[15px] text-stone-600 leading-relaxed line-clamp-4 font-light">
        &ldquo;{testimonial.text}&rdquo;
      </p>

      {testimonial.replies && testimonial.replies.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-4 border-t border-stone-50 flex items-center gap-2 text-xs font-medium text-sage-600">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>
            {t('testimonials.reply', { defaultValue: 'Read reply' })}
          </span>
        </div>
      )}
    </article>
  )

  return (
    <section
      className="py-16 sm:py-24 lg:py-32 bg-white overflow-hidden"
      id="testimonials"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 sm:mb-16 text-center">
        <span className="inline-block text-[10px] sm:text-xs font-bold tracking-[0.2em] text-stone-600 uppercase mb-3 sm:mb-4">
          {t('testimonials.label', { defaultValue: 'Testimonials' })}
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-stone-900 mb-4 sm:mb-6">
          {t('testimonials.title', { defaultValue: 'Kind Words' })}
        </h2>
        <p className="text-base sm:text-lg text-stone-500 max-w-xl mx-auto font-light">
          {t('testimonials.subtitle', {
            defaultValue:
              'Experiences shared by our community',
          })}
        </p>
      </div>

      <div
        className="space-y-4 sm:space-y-8"
        onMouseEnter={() => !isMobile && setPaused(true)}
        onMouseLeave={() =>
          !isMobile && !selectedTestimonial && setPaused(false)
        }
      >
        {isMobile ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 px-6 -mx-4 no-scrollbar">
            {items.map((tst, index) => renderCard(tst, index))}
            <div className="w-4 shrink-0" />
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 w-24 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            {/* Row 1 → left */}
            <div className="flex gap-6 overflow-hidden py-4">
              <motion.div
                className="flex gap-6 w-max"
                animate={
                  prefersReduced || paused
                    ? undefined
                    : { x: [0, -1000] }
                }
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: 40,
                    ease: 'linear',
                  },
                }}
              >
                {items.map((tst, i) => renderCard(tst, i))}
                {items.map((tst, i) => renderCard(tst, i + 100))}
              </motion.div>
            </div>

            {/* Row 2 → right */}
            <div className="flex gap-6 overflow-hidden py-4">
              <motion.div
                className="flex gap-6 w-max"
                animate={
                  prefersReduced || paused
                    ? undefined
                    : { x: [-1000, 0] }
                }
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: 45,
                    ease: 'linear',
                  },
                }}
              >
                {items.map((tst, i) => renderCard(tst, i + 200))}
                {items.map((tst, i) => renderCard(tst, i + 300))}
              </motion.div>
            </div>
          </div>
        )}
      </div>

      <TestimonialModal
        isOpen={!!selectedTestimonial}
        testimonial={selectedTestimonial}
        onClose={handleModalClose}
      />
    </section>
  )
}

export default memo(TestimonialBanner)
