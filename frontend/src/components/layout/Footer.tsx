import React from 'react'
import { Mail, MapPin, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AnimatedInstagramIcon from '@/components/ui/AnimatedInstagramIcon'
import AnimatedFacebookIcon from '@/components/ui/AnimatedFacebookIcon'
import { useModal } from '@/hooks/useModal'

const Footer: React.FC = () => {
  const { t } = useTranslation()
  const { open } = useModal()
  const currentYear = new Date().getFullYear()

  // Updated Colors: Still Dark Green, but borders are cleaner
  const footerBgColor = 'bg-[#2a3c30]'

  const linkBtnClass =
    'cursor-pointer text-white/70 hover:text-white transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-md text-left text-sm py-1'

  return (
    <footer id="site-footer" className="relative mt-0 contain-content">
      {/* Main Footer Content */}
      <div className={`${footerBgColor} text-white pt-20 pb-32 md:pb-12`}>
        <div className="container mx-auto px-6 lg:px-12">

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/10 pb-16 text-left">

            {/* COLUMN 1: Brand */}
            <div className="md:col-span-5 flex flex-col items-start space-y-8">
              <div>
                <h3 className="font-serif text-4xl text-white tracking-wide">
                  La Serenity
                </h3>
                <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-sm font-light">
                  {t('footer.tagline')}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <AnimatedInstagramIcon
                  magnetic
                  size={44}
                  href="https://www.instagram.com/laserenity_marseille/"
                />
                <AnimatedFacebookIcon
                  magnetic
                  size={44}
                  href="https://facebook.com/yourpage"
                />
              </div>
            </div>

            {/* COLUMN 2: Legal Links */}
            <div className="md:col-span-3">
              <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-white/60 mb-6">
                {t('footer.info')}
              </h4>
              <ul className="flex flex-col gap-2">
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

            {/* COLUMN 3: Contact */}
            <div className="md:col-span-4">
              <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-white/60 mb-6">
                {t('footer.contactTitle')}
              </h4>

              <div className="space-y-6 text-sm text-white/80 font-light">
                {/* Email */}
                <a
                  href={`mailto:${t('footer.email')}`}
                  className="flex items-center gap-4 hover:text-white transition-colors group"
                >
                  <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>{t('footer.email')}</span>
                </a>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-white/5 mt-[-2px]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="leading-relaxed">
                    {t('footer.addressFull')}
                  </span>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-white/5 mt-[-2px]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-medium text-white mb-0.5">
                      {t('footer.hours')}
                    </span>
                    <span className="block text-white/60">
                      {t('footer.hoursValue')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[11px] text-white/60 uppercase tracking-wider font-medium">
            <p>
              © {currentYear} Serenity. {t('footer.allRights')}
            </p>

            <p className="flex items-center gap-1">
              <span>{t('footer.designedBy')}</span>
              <a
                href="https://www.nordiccodeworks.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors ml-1"
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
