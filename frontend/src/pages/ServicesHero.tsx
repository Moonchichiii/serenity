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
  const priceLabel = getString(`services_hero_pricing_label_${lang}` as keyof WagtailHomePage) || ''
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
    <section id="services-hero" className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-sage-400 via-honey-400 to-terracotta-400 overflow-hidden scroll-mt-28" aria-labelledby="services-hero-title">
      <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 id="services-hero-title" className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold text-white">{title}</h2>
          <p className="mt-4 text-xl text-white/95">
            {priceLabel} <span className="font-bold text-white">{price}</span>
          </p>

          <ul className="mt-8 space-y-4 max-w-3xl mx-auto text-left">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </span>
                <span className="text-lg text-white/95">{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <button
              onClick={handleClick}
              className="px-8 py-4 bg-sage-500 hover:bg-sage-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-sage-500 transition-all duration-300"
              aria-label={cta}
            >
              {cta}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
