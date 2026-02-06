import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { cmsAPI, type WagtailHomePage } from '@/api/cms'
import CloudImage from '@/components/ResponsiveImage'
import CookieConsent from '@/components/CookieConsent'
import { useModal } from '@/shared/hooks/useModal'
import { motion } from 'framer-motion'

export function Hero() {
  const { t, i18n } = useTranslation()
  const [cmsData, setCmsData] = useState<WagtailHomePage | null>(null)
  const [active, setActive] = useState(0)
  const { open } = useModal()

  useEffect(() => {
    cmsAPI.getHomePage().then(setCmsData).catch(() => setCmsData(null))
  }, [])

  const slides = useMemo(() => {
    const s = (cmsData?.hero_slides || []).filter(s => s.image)
    if (s.length) return s
    if (cmsData?.hero_image) return [{ image: cmsData.hero_image }]
    return null
  }, [cmsData])

  useEffect(() => {
    if (!slides || slides.length < 2) return
    const id = setInterval(() => setActive(p => (p + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [slides])

  const lang = (i18n.language === 'en' || i18n.language === 'fr') ? (i18n.language as 'en' | 'fr') : 'fr'

  // CMS-FIRST LOGIC
  const title = cmsData ? ((lang === 'fr' ? cmsData.hero_title_fr : cmsData.hero_title_en) ?? t('hero.title')) : t('hero.title')
  const subtitle = cmsData ? ((lang === 'fr' ? cmsData.hero_subtitle_fr : cmsData.hero_subtitle_en) ?? t('hero.subtitle')) : t('hero.subtitle')

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

      {/* 1. BACKGROUND SLIDESHOW */}
      <div className="absolute inset-0 z-0">
        {slides ? (
          slides.map((s, idx) => {
            const alt = s.image?.title || 'Hero'
            const visible = active === idx
            return (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  visible ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden="true"
              >
                {/* Scale animation for breathing effect */}
                <div className={`w-full h-full transition-transform duration-[6000ms] ease-linear ${visible ? 'scale-110' : 'scale-100'}`}>
                  <CloudImage
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

      {/* 3. CONTENT - Centered but Wider */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 flex flex-col items-center justify-center text-center h-full">

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          // CHANGED: Increased max-width to 'max-w-5xl' to let it stretch wide
          className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium text-stone-900 mb-6 drop-shadow-sm max-w-5xl"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          // CHANGED: Increased max-width to 'max-w-3xl' (was 2xl)
          // This makes the text block rectangular instead of square
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
            className="w-full sm:w-auto h-14 rounded-full px-8 text-base shadow-warm hover:shadow-elevated transition-transform hover:-translate-y-1"
          >
            {t('hero.ctaPrivate')}
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
            className="w-full sm:w-auto h-14 rounded-full px-8 text-base shadow-sm hover:shadow-md transition-transform hover:-translate-y-1"
          >
            {t('hero.ctaCorporate')}
          </Button>
        </motion.div>
      </div>

      <CookieConsent />

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  )
}
