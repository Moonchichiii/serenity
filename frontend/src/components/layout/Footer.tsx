import React from 'react'
import { Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import AnimatedInstagramIcon from '@/components/ui/AnimatedInstagramIcon'
import AnimatedFacebookIcon from '@/components/ui/AnimatedFacebookIcon'

const Footer: React.FC = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer id="site-footer" className="relative bg-charcoal text-porcelain py-12 mt-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid gap-10 sm:grid-cols-2 sm:items-start text-center sm:text-left max-w-5xl mx-auto sm:gap-16">
            {/* Brand + Contact */}
            <div className="flex flex-col items-center sm:items-start">
              <h3 className="inline-block font-heading font-semibold text-2xl text-porcelain">
                <span className="relative inline-block">
                  <span className="absolute -top-2 left-0 text-xs tracking-wide opacity-80">
                    La
                  </span>
                  <span className="ml-4">Serenity</span>
                </span>
              </h3>
              <p className="mt-3 text-sm opacity-80 max-w-[28ch] sm:max-w-none">
                {t('footer.tagline', { defaultValue: 'Massage thérapeutique professionnel' })}
              </p>

              <div className="mt-6">
                <h4 className="text-base font-semibold">
                  {t('footer.contact', { defaultValue: 'Contact' })}
                </h4>
                <div className="mt-3 space-y-2">
                  <a
                    href={`mailto:${t('footer.email', { defaultValue: 'contact@example.com' })}`}
                    className="inline-flex items-center gap-2 text-porcelain/80 hover:text-honey transition-colors"
                    aria-label={t('footer.email', { defaultValue: 'Email' })}
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
                    <span className="break-all">
                      {t('footer.email', { defaultValue: 'contact@example.com' })}
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Hours + Socials */}
            <div className="flex flex-col items-center sm:items-end gap-3">
              <div className="text-center sm:text-right">
                <h4 className="text-base font-semibold">
                  {t('footer.hours', { defaultValue: 'Heures' })}
                </h4>
                <p className="mt-2 text-sm opacity-80">
                  {t('footer.hoursValue', { defaultValue: 'Lun–Sam: 9:00–19:00' })}
                </p>
              </div>

              <div className="mt-2 flex items-center gap-8">
                <span className="sr-only">
                  {t('footer.follow', { defaultValue: 'Suivez-nous sur Instagram' })}
                </span>
                <AnimatedInstagramIcon
                  magnetic
                  size={44}
                  href="https://instagram.com/yourprofile?utm_source=site&utm_medium=footer"
                />
                <span className="sr-only">
                  {t('footer.follow', { defaultValue: 'Suivez-nous sur Facebook' })}
                </span>
                <AnimatedFacebookIcon
                  magnetic
                  size={44}
                  href="https://facebook.com/yourprofile?utm_source=site&utm_medium=footer"
                />
              </div>
            </div>
          </div>

          {/* Copyright bar */}
          <div className="mt-10 border-t border-white/10 pt-6 text-xs opacity-75 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-center sm:text-left">
            <p>
              © {currentYear} Serenity —{' '}
              {t('footer.rights', { defaultValue: 'Tous droits réservés.' })}
            </p>
            <p className="text-porcelain/70">
              {t('footer.address', { defaultValue: 'Marseille, France' })}
            </p>
          </div>

          <a
            href="https://www.nordiccodeworks.com"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-2 text-[10px] text-porcelain/60 hover:text-porcelain/90 transition-opacity"
            aria-label="Made by Nordic Code Works"
          >
            Made by Nordic Code Works
          </a>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
