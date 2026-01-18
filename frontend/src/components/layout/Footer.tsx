import React from 'react'
import { Mail, MapPin, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AnimatedInstagramIcon from '@/components/ui/AnimatedInstagramIcon'
import AnimatedFacebookIcon from '@/components/ui/AnimatedFacebookIcon'
import { Link } from '@tanstack/react-router'

const Footer: React.FC = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  // Deep Forest Green
  const footerBgColor = 'bg-[#2a3c30]'
  const gradientColor = 'to-[#2a3c30]'

  return (
    <footer id="site-footer" className="relative mt-24 contain-content">
      {/* Blend strip */}
      <div
        className={`h-2 bg-gradient-to-b from-porcelain ${gradientColor}`}
        aria-hidden="true"
      />

      <div className={`${footerBgColor} text-white pt-8 pb-24 sm:pb-12`}>
        <div className="container mx-auto px-6 lg:px-12">

          {/* Main Grid: 1 Col on Mobile, 3 Cols on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 border-b border-white/10 pb-12">

            {/* COLUMN 1: Brand & Tagline (Span 4) */}
            <div className="md:col-span-4 space-y-6">
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
                  {t('footer.tagline', {
                    defaultValue: 'Massage thérapeutique professionnel et bien-être holistique au cœur de Marseille.',
                  })}
                </p>
              </div>

              {/* Address Mini-Block */}
              <div className="flex items-start gap-3 text-white/70">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-honey-200" />
                <span className="text-sm">
                  {t('footer.addressFull', { defaultValue: '5 Avenues, 13004 Marseille, France' })}
                </span>
              </div>
            </div>

            {/* COLUMN 2: Legal & Information (Span 4) - CENTERED on Desktop */}
            <div className="md:col-span-4 md:pl-8 space-y-6">
              <h4 className="text-lg font-heading text-white tracking-wide">
                {t('footer.info', { defaultValue: 'Informations' })}
              </h4>
              <ul className="space-y-3 text-sm text-white/70">
                {/* GDPR: Mandatory Legal Links */}
                <li>
                  <Link
                    to="/"
                    className="hover:text-honey-200 transition-colors duration-300"
                  >
                    {t('footer.legalNotice', { defaultValue: 'Mentions Légales' })}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="hover:text-honey-200 transition-colors duration-300"
                  >
                    {t('footer.privacy', { defaultValue: 'Politique de Confidentialité' })}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="hover:text-honey-200 transition-colors duration-300"
                  >
                    {t('footer.cgv', { defaultValue: 'CGV' })}
                  </Link>
                </li>
                <li className="pt-2">
                  <Link
                    to="/"
                    className="hover:text-honey-200 transition-colors duration-300"
                  >
                    {t('footer.cookies', { defaultValue: 'Gestion des cookies' })}
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 3: Contact & Hours (Span 4) - RIGHT on Desktop */}
            <div className="md:col-span-4 space-y-6">
              <h4 className="text-lg font-heading text-white tracking-wide">
                {t('footer.contactTitle', { defaultValue: 'Nous Contacter' })}
              </h4>

              <div className="space-y-4">
                <a
                  href={`mailto:${t('footer.email', { defaultValue: 'contact@serenity-massage.fr' })}`}
                  className="flex items-center gap-3 text-sm text-white/80 hover:text-honey-200 transition-colors group"
                >
                  <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>{t('footer.email', { defaultValue: 'contact@serenity-massage.fr' })}</span>
                </a>

                <div className="flex items-start gap-3 text-sm text-white/80">
                  <div className="p-2 rounded-full bg-white/5 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-medium text-white">
                      {t('footer.hours', { defaultValue: 'Horaires' })}
                    </span>
                    <span className="block text-white/60 mt-1">
                      {t('footer.hoursValue', { defaultValue: 'Lun–Sam: 9:00–19:00' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Socials */}
              <div className="pt-4 flex items-center gap-6">
                <div className="text-white/80 hover:text-honey-200 transition-colors">
                  <AnimatedInstagramIcon
                    magnetic
                    size={32}
                    href="https://www.instagram.com/laserenity_marseille/"
                  />
                </div>
                <div className="text-white/80 hover:text-honey-200 transition-colors">
                  <AnimatedFacebookIcon
                    magnetic
                    size={32}
                    href="https://facebook.com/yourpage"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Credits */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
            <p>
              © {currentYear} Serenity. {t('footer.allRights', { defaultValue: 'Tous droits réservés.' })}
            </p>

            <p className="flex items-center gap-1">
              <span>{t('footer.designedBy', { defaultValue: 'Site réalisé par' })}</span>
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
