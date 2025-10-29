import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import { cmsAPI, type WagtailHomePage } from '@/api/cms'
import poster from '@/assets/poster.webp'

interface ServicesHeroProps {
  onContactClick?: () => void
}

export function ServicesHero({ onContactClick }: ServicesHeroProps) {
  const { i18n } = useTranslation()
  const [page, setPage] = useState<WagtailHomePage | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // --- Cloudinary config from .env
  const cloudName = import.meta.env['VITE_CLOUDINARY_CLOUD_NAME']
  const videoId = import.meta.env['VITE_CLOUDINARY_VIDEO_ID']
  const transform = 'f_mp4,q_auto:eco,w_1280,h_720,c_fill'
  const VIDEO_SRC = `https://res.cloudinary.com/${cloudName}/video/upload/${transform}/${videoId}.mp4`

  // --- accessibility prefs
  const saveData =
    typeof navigator !== 'undefined' &&
    // @ts-expect-error
    navigator.connection?.saveData
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const shouldDisableVideo = !!saveData || !!prefersReducedMotion

  // --- autoplay fix (force start once mounted)
  useEffect(() => {
    if (shouldDisableVideo) return
    const v = videoRef.current
    if (v) {
      const tryPlay = async () => {
        try {
          v.load()
          await v.play()
        } catch {
          // autoplay might be blocked, ignore
        }
      }
      tryPlay()
    }
  }, [shouldDisableVideo])

  // --- CMS
  useEffect(() => {
    cmsAPI.getHomePage().then(setPage)
  }, [])
  if (!page) return null

  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en'
  const getString = (key: keyof WagtailHomePage) =>
    typeof page[key] === 'string' ? (page[key] as string) : ''

  const title = getString(`services_hero_title_${lang}` as keyof WagtailHomePage)
  const priceLabel = getString(`services_hero_pricing_label_${lang}` as keyof WagtailHomePage)
  const price = getString(`services_hero_price_${lang}` as keyof WagtailHomePage)
  const cta = getString(`services_hero_cta_${lang}` as keyof WagtailHomePage)
  const benefits = [
    getString(`services_hero_benefit_1_${lang}` as keyof WagtailHomePage),
    getString(`services_hero_benefit_2_${lang}` as keyof WagtailHomePage),
    getString(`services_hero_benefit_3_${lang}` as keyof WagtailHomePage),
  ].filter(Boolean)

  const handleClick = () => {
    if (onContactClick) return onContactClick()
    const section = document.getElementById('contact')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.dispatchEvent(new CustomEvent('openContactModal', { detail: { subject: title } }))
    }
  }

  return (
    <section
      id="services-hero"
      className="relative flex items-center justify-center overflow-hidden min-h-[70vh]"
      aria-labelledby="services-hero-title"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover object-center"
        poster={poster}
        autoPlay={!shouldDisableVideo}
        muted
        playsInline
        loop={!shouldDisableVideo}
        preload="auto"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="mx-auto w-full max-w-3xl"
        >
          <div className="px-6 py-8 md:px-10 md:py-12 rounded-2xl bg-black/60 backdrop-blur-sm ring-1 ring-white/15 text-center shadow-xl">
            <h2
              id="services-hero-title"
              className="font-heading font-extrabold text-white leading-tight tracking-tight text-4xl sm:text-5xl md:text-6xl"
            >
              {title}
            </h2>

            <p className="mt-3 sm:mt-4 text-lg text-white/95">
              {priceLabel}{' '}
              <span className="font-bold text-white whitespace-nowrap">{price}</span>
            </p>

            <ul className="mt-8 grid gap-4 text-left">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex w-6 h-6 shrink-0 rounded-full bg-white/20 items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </span>
                  <span className="text-base text-white/95">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <button
                onClick={handleClick}
                className="inline-flex items-center justify-center rounded-full font-semibold px-8 py-4 bg-sage-500 hover:bg-sage-600 text-white text-lg shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                aria-label={cta}
              >
                {cta}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
