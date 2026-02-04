import React from 'react'
import { Mail, MapPin, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AnimatedInstagramIcon from '@/components/ui/AnimatedInstagramIcon'
import AnimatedFacebookIcon from '@/components/ui/AnimatedFacebookIcon'
import { useModal } from '@/shared/hooks/useModal'

const Footer: React.FC = () => {
  const { t } = useTranslation()
  const { open } = useModal()
  const currentYear = new Date().getFullYear()

  // Deep Forest Green
  const footerBgColor = 'bg-[#2a3c30]'
  const gradientColor = 'to-[#2a3c30]'

  // Shared class for accessible footer links
  const linkBtnClass =
    'cursor-pointer hover:text-honey-200 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-200/70 rounded-md'

  return (
    <footer id="site-footer" className="relative mt-24 contain-content">
      {/* Blend strip */}
      <div
        className={`h-1 bg-gradient-to-b from-porcelain ${gradientColor}`}
        aria-hidden="true"
      />

      {/* Main Footer Content */}
      <div className={`${footerBgColor} text-white pt-12 pb-28 sm:pb-12`}>
        <div className="container mx-auto px-6 lg:px-12">

          {/* Main Grid - Center text on Mobile, Left on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 border-b border-white/10 pb-12 text-center md:text-left">

            {/* COLUMN 1: Brand & Tagline */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start space-y-6">
              <div>
                <h3 className="inline-block font-heading font-semibold text-3xl text-white tracking-wide">
                  <span className="relative inline-block">
                    <span className="absolute -top-3 left-0 text-xs tracking-[0.2em] uppercase text-honey-200/80">
                      La
                    </span>
                    <span className="ml-5">Serenity</span>
                  </span>
                </h3>

                <p className="mt-4 text-sm text-white/80 leading-relaxed max-w-sm mx-auto md:mx-0">
                  {t('footer.tagline')}
                </p>
              </div>

              {/* Address - Centered on mobile */}
              <div className="flex items-center md:items-start gap-3 text-white/70 justify-center md:justify-start">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-honey-200" />
                <span className="text-sm max-w-[200px] md:max-w-none text-left md:text-left">
                  {t('footer.addressFull')}
                </span>
              </div>
            </div>

            {/* COLUMN 2: Legal Links */}
            <div className="md:col-span-4 md:pl-8 flex flex-col items-center md:items-start space-y-6">
              <h4 className="text-lg font-heading text-white tracking-wide">
                {t('footer.info')}
              </h4>

              <ul className="space-y-4 text-sm text-white/70 flex flex-col items-center md:items-start">
                <li>
                  <button
                    type="button"
                    onClick={() => open('legal', { page: 'legal' })}
                    className={linkBtnClass}
                  >
                    {t('footer.legalNotice')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => open('legal', { page: 'privacy' })}
                    className={linkBtnClass}
                  >
                    {t('footer.privacy')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => open('legal', { page: 'terms' })}
                    className={linkBtnClass}
                  >
                    {t('footer.cgv')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => open('legal', { page: 'cookies' })}
                    className={linkBtnClass}
                  >
                    {t('footer.cookies')}
                  </button>
                </li>
              </ul>
            </div>

            {/* COLUMN 3: Contact & Hours */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start space-y-6">
              <h4 className="text-lg font-heading text-white tracking-wide">
                {t('footer.contactTitle')}
              </h4>

              <div className="space-y-5 w-full">
                {/* Email - Centered Flex */}
                <a
                  href={`mailto:${t('footer.email')}`}
                  className="flex items-center justify-center md:justify-start gap-3 text-sm text-white/80 hover:text-honey-200 transition-colors group"
                >
                  <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>{t('footer.email')}</span>
                </a>

                {/* Hours - Centered Flex */}
                <div className="flex items-start justify-center md:justify-start gap-3 text-sm text-white/80">
                  <div className="p-2 rounded-full bg-white/5 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-center md:text-left">
                    <span className="block font-medium text-white">
                      {t('footer.hours')}
                    </span>
                    <span className="block text-white/70 mt-1">
                      {t('footer.hoursValue')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Socials - Centered */}
              <div className="pt-4 flex items-center justify-center md:justify-start gap-6 w-full">
                <div className="text-white/80 hover:text-honey-200 transition-colors">
                  <AnimatedInstagramIcon
                    magnetic
                    size={52}
                    href="https://www.instagram.com/laserenity_marseille/"
                  />
                </div>
                <div className="text-white/80 hover:text-honey-200 transition-colors">
                  <AnimatedFacebookIcon
                    magnetic
                    size={52}
                    href="https://facebook.com/yourpage"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60 text-center md:text-left">
            <p>
              © {currentYear} Serenity. {t('footer.allRights')}
            </p>

            <p className="flex items-center gap-1">
              <span>{t('footer.designedBy')}</span>
              <a
                href="https://www.nordiccodeworks.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-honey-200 hover:text-white font-medium uppercase tracking-wider transition-colors ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-200/70 rounded-sm"
                aria-label="Nordic Code Works"
              >
                Nordic Code Works
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
