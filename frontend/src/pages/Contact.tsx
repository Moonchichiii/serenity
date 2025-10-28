import { motion } from 'framer-motion'
import { ContactForm } from '@/components/forms/Contactform'
import { useTranslation } from 'react-i18next'

export function Contact() {
  const { t } = useTranslation()

  return (
    <div>
      {/* Pull section closer to previous one:
         - drop top padding to 0 on mobile
         - tiny top pad on md+ to breathe
         - keep bottom padding for footer spacing
         - optional negative margin to counter any remaining whitespace from previous section
      */}
      <section
        id="contact"
        className="container mx-auto px-4 pt-0 md:pt-2 pb-20 -mt-2 md:-mt-3 scroll-mt-28"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border-2 border-sage-200/30">
            <h2 className="text-2xl font-heading font-bold text-charcoal mb-6">
              {t('contact.form.title', 'Contact Form')}
            </h2>

            <ContactForm />
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Contact
