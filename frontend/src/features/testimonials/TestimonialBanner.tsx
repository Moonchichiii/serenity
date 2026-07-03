import { memo, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, MessageCircle, Quote } from "lucide-react";

import { useTestimonials } from "@/hooks/useTestimonials";
import { renderAccentTitle } from "@/lib/accentTitle";
import type { WagtailTestimonial } from "@/types/api";
import { TestimonialModal } from "@/components/modal/TestimonialModal";

/**
 * TestimonialBanner — V2 skin, identical behaviour.
 *
 * The roller stays: two opposing rows on desktop, one row on mobile,
 * pause on hover and while the modal is open, click a card to read the
 * full story. What changed:
 *  - framer-motion removed — the loop is a pure CSS keyframe
 *    (.marquee-track, translateX 0→-50% over duplicated content), so
 *    prefers-reduced-motion is handled in the stylesheet and the main
 *    thread does nothing while it rolls.
 *  - Palette aligned: Tailwind's default stone/amber greys are gone —
 *    charcoal, warm-grey, sand, terracotta and honey tokens throughout,
 *    on a cream section canvas so the white cards actually lift.
 *  - Typography: Sentient heading with the shared accent-word italic,
 *    terracotta section eyebrow (the light-canvas rule).
 */

export function TestimonialBanner() {
  const { t } = useTranslation();
  const { data: testimonials = [] } = useTestimonials(4);

  const [selectedTestimonial, setSelectedTestimonial] =
    useState<WagtailTestimonial | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* Duplicate so a -50% translate loops seamlessly. */
  const items = useMemo(() => {
    if (testimonials.length === 0) return [];
    if (testimonials.length < 4) {
      return [...testimonials, ...testimonials, ...testimonials, ...testimonials];
    }
    return [...testimonials, ...testimonials];
  }, [testimonials]);

  const [paused, setPaused] = useState(false);

  if (!testimonials || testimonials.length === 0) return null;

  const handleCardClick = (testimonial: WagtailTestimonial) => {
    setPaused(true);
    setSelectedTestimonial(testimonial);
  };

  const handleModalClose = () => {
    setSelectedTestimonial(null);
    setPaused(false);
  };

  const renderCard = (testimonial: WagtailTestimonial, index: number) => (
    <article
      key={`${testimonial.id}-${index}`}
      onClick={() => handleCardClick(testimonial)}
      className="group relative w-[280px] flex-shrink-0 cursor-pointer rounded-2xl border border-warm-grey-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover sm:w-[320px] sm:p-8 md:w-[380px]"
    >
      <Quote className="absolute top-6 right-6 h-6 w-6 fill-sand-200 text-sand-200 transition-colors group-hover:fill-honey-200 group-hover:text-honey-200 sm:h-8 sm:w-8" />

      <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt=""
            className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm sm:h-12 sm:w-12"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full font-heading sm:h-12 sm:w-12"
            style={{
              backgroundColor: "var(--color-sand-200)",
              color: "var(--color-sage-700)",
              fontSize: "var(--typo-body)",
            }}
          >
            {testimonial.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        <div className="min-w-0">
          <h3
            className="truncate font-heading text-charcoal"
            style={{
              fontSize: "var(--typo-h4)",
              lineHeight: "var(--leading-h4)",
            }}
          >
            {testimonial.name}
          </h3>
          <div className="flex gap-0.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                  i < testimonial.rating
                    ? "fill-terracotta-400 text-terracotta-400"
                    : "text-warm-grey-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <p
        className="line-clamp-4 font-light text-charcoal/70"
        style={{
          fontSize: "var(--typo-small)",
          lineHeight: "var(--leading-small)",
        }}
      >
        &ldquo;{testimonial.text}&rdquo;
      </p>

      {testimonial.replies && testimonial.replies.length > 0 && (
        <div
          className="mt-4 flex items-center gap-2 border-t border-sand-100 pt-4 font-medium text-sage-600 sm:mt-6"
          style={{
            fontSize: "var(--typo-caption)",
            lineHeight: "var(--leading-caption)",
          }}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>{t("testimonials.reply", { defaultValue: "Read reply" })}</span>
        </div>
      )}
    </article>
  );

  const marqueeRow = (
    direction: "left" | "right",
    duration: string,
    keyOffsetA: number,
    keyOffsetB: number,
    gapClass: string,
  ) => (
    <div className={`flex overflow-hidden py-4 ${gapClass}`}>
      <div
        className={`marquee-track ${gapClass}`}
        data-direction={direction}
        data-paused={paused}
        style={{ "--marquee-duration": duration } as React.CSSProperties}
      >
        {items.map((tst, i) => renderCard(tst, i + keyOffsetA))}
        {items.map((tst, i) => renderCard(tst, i + keyOffsetB))}
      </div>
    </div>
  );

  return (
    <section
      className="bg-tint-cream relative overflow-hidden"
      id="testimonials"
      style={{
        paddingTop: "var(--space-section-y)",
        paddingBottom: isMobile
          ? "calc(var(--space-section-y) + 5rem)"
          : "var(--space-section-y)",
      }}
    >
      <div className="noise-texture-subtle" aria-hidden="true" />

      <div
        className="relative z-10 mx-auto max-w-7xl text-center"
        style={{
          paddingLeft: "var(--space-container-x)",
          paddingRight: "var(--space-container-x)",
          marginBottom: "var(--space-title-to-content)",
        }}
      >
        <span className="section-eyebrow mb-4">
          {t("testimonials.label", { defaultValue: "Testimonials" })}
        </span>
        <h2
          className="font-heading text-charcoal"
          style={{
            fontSize: "var(--typo-h2)",
            lineHeight: "var(--leading-h2)",
            marginBottom: "var(--space-heading-to-paragraph)",
          }}
        >
          {renderAccentTitle(
            t("testimonials.title", { defaultValue: "Kind Words" }),
          )}
        </h2>
        <p
          className="mx-auto max-w-xl font-light text-charcoal/60"
          style={{
            fontSize: "var(--typo-body)",
            lineHeight: "var(--leading-body)",
          }}
        >
          {t("testimonials.subtitle", {
            defaultValue: "Experiences shared by our community",
          })}
        </p>
      </div>

      <div
        className="relative z-10 space-y-4 sm:space-y-8"
        onMouseEnter={() => !isMobile && setPaused(true)}
        onMouseLeave={() =>
          !isMobile && !selectedTestimonial && setPaused(false)
        }
      >
        {/* Edge fades — cream, matching the section canvas */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-32"
          style={{
            background:
              "linear-gradient(to right, var(--color-cream), transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-32"
          style={{
            background:
              "linear-gradient(to left, var(--color-cream), transparent)",
          }}
        />

        {isMobile ? (
          marqueeRow("left", "25s", 0, 500, "gap-4")
        ) : (
          <>
            {marqueeRow("left", "40s", 0, 100, "gap-6")}
            {marqueeRow("right", "45s", 200, 300, "gap-6")}
          </>
        )}
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
