import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { cmsAPI, type WagtailHomePage } from '@/api/cms'

interface ServicesHeroProps {
  onContactClick?: () => void
}

export function ServicesHero({ onContactClick }: ServicesHeroProps) {
  const { i18n } = useTranslation()
  const [page, setPage] = useState<WagtailHomePage | null>(null)

  const VIDEO_SRC_MP4 =
    'https://res.cloudinary.com/dbzlaawqt/video/upload/v1761680449/6629947-hd_1366_720_25fps_s6hrx4.mp4'
  const POSTER_SRC = ''

  useEffect(() => {
    cmsAPI.getHomePage().then(setPage)
  }, [])

  if (!page) return null

  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en'
  const getString = (key: keyof WagtailHomePage) => {
    const v = page[key]
    return typeof v === 'string' ? v : undefined
  }

  const title = getString(`services_hero_title_${lang}` as keyof WagtailHomePage) || ''
  const priceLabel =
    getString(`services_hero_pricing_label_${lang}` as keyof WagtailHomePage) || ''
  const price = getString(`services_hero_price_${lang}` as keyof WagtailHomePage) || ''
  const cta = getString(`services_hero_cta_${lang}` as keyof WagtailHomePage) || ''
  const benefits = [
    getString(`services_hero_benefit_1_${lang}` as keyof WagtailHomePage),
    getString(`services_hero_benefit_2_${lang}` as keyof WagtailHomePage),
    getString(`services_hero_benefit_3_${lang}` as keyof WagtailHomePage),
  ].filter(Boolean) as string[]

  const handleClick = () => {
    if (onContactClick) return onContactClick()

    const contactSection = document.getElementById('contact')
    if (contactSection) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      contactSection.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start',
      })
      setTimeout(() => {
        const heading = contactSection.querySelector('h2, h1')
        if (heading instanceof HTMLElement) heading.focus()
      }, prefersReduced ? 0 : 600)
    } else {
      window.dispatchEvent(new CustomEvent('openContactModal', { detail: { subject: title } }))
    }
  }

  return (
    <section
      id="services-hero"
      className="
        relative
        flex items-center justify-center overflow-hidden scroll-mt-28
        min-h-[65svh] sm:min-h-[70svh] md:min-h-[80vh]
      "
      aria-labelledby="services-hero-title"
    >
      <video
        className="absolute inset-0 w-full h-full object-cover object-center"
        poster={POSTER_SRC || undefined}
        autoPlay
        muted
        playsInline
        loop
        preload="metadata"
        aria-hidden="true"
      >
        <source src={VIDEO_SRC_MP4} type="video/mp4" />
      </video>

      <div
        className="
          absolute inset-0
          bg-black/60 sm:bg-black/50
        "
        aria-hidden="true"
      />
      <div
        className="
          pointer-events-none absolute inset-x-0 bottom-0 h-48
          bg-gradient-to-t from-black/60 to-transparent
        "
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="mx-auto w-full max-w-3xl"
        >
          <div
            className="
              px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10
              rounded-2xl
              bg-black/60 sm:bg-black/45
              backdrop-blur-[2px] sm:backdrop-blur-md
              ring-1 ring-white/15
              shadow-[0_10px_30px_rgba(0,0,0,0.35)]
              text-center
            "
          >
            <h2
              id="services-hero-title"
              className="
                font-heading font-extrabold text-white
                leading-tight tracking-tight
                text-3xl sm:text-5xl md:text-6xl
              "
            >
              {title}
            </h2>

            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-white/95">
              {priceLabel}{' '}
              <span className="font-bold text-white whitespace-nowrap">{price}</span>
            </p>

            <ul
              className="
                mt-6 sm:mt-8
                grid grid-cols-1 gap-3 sm:gap-4
                text-left
              "
            >
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex w-6 h-6 shrink-0 rounded-full bg-white/20 items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </span>
                  <span className="text-sm sm:text-base md:text-lg text-white/95">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 sm:mt-8 md:mt-10 pb-1 sm:pb-2">
              <button
                onClick={handleClick}
                className="
                  inline-flex items-center justify-center
                  rounded-full font-semibold
                  px-5 py-3 sm:px-7 sm:py-3.5 md:px-8 md:py-4
                  text-sm sm:text-base md:text-lg
                  bg-sage-500 hover:bg-sage-600 active:bg-sage-700
                  text-white
                  shadow-lg hover:shadow-xl
                  transition-all duration-300
                  focus:outline-none focus-visible:ring-4
                  focus-visible:ring-white/40 focus-visible:ring-offset-2
                  focus-visible:ring-offset-sage-500
                "
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
