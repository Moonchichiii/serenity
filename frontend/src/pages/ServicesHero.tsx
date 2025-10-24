import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface ServicesHeroProps {
  onContactClick?: () => void
  onScrollToServices?: () => void
}

export function ServicesHero({ onContactClick, onScrollToServices }: ServicesHeroProps) {
  const { t } = useTranslation()

  const handleScrollToServices = () => {
    if (onScrollToServices) {
      onScrollToServices()
    } else {
      const servicesSection = document.getElementById('services')
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick()
    } else {
      const contactEvent = new CustomEvent('openContactModal')
      window.dispatchEvent(contactEvent)
    }
  }

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-sage-400 via-honey-400 to-terracotta-400 overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-[10%] left-[10%] w-[200px] h-[200px] rounded-full bg-white/5 blur-[60px]" />
      <div className="absolute bottom-[15%] right-[15%] w-[250px] h-[250px] rounded-full bg-white/5 blur-[80px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block"
          >
            <span className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium uppercase tracking-wider mb-8 inline-block">
              {t('services.hero.badge', "Services Professionnels")}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 leading-tight"
          >
            {t('services.hero.title', "Des Massages Sur-Mesure")}
            <br />
            <span className="bg-gradient-to-r from-white/90 to-white/70 bg-clip-text text-transparent">
              {t('services.hero.subtitle', "Pour Votre Bien-Être")}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white/95 leading-relaxed mb-12 max-w-3xl mx-auto"
          >
            {t(
              'services.hero.description',
              "Que vous recherchiez détente, soulagement des tensions ou amélioration de vos performances sportives, nos massages thérapeutiques s'adaptent à vos besoins spécifiques."
            )}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={handleScrollToServices}
              className="px-8 py-4 bg-white text-sage-600 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
            >
              {t('services.hero.cta.discover', "Découvrir nos services")}
            </button>

            <button
              onClick={handleContactClick}
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
            >
              {t('services.hero.cta.contact', "Demander conseil")}
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 flex flex-wrap gap-8 justify-center text-white/90 text-sm"
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{t('services.hero.trust.certified', "Masseur Certifié")}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>{t('services.hero.trust.experience', "10+ Années d'Expérience")}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span>{t('services.hero.trust.reviews', "Avis 5 Étoiles")}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
