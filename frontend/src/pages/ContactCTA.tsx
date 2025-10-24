import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Phone, Mail } from 'lucide-react'

interface ContactCTAProps {
  onContactClick?: () => void
  onBookingClick?: () => void
  phoneNumber?: string
  email?: string
}

export function ContactCTA({
  onContactClick,
  onBookingClick,
  phoneNumber = '+33 1 23 45 67 89',
  email = 'contact@votremassage.fr',
}: ContactCTAProps) {
  const { t } = useTranslation()

  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick()
    } else {
      const contactEvent = new CustomEvent('openContactModal')
      window.dispatchEvent(contactEvent)
    }
  }

  const handleBookingClick = () => {
    if (onBookingClick) {
      onBookingClick()
    } else {
      window.location.href = '/booking'
    }
  }

  return (
    <section className="relative py-20 lg:py-24 bg-gradient-to-br from-sage-500 via-honey-500 to-honey-600 overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
            {t('contact_cta.title', 'Prêt à prendre soin de vous ?')}
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/95 leading-relaxed mb-12">
            {t(
              'contact_cta.description',
              'Réservez votre séance dès maintenant ou contactez-nous pour toute question'
            )}
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBookingClick}
              className="px-10 py-4 bg-white text-sage-600 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              {t('contact_cta.cta.book', 'Réserver une séance')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContactClick}
              className="px-10 py-4 bg-transparent text-white border-2 border-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 w-full sm:w-auto"
            >
              {t('contact_cta.cta.contact', 'Nous contacter')}
            </motion.button>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center text-white/90 text-sm"
          >
            <a
              href={`tel:${phoneNumber.replace(/\s/g, '')}`}
              className="flex items-center justify-center gap-2 hover:text-white transition-colors duration-300"
            >
              <Phone className="w-4 h-4" />
              <span>{phoneNumber}</span>
            </a>

            <a
              href={`mailto:${email}`}
              className="flex items-center justify-center gap-2 hover:text-white transition-colors duration-300"
            >
              <Mail className="w-4 h-4" />
              <span>{email}</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
