import { useTranslation } from 'react-i18next'
import { Mail, Phone, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contact" className="bg-charcoal text-porcelain py-16 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 lg:px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-3xl font-heading font-semibold mb-4 text-porcelain">Serenity</h3>
            <p className="text-porcelain/80 leading-relaxed">{t('footer.tagline')}</p>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-xl font-heading font-semibold mb-4 flex items-center space-x-2 text-porcelain">
              <Clock className="w-5 h-5 text-honey-300" />
              <span>{t('footer.hours')}</span>
            </h4>
            <p className="text-porcelain/80">{t('footer.hoursText')}</p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-heading font-semibold mb-4 text-porcelain">{t('footer.contact')}</h4>
            <div className="space-y-3">
              
                href={`mailto:${t('footer.email')}`}
                className="flex items-center space-x-2 text-porcelain/80 hover:text-honey-300 transition-colors duration-200 group"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{t('footer.email')}</span>
              </a>
              
                href={`tel:${t('footer.phone')}`}
                className="flex items-center space-x-2 text-porcelain/80 hover:text-honey-300 transition-colors duration-200 group"
              >
                <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{t('footer.phone')}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-porcelain/20 pt-8 text-center text-porcelain/60 text-sm">
          <p>
            © {currentYear} Serenity. {t('footer.rights')}.
          </p>
        </div>
      </motion.div>
    </footer>
  )
}