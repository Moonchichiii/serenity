import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ServicesHeroProps {
  onContactClick?: () => void
}

export function ServicesHero({ onContactClick }: ServicesHeroProps) {
  const { t } = useTranslation()

  const handleCorporateContactClick = () => {
    if (onContactClick) {
      onContactClick()
    } else {
      const contactEvent = new CustomEvent('openContactModal', {
        detail: {
          subject: t('services.corporate.ctaSubject', 'Corporate Quote Request'),
        },
      })
      window.dispatchEvent(contactEvent)
    }
  }

  // Corporate services content - using i18n translations
  // No CMS needed for this section - it's marketing copy
  const benefits = [
    t('services.corporate.benefit1', 'Professional equipment provided'),
    t('services.corporate.benefit2', 'Flexible group sizes available'),
    t('services.corporate.benefit3', 'Boost team wellness and morale'),
  ]

  return (
    <section
      id="services-hero"
      className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-sage-400 via-honey-400 to-terracotta-400 overflow-hidden scroll-mt-28"
    >
      {/* Dotted background pattern */}
      <div className="absolute inset-0 opacity-[0.08] lg:hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Soft light blobs */}
      <div className="absolute top-[10%] left-[10%] w-[220px] h-[220px] rounded-full bg-white/10 blur-[70px]" />
      <div className="absolute bottom-[15%] right-[15%] w-[280px] h-[280px] rounded-full bg-white/10 blur-[90px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto text-center"
        >
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.1)]"
          >
            {t('services.corporate.title', 'Corporate Wellness Programs')}
          </motion.h2>

          {/* Pricing */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg sm:text-xl md:text-2xl text-white/95"
          >
            {t('services.corporate.pricing', 'Starting from')}{' '}
            <span className="font-extrabold text-white">
              {t('services.corporate.price', '€45/person')}
            </span>
          </motion.p>

          {/* Benefits */}
          <motion.ul
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 md:mt-10 space-y-4 md:space-y-5 max-w-3xl mx-auto text-left"
          >
            {benefits.map((benefit, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.35 + index * 0.12 }}
                className="flex items-center gap-3"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </span>
                <span className="text-base sm:text-lg md:text-xl text-white/95">
                  {benefit}
                </span>
              </motion.li>
            ))}
          </motion.ul>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-8 md:mt-10"
          >
            <motion.button
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCorporateContactClick}
              className="px-8 md:px-12 py-4 md:py-5 bg-sage-500 hover:bg-sage-600 text-white rounded-full font-semibold text-lg md:text-xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {t('services.corporate.cta', 'Request a Quote')}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
