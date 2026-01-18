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
    <footer id="site-footer" className="relative mt-16">
      {/* Blend strip: makes the footer melt into the site */}
      <div
        className="h-6 bg-gradient-to-b from-porcelain to-charcoal"
        aria-hidden="true"
      />

      {/* Footer body */}
      <div className="bg-charcoal text-white">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid gap-10 sm:grid-cols-2 sm:items-start text-center sm:text-left max-w-5xl mx-auto sm:gap-16">
              {/* Brand + Contact */}
              <div className="flex flex-col items-center sm:items-start">
                <h3 className="inline-block font-heading font-semibold text-2xl text-white">
                  <span className="relative inline-block">
                    <span className="absolute -top-2 left-0 text-xs tracking-wide text-white/80">
                      La
                    </span>
                    <span className="ml-4">Serenity</span>
                  </span>
                </h3>

                <p className="mt-3 text-sm text-white/80 max-w-[28ch] sm:max-w-none">
                  {t('footer.tagline', {
                    defaultValue: 'Massage thérapeutique professionnel',
                  })}
                </p>

                <div className="mt-6">
                  <h4 className="text-base font-semibold text-white">
                    {t('footer.contact', { defaultValue: 'Contact' })}
                  </h4>

                  <div className="mt-3 space-y-2">
                    <a
                      href={`mailto:${t('footer.email', {
                        defaultValue: 'contact@example.com',
                      })}`}
                      className="inline-flex items-center gap-2 text-white/85 hover:text-honey-300 transition-colors"
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
                  <h4 className="text-base font-semibold text-white">
                    {t('footer.hours', { defaultValue: 'Heures' })}
                  </h4>
                  <p className="mt-2 text-sm text-white/80">
                    {t('footer.hoursValue', { defaultValue: 'Lun–Sam: 9:00–19:00' })}
                  </p>
                </div>

                <div className="mt-2 flex items-center gap-8">
                  <span className="sr-only">
                    {t('footer.follow', {
                      defaultValue: 'Suivez-nous sur Instagram',
                    })}
                  </span>
                  <AnimatedInstagramIcon
                    magnetic
                    size={44}
                    href="https://instagram.com/yourprofile?utm_source=site&utm_medium=footer"
                  />
                  <span className="sr-only">
                    {t('footer.follow', {
                      defaultValue: 'Suivez-nous sur Facebook',
                    })}
                  </span>
                  <AnimatedFacebookIcon
                    magnetic
                    size={44}
                    href="https://facebook.com/yourprofile?utm_source=site&utm_medium=footer"
                  />
                </div>
              </div>
            </div>

            {/* Copyright + credits bar */}
            <div className="mt-10 border-t border-white/10 pt-6 text-xs space-y-2">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-center sm:text-left">
                <p className="text-white/80">
                  © {currentYear} Serenity —{' '}
                  {t('footer.rights', { defaultValue: 'Tous droits réservés.' })}
                </p>
                <p className="text-white/70">
                  {t('footer.address', { defaultValue: 'Marseille, France' })}
                </p>
              </div>

              <p className="text-[11px] text-center sm:text-right text-white/70">
                <a
                  href="https://www.nordiccodeworks.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-honey-300 underline-offset-2 hover:underline transition-colors"
                  aria-label="Made by Nordic Code Works"
                >
                  {t('footer.madeBy', {
                    defaultValue: 'Website by Nordic Code Works',
                  })}
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
