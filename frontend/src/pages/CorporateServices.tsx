import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'

interface CorporateServicesProps {
  onContactClick?: () => void
}

export function CorporateServices({ onContactClick }: CorporateServicesProps) {
  const { t } = useTranslation()

  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick()
    } else {
      const contactEvent = new CustomEvent('openContactModal', {
        detail: { subject: t('corporate.cta.subject', 'Demande de devis entreprise') },
      })
      window.dispatchEvent(contactEvent)
    }
  }

  const benefits = [
    t('corporate.benefits.equipment', 'Matériel fourni (chaise de massage ergonomique)'),
    t('corporate.benefits.group', 'Groupe minimum requis pour déplacement'),
    t('corporate.benefits.wellbeing', 'Amélioration du bien-être de vos équipes'),
  ]

  return (
    <section className="py-20 lg:py-24 bg-porcelain">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-charcoal mb-6">
            {t('corporate.title', 'Services en entreprise')}
          </h2>

          {/* Pricing */}
          <p className="text-lg md:text-xl text-charcoal/70 mb-10">
            {t('corporate.pricing.description', 'Séances de massage de 20 minutes à')}{' '}
            <span className="font-bold text-charcoal">
              {t('corporate.pricing.amount', '15€ par personne')}
            </span>
          </p>

          {/* Benefits Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card p-8 md:p-10 mb-10"
          >
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-center justify-center gap-3 text-charcoal/80"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-sage-100 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-sage-600" strokeWidth={3} />
                  </div>
                  <span className="text-base md:text-lg">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContactClick}
            className="px-10 py-4 bg-sage-500 hover:bg-sage-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {t('corporate.cta.text', 'Demander un devis entreprise')}
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
