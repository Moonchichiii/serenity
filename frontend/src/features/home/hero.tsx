import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useCMSPage } from '@/lib/cmsSelectors'
// CHANGED: Renamed import from CloudImage to ResponsiveImage
import ResponsiveImage from '@/components/ui/ResponsiveImage'
import CookieConsent from '@/components/ui/CookieConsent'
import { useModal } from '@/hooks/useModal'

export function Hero() {
  const { t, i18n } = useTranslation()
  const { open } = useModal()

  // ✅ Refactored: Read directly from context/loader state
  const cmsData = useCMSPage()
  const [active, setActive] = useState(0)

  const slides = useMemo(() => {
    // Note: We keep the filter here to ensure we have an image object structure,
    // even though ResponsiveImage handles nulls, the logic below relies on arrays of objects.
    const s = (cmsData?.hero_slides || []).filter((s) => s.image)
    if (s.length) return s
    if (cmsData?.hero_image) return [{ image: cmsData.hero_image }]
    return null
  }, [cmsData])

  useEffect(() => {
    if (!slides || slides.length < 2) return
    const id = setInterval(
      () => setActive((p) => (p + 1) % slides.length),
      5000,
    )
    return () => clearInterval(id)
  }, [slides])

  const lang =
    i18n.language === 'en' || i18n.language === 'fr'
      ? (i18n.language as 'en' | 'fr')
      : 'fr'

  // CMS-FIRST LOGIC
  const title =
    (lang === 'fr' ? cmsData?.hero_title_fr : cmsData?.hero_title_en) ??
    t('hero.title')
  const subtitle =
    (lang === 'fr' ? cmsData?.hero_subtitle_fr : cmsData?.hero_subtitle_en) ??
    t('hero.subtitle')

  const ctaPrivateText = t('hero.ctaPrivate')
  const ctaCorporateText = t('hero.ctaCorporate')

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* 1. BACKGROUND SLIDESHOW */}
      <div className="absolute inset-0 z-0">
        {slides ? (
          slides.map((s, idx) => {
            // Safe access to title, fallback string provided
            const alt = s.image?.title || 'Hero background'
            const visible = active === idx

            // CHANGED: Logic moved here for clarity.
            // We render the component; if s.image is null internal logic handles it,
            // but our filter above ensures s.image exists mostly.
            return (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  visible ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden="true"
              >
                {/* Scale animation for breathing effect */}
                <div
                  className={`w-full h-full transition-transform duration-[6000ms] ease-linear ${
                    visible ? 'scale-110' : 'scale-100'
                  }`}
                >
                  {/* CHANGED: Swapped CloudImage for ResponsiveImage, removed manual null checks */}
                  <ResponsiveImage
                    image={s.image}
                    alt={alt}
                    priority={idx === 0}
                    className="w-full h-full object-cover"
                    sizes="100vw"
                  />
                </div>
              </div>
            )
          })
        ) : (
          <div className="absolute inset-0 bg-stone-200" aria-hidden="true" />
        )}

        {/* 2. OVERLAY */}
        <div className="absolute inset-0 bg-stone-100/60 mix-blend-hard-light" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-50/90 via-stone-50/40 to-stone-50/20" />
      </div>

      {/* 3. CONTENT - Centered but Wider (max-w-5xl) */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 flex flex-col items-center justify-center text-center h-full">
        {/* Title */}
        <motion.h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium text-stone-900 mb-6 drop-shadow-sm max-w-5xl">
          {title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-2xl text-stone-600 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>

        {/* CTA Buttons - Centered */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
        >
          {/* Private Session */}
          <Button
            size="lg"
            onClick={() =>
              open('contact', { defaultSubject: 'Private session inquiry' })
            }
            aria-label={ctaPrivateText}
            className="w-full sm:w-auto h-14 rounded-full px-8 text-base shadow-warm hover:shadow-elevated transition-transform hover:-translate-y-1"
          >
            {ctaPrivateText}
          </Button>

          {/* Corporate Wellness */}
          <Button
            variant="secondary"
            size="lg"
            type="button"
            onClick={() => {
              const targetId = 'services-hero'
              const el = document.getElementById(targetId)
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                if (window.history && window.history.pushState) {
                  window.history.pushState(null, '', `#${targetId}`)
                }
              }
            }}
            aria-label={ctaCorporateText}
            className="w-full sm:w-auto h-14 rounded-full px-8 text-base shadow-sm hover:shadow-md transition-transform hover:-translate-y-1"
          >
            {ctaCorporateText}
          </Button>
        </motion.div>
      </div>

      <CookieConsent />

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  )
}
