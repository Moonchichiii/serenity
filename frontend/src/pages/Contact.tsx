import { motion } from 'framer-motion'
import { ContactForm } from '@/components/forms/Contactform'
import { useTranslation } from 'react-i18next'

export function Contact() {
  const { t } = useTranslation()

  return (
    <div>
      <section className="container mx-auto px-4 pb-24 pt-16">
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
