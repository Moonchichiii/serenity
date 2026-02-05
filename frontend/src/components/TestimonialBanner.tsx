import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useAnimation } from 'framer-motion';
import { Star, MessageCircle, Quote } from 'lucide-react';
import { cmsAPI, type WagtailTestimonial } from '@/api/cms';
import { TestimonialModal } from '@/components/modals/TestimonialModal';

export function TestimonialBanner() {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<WagtailTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<WagtailTestimonial | null>(null);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const controlsTop = useAnimation();
  const controlsBottom = useAnimation();
  const [paused, setPaused] = useState(false);
  const trackTopRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo(() => {
    if (testimonials.length === 0) return [];
    return testimonials.length < 4
      ? [...testimonials, ...testimonials, ...testimonials]
      : [...testimonials, ...testimonials];
  }, [testimonials]);

  useEffect(() => {
    cmsAPI
      .getTestimonials(4)
      .then((data) => setTestimonials(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (prefersReduced || !trackTopRef.current || items.length === 0) return;

    const loopWidth =
      trackTopRef.current.scrollWidth / (testimonials.length < 4 ? 3 : 2);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const duration = isMobile ? 50 : 70; // Slower, smoother

    if (paused) {
      controlsTop.stop();
      controlsBottom.stop();
      return;
    }

    if (!paused) {
      controlsTop.start({
        x: [0, -loopWidth],
        transition: {
          duration,
          ease: 'linear',
          repeat: Infinity,
        },
      });

      controlsBottom.start({
        x: [-loopWidth / 2, -loopWidth - loopWidth / 2],
        transition: {
          duration,
          ease: 'linear',
          repeat: Infinity,
        },
      });
    }

    return () => {
      controlsTop.stop();
      controlsBottom.stop();
    };
  }, [
    controlsTop,
    controlsBottom,
    paused,
    prefersReduced,
    items.length,
    testimonials.length,
  ]);

  const handleCardClick = (testimonial: WagtailTestimonial) => {
    setPaused(true);
    setSelectedTestimonial(testimonial);
  };

  const handleModalClose = () => {
    setSelectedTestimonial(null);
    setPaused(false);
  };

  if (loading) return null; // No spinner needed here, just renders when ready
  if (testimonials.length === 0) return null;

  const renderCard = (testimonial: WagtailTestimonial, index: number) => (
    <article
      key={`${testimonial.id}-${index}`}
      onClick={() => handleCardClick(testimonial)}
      className="bg-white border border-stone-100 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 w-[320px] sm:w-[380px] flex-shrink-0 cursor-pointer group relative snap-center"
    >
      <Quote className="absolute top-8 right-8 w-8 h-8 text-stone-100 fill-stone-100 group-hover:text-sage-100 group-hover:fill-sage-100 transition-colors" />

      <div className="flex items-center gap-4 mb-6">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt=""
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-sage-50 text-sage-600 flex items-center justify-center text-lg font-serif font-medium">
            {testimonial.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}

        <div>
          <h3 className="font-serif font-medium text-stone-900 text-lg">
            {testimonial.name}
          </h3>
          <div className="flex gap-0.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < testimonial.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-[15px] text-stone-600 leading-relaxed line-clamp-4 font-light">
        "{testimonial.text}"
      </p>

      {testimonial.replies && testimonial.replies.length > 0 && (
        <div className="mt-6 pt-4 border-t border-stone-50 flex items-center gap-2 text-xs font-medium text-sage-600">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{t('testimonials.reply', 'Read reply')}</span>
        </div>
      )}
    </article>
  );

  return (
    <section className="py-24 lg:py-32 bg-white overflow-hidden" id="testimonials">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <span className="inline-block text-xs font-bold tracking-[0.2em] text-stone-400 uppercase mb-4">
          {t('testimonials.label', 'Testimonials')}
        </span>
        <h2 className="text-4xl md:text-5xl font-serif font-medium text-stone-900 mb-6">
          {t('testimonials.title', 'Kind Words')}
        </h2>
        <p className="text-lg text-stone-500 max-w-xl mx-auto font-light">
          {t('testimonials.subtitle', 'Experiences shared by our community')}
        </p>
      </div>

      <div
        className="space-y-8"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => !selectedTestimonial && setPaused(false)}
      >
        <div className="relative">
          {/* Gradient Fade Edges */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

          {/* Row 1: Left */}
          <div className="flex gap-6 overflow-hidden py-4">
            <motion.div
              ref={trackTopRef}
              className="flex gap-6 w-max"
              animate={prefersReduced ? undefined : controlsTop}
            >
              {/* Buffers for smooth loop */}
              <div className="w-[100px]" />
              {items.map((tst, index) => renderCard(tst, index))}
              <div className="w-[100px]" />
            </motion.div>
          </div>

          {/* Row 2: Right */}
          <div className="flex gap-6 overflow-hidden py-4">
            <motion.div
              className="flex gap-6 w-max"
              animate={prefersReduced ? undefined : controlsBottom}
            >
              <div className="w-[100px]" />
              {items.map((tst, index) => renderCard(tst, index + 100))}
              <div className="w-[100px]" />
            </motion.div>
          </div>
        </div>
      </div>

      <TestimonialModal
        isOpen={!!selectedTestimonial}
        testimonial={selectedTestimonial}
        onClose={handleModalClose}
      />
    </section>
  );
}

export default memo(TestimonialBanner);
