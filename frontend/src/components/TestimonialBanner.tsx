import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useAnimation } from 'framer-motion';
import { Star, MessageCircle } from 'lucide-react';
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
    const duration = isMobile ? 50 : 60;

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

  if (loading) {
    return (
      <section className="py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500" />
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const renderCard = (testimonial: WagtailTestimonial, index: number) => (
    <article
      key={`${testimonial.id}-${index}`}
      onClick={() => handleCardClick(testimonial)}
      className="bg-white/95 border border-sage-100 rounded-3xl px-5 py-5 sm:px-6 sm:py-6 shadow-soft hover:shadow-elevated transition-shadow duration-300 w-[300px] sm:w-[350px] lg:w-[400px] flex-shrink-0 cursor-pointer group relative snap-center"
      aria-label={`${testimonial.name} – ${testimonial.rating}/5`}
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-sage-50 text-sage-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm border border-sage-200">
        <MessageCircle className="w-3 h-3" />
        {t('testimonials.reply', 'Reply')}
      </div>

      <div className="flex items-start gap-3 mb-3">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt=""
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-sage-200 flex items-center justify-center text-sm font-semibold text-charcoal/80">
            {testimonial.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-charcoal truncate">
            {testimonial.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="flex gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < testimonial.rating
                      ? 'fill-honey-400 text-honey-400'
                      : 'text-charcoal/15'
                  }`}
                />
              ))}
            </div>
            <span className="sr-only">{testimonial.rating} out of 5</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-charcoal/75 leading-relaxed line-clamp-6">
        {testimonial.text}
      </p>

      <div className="flex justify-between items-center mt-4">
        <p className="text-[11px] sm:text-xs text-charcoal/75">
          {testimonial.date}
        </p>
        {testimonial.replies && testimonial.replies.length > 0 && (
          <p className="text-[10px] sm:text-xs text-sage-600 font-medium flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {testimonial.replies.length}
          </p>
        )}
      </div>
    </article>
  );

  return (
    <section className="py-16 sm:py-20 bg-cream-50" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-12"
        >
          <p className="inline-flex items-center justify-center text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/60 rounded-full bg-white/60 px-4 py-1 mb-3">
            <span className="mr-1.5">
              <Star className="w-3.5 h-3.5 text-honey-400 fill-honey-400" />
            </span>
            {t('testimonials.label', 'Client stories / Témoignages clients')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-charcoal mb-3">
            {t('testimonials.title', 'What Clients Say')}
          </h2>
          <p className="text-base sm:text-lg text-charcoal/70 max-w-2xl mx-auto">
            {t('testimonials.subtitle', 'Real experiences from real people')}
          </p>
        </motion.div>

        <div
          className="relative overflow-hidden space-y-5 sm:space-y-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            if (!selectedTestimonial) setPaused(false);
          }}
          onFocus={() => setPaused(true)}
          onBlur={() => {
            if (!selectedTestimonial) setPaused(false);
          }}
          role="region"
          aria-roledescription="marquee"
          aria-live="off"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 bg-gradient-to-r from-cream-50 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-cream-50 to-transparent z-10" />

          <div
            className="flex gap-4 sm:gap-6 w-full overflow-x-auto snap-x snap-mandatory py-2 scroll-smooth no-scrollbar"
            onScroll={() => setPaused(true)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => {
              if (!selectedTestimonial) setPaused(false);
            }}
          >
            <motion.div
              ref={trackTopRef}
              className="flex gap-4 sm:gap-6 w-max"
              animate={prefersReduced ? undefined : controlsTop}
            >
              <div className="w-[calc(50vw_-_150px)] sm:w-[calc(50vw_-_175px)] lg:w-[calc(50vw_-_200px)] flex-shrink-0 snap-center" />
              {items.map((tst, index) => renderCard(tst, index))}
              <div className="w-[calc(50vw_-_150px)] sm:w-[calc(50vw_-_175px)] lg:w-[calc(50vw_-_200px)] flex-shrink-0 snap-center" />
            </motion.div>
          </div>

          <div
            className="flex gap-4 sm:gap-6 w-full overflow-x-auto snap-x snap-mandatory py-2 scroll-smooth no-scrollbar"
            onScroll={() => setPaused(true)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => {
              if (!selectedTestimonial) setPaused(false);
            }}
          >
            <motion.div
              className="flex gap-4 sm:gap-6 w-max"
              animate={prefersReduced ? undefined : controlsBottom}
            >
              <div className="w-[calc(50vw_-_150px)] sm:w-[calc(50vw_-_175px)] lg:w-[calc(50vw_-_200px)] flex-shrink-0 snap-center" />
              {items.map((tst, index) => renderCard(tst, index))}
              <div className="w-[calc(50vw_-_150px)] sm:w-[calc(50vw_-_175px)] lg:w-[calc(50vw_-_200px)] flex-shrink-0 snap-center" />
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
