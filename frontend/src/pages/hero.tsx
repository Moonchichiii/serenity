import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { cmsAPI, type WagtailHomePage } from '@/api/cms'
import CloudImage from '@/components/ResponsiveImage'
import CookieConsent from '@/components/CookieConsent'

export function Hero() {
  const { t, i18n } = useTranslation()
  const [cmsData, setCmsData] = useState<WagtailHomePage | null>(null)
  const [active, setActive] = useState(0)

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

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const lang = (i18n.language === 'en' || i18n.language === 'fr') ? (i18n.language as 'en' | 'fr') : 'fr'
  const title = cmsData ? ((lang === 'fr' ? cmsData.hero_title_fr : cmsData.hero_title_en) ?? t('hero.title')) : t('hero.title')
  const subtitle = cmsData ? ((lang === 'fr' ? cmsData.hero_subtitle_fr : cmsData.hero_subtitle_en) ?? t('hero.subtitle')) : t('hero.subtitle')

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-hero">
      <div className="absolute inset-0 z-0">
        {slides ? (
          slides.map((s, idx) => {
            const alt = s.image?.title || 'Hero'
            const visible = active === idx
            return (
              <div
                key={idx}
                className="absolute inset-0"
                aria-hidden="true"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'scale(1.05)' : 'scale(1)',
                  transition: 'opacity 1s ease-out, transform 1s ease-out',
                }}
              >
                <CloudImage
                  image={s.image}
                  alt={alt}
                  priority={idx === 0}
                  className="w-full h-full"
                  fit="cover"
                  sizes="100vw"
                />
              </div>
            )
          })
        ) : (
          <div className="absolute inset-0" aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-sage-200/70 via-sand-100/70 to-porcelain/70" />
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
        {/* H1: No animation to prevent render delay for LCP */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-charcoal mb-6">
          {title}
        </h1>

        {/* Subtitle: Subtle fade-in only on mobile, instant on desktop */}
        <p className="text-xl md:text-2xl text-charcoal/80 mb-10 max-w-2xl mx-auto text-balance md:opacity-100 animate-fade-in md:animate-none">
          {subtitle}
        </p>

        {/* CTA: Subtle fade-in only on mobile, instant on desktop */}
        <div className="md:opacity-100 animate-fade-in md:animate-none" style={{ animationDelay: '0.2s' }}>
          <Button
            size="lg"
            onClick={scrollToContact}
            className="shadow-elevated md:hover:scale-105"
          >
            {t('hero.cta')}
          </Button>
        </div>
      </div>
<CookieConsent />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-porcelain to-transparent z-10" />

    </section>
  )
}
