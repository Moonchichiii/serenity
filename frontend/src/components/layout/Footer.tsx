import React from 'react'
import { Mail, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const Footer: React.FC = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer
      id="site-footer"
      className="bg-charcoal text-porcelain py-10 mt-16"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Brand / tagline */}
            <div>
              <h3 className="text-lg font-semibold">
                {t('footer.title', { defaultValue: 'Serenity' })}
              </h3>
              <p className="mt-2 text-sm opacity-80">
                {t('footer.tagline', {
                  defaultValue: 'Massage thérapeutique professionnel',
                })}
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-base font-semibold">
                {t('footer.contact', { defaultValue: 'Contact' })}
              </h4>
              <div className="mt-3 space-y-2">
                <a
                  href={`mailto:${t('footer.email', {
                    defaultValue: 'contact@example.com',
                  })}`}
                  className="flex items-center space-x-2 text-porcelain/80 hover:text-honey transition-colors duration-200 group"
                  aria-label={t('footer.email', { defaultValue: 'Email' })}
                >
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>
                    {t('footer.email', { defaultValue: 'contact@example.com' })}
                  </span>
                </a>

                <a
                  href={`tel:${t('footer.phone', {
                    defaultValue: '+33123456789',
                  })}`}
                  className="flex items-center space-x-2 text-porcelain/80 hover:text-honey transition-colors duration-200 group"
                  aria-label={t('footer.phone', { defaultValue: 'Phone' })}
                >
                  <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>
                    {t('footer.phone', {
                      defaultValue: '+33 1 23 45 67 89',
                    })}
                  </span>
                </a>
              </div>
            </div>

            {/* Hours or extra column */}
            <div>
              <h4 className="text-base font-semibold">
                {t('footer.hours', { defaultValue: 'Heures' })}
              </h4>
              <p className="mt-2 text-sm opacity-80">
                {t('footer.hoursValue', { defaultValue: 'Lun–Sam: 9:00–19:00' })}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 text-xs opacity-70 flex justify-between flex-col sm:flex-row gap-2">
            <p>
              © {currentYear} Serenity —{' '}
              {t('footer.rights', { defaultValue: 'Tous droits réservés.' })}
            </p>
            <p className="text-porcelain/70">
              {t('footer.address', { defaultValue: 'Paris, France' })}
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
