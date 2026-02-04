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
    'cursor-pointer hover:text-honey-200 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-200/70 rounded-md text-left'

  return (
    <footer id="site-footer" className="relative mt-24 contain-content">
      {/* Blend strip */}
      <div
        className={`h-1 bg-gradient-to-b from-porcelain ${gradientColor}`}
        aria-hidden="true"
      />

      {/* Main Footer Content */}
      {/* Added pb-32 on mobile to clear the Floating Gift Button */}
      <div className={`${footerBgColor} text-white pt-12 pb-32 md:pb-12`}>
        <div className="container mx-auto px-6 lg:px-12">

          {/* Main Grid - STRICT LEFT ALIGNMENT */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-8 border-b border-white/10 text-left">

            {/* COLUMN 1: Brand & Socials (Mobile: First Block) */}
            <div className="md:col-span-4 flex flex-col items-start space-y-6 pb-8 md:pb-12 border-b md:border-none border-white/5">
              <div>
                <h3 className="inline-block font-heading font-semibold text-3xl text-white tracking-wide">
                  <span className="relative inline-block">
                    <span className="absolute -top-3 left-0 text-xs tracking-[0.2em] uppercase text-honey-200/80">
                      La
                    </span>
                    <span className="ml-5">Serenity</span>
                  </span>
                </h3>

                <p className="mt-4 text-sm text-white/80 leading-relaxed max-w-sm">
                  {t('footer.tagline')}
                </p>
              </div>

              {/* Socials - Left Aligned & Closer to Brand */}
              <div className="flex items-center gap-5">
                <div className="text-white/80 hover:text-honey-200 transition-colors">
                  <AnimatedInstagramIcon
                    magnetic
                    size={48} // Slightly smaller for mobile elegance
                    href="https://www.instagram.com/laserenity_marseille/"
                  />
                </div>
                <div className="text-white/80 hover:text-honey-200 transition-colors">
                  <AnimatedFacebookIcon
                    magnetic
                    size={48}
                    href="https://facebook.com/yourpage"
                  />
                </div>
              </div>
            </div>

            {/* COLUMN 2: Legal Links (Mobile: Second Block) */}
            <div className="md:col-span-4 md:pl-8 py-8 md:py-0 md:pb-12 border-b md:border-none border-white/5">
              <h4 className="text-lg font-heading text-white tracking-wide mb-5">
                {t('footer.info')}
              </h4>

              <ul className="grid grid-cols-1 gap-3 text-sm text-white/70">
                <li>
                  <button type="button" onClick={() => open('legal', { page: 'legal' })} className={linkBtnClass}>
                    {t('footer.legalNotice')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => open('legal', { page: 'privacy' })} className={linkBtnClass}>
                    {t('footer.privacy')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => open('legal', { page: 'terms' })} className={linkBtnClass}>
                    {t('footer.cgv')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => open('legal', { page: 'cookies' })} className={linkBtnClass}>
                    {t('footer.cookies')}
                  </button>
                </li>
              </ul>
            </div>

            {/* COLUMN 3: Contact & Hours (Mobile: Third Block) */}
            <div className="md:col-span-4 pt-8 md:pt-0 pb-12">
              <h4 className="text-lg font-heading text-white tracking-wide mb-5">
                {t('footer.contactTitle')}
              </h4>

              <div className="space-y-6">
                {/* Email */}
                <a
                  href={`mailto:${t('footer.email')}`}
                  className="flex items-center gap-4 text-sm text-white/80 hover:text-honey-200 transition-colors group"
                >
                  <div className="p-2.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>{t('footer.email')}</span>
                </a>

                {/* Address - Properly Aligned */}
                <div className="flex items-start gap-4 text-white/70">
                  <div className="p-2.5 rounded-full bg-white/5 mt-[-2px] shrink-0">
                    <MapPin className="w-4 h-4 text-honey-200" />
                  </div>
                  <span className="text-sm leading-relaxed max-w-[220px]">
                    {t('footer.addressFull')}
                  </span>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4 text-sm text-white/80">
                  <div className="p-2.5 rounded-full bg-white/5 mt-[-2px] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-medium text-white mb-0.5">
                      {t('footer.hours')}
                    </span>
                    <span className="block text-white/70">
                      {t('footer.hoursValue')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar - Stacked on Mobile */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-white/50">
            <p>
              © {currentYear} Serenity. {t('footer.allRights')}
            </p>

            <p className="flex items-center gap-1">
              <span>{t('footer.designedBy')}</span>
              <a
                href="https://www.nordiccodeworks.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-honey-200 hover:text-white font-medium uppercase tracking-wider transition-colors ml-1"
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
