import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { cmsAPI, type WagtailHomePage } from '@/api/cms'
import { CloudImage } from '@/components/ui/ResponsiveImage'

export function Hero() {
  const { t, i18n } = useTranslation()
  const [cmsData, setCmsData] = useState<WagtailHomePage | null>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    cmsAPI.getHomePage().then(setCmsData).catch(() => {
      // Intentionally no fallback: we want to test CMS-only flow
      setCmsData(null)
    })
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
  }, [slides?.length])

  const scrollToBooking = () =>
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })

  const lang = (i18n.language === 'en' || i18n.language === 'fr') ? (i18n.language as 'en' | 'fr') : 'fr'
  const title = cmsData
    ? ((lang === 'fr' ? cmsData.hero_title_fr : cmsData.hero_title_en) ?? t('hero.title'))
    : t('hero.title')
  const subtitle = cmsData
    ? ((lang === 'fr' ? cmsData.hero_subtitle_fr : cmsData.hero_subtitle_en) ?? t('hero.subtitle'))
    : t('hero.subtitle')

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-hero">
      {/* Background images */}
      <div className="absolute inset-0 z-0">
        {slides ? (
          slides.map((s, idx) => {
            const alt = s.image?.title || 'Hero'
            return (
              <motion.div
                key={idx}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: active === idx ? 1 : 0, scale: active === idx ? 1.05 : 1.0 }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
                aria-hidden="true"
              >
                <CloudImage
                  image={s.image}
                  alt={alt}
                  priority={idx === 0}
                  className="w-full h-full"
                  fit="cover"
                  sizes="100vw"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement
                    console.error('[IMG ERROR]', {
                      src: el.currentSrc || el.src,
                      srcSet: el.srcset,
                      sizes: el.sizes,
                      naturalWidth: el.naturalWidth,
                      naturalHeight: el.naturalHeight,
                      alt,
                    })
                  }}
                />
              </motion.div>
            )
          })
        ) : (
          // No fallback images: just keep the gradient background
          <div className="absolute inset-0" aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-sage-200/70 via-sand-100/70 to-porcelain/70" />
      </div>

      {/* Foreground text */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
        <motion.h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-charcoal mb-6 text-balance"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
          {title}
        </motion.h1>

        <motion.p className="text-xl md:text-2xl text-charcoal/80 mb-10 max-w-2xl mx-auto text-balance"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          {subtitle}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
          <Button size="lg" onClick={scrollToBooking} className="shadow-elevated hover:scale-105">
            {t('hero.cta')}
          </Button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-porcelain to-transparent z-10" />
    </section>
  )
}
