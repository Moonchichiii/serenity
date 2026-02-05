import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Clock, Euro, ArrowRight } from 'lucide-react'
import { cmsAPI, type WagtailService } from '@/api/cms'
import { ServicesHero } from '@/pages/ServicesHero'
import TestimonialBanner from '@/components/TestimonialBanner'
import CloudImage from '@/components/ResponsiveImage'

export function Services() {
  const { t, i18n } = useTranslation()
  const [services, setServices] = useState<WagtailService[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    cmsAPI
      .getServices()
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setIsLoading(false))
  }, [])

  const lang = (i18n.language?.startsWith('fr') ? 'fr' : 'en') as 'en' | 'fr'

  const isChairService = (service: WagtailService) => {
    const en = (service.title_en || '').toLowerCase()
    const fr = (service.title_fr || '').toLowerCase()
    return (
      en.includes('chair') ||
      en.includes('amma') ||
      en.includes('seated') ||
      fr.includes('amma') ||
      fr.includes('assis')
    )
  }

  const highlightedServiceId = useMemo(
    () => services.find(isChairService)?.id,
    [services]
  )

  return (
    <div className="services-page bg-stone-50/30">
      <ServicesHero />

      <section id="services" className="pt-20 lg:pt-32 pb-16 lg:pb-20 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">

          {/* Header - Centered & Serif */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-left md:text-center mb-12 md:mb-20 px-1"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium text-stone-900 mb-4 md:mb-6">
              {t('services.title')}
            </h2>
            <p className="text-lg md:text-xl text-stone-600 max-w-2xl md:mx-auto leading-relaxed">
              {t('services.subtitle')}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-pulse text-stone-400 font-serif text-lg">
                Loading...
              </div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-stone-500">
                No services available yet.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW: Snap Scroll */}
              <div className="md:hidden relative">
                <div className="flex justify-end px-4 mb-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase">
                    <span>{t('services.slide', { defaultValue: 'SLIDE' })}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-8 -mx-4 px-6 no-scrollbar">
                  {services.map((service) => {
                    const title = lang === 'fr' ? service.title_fr : service.title_en
                    const description = lang === 'fr' ? service.description_fr : service.description_en
                    const isHighlighted = service.id === highlightedServiceId

                    return (
                      <article
                        key={service.id}
                        className="snap-center shrink-0 w-[85vw] relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-lg shadow-stone-200/50 border border-stone-100"
                      >
                        {service.image?.url && (
                          <div className="relative w-full h-56 overflow-hidden">
                            <CloudImage
                              image={service.image}
                              alt={service.image.title || title}
                              className="w-full h-full object-cover"
                              fit="cover"
                              sizes="85vw"
                            />
                            {isHighlighted && (
                              <div className="absolute top-4 right-4 inline-flex items-center rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold tracking-wide text-stone-800 shadow-sm">
                                <Euro className="w-3 h-3 text-sage-600 mr-1" />
                                {service.price}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex-1 flex flex-col p-6">
                          <div className="mb-6">
                            <h3 className="text-2xl font-serif font-medium text-stone-900 mb-3">
                              {title}
                            </h3>
                            <p className="text-sm text-stone-500 leading-relaxed line-clamp-4">
                              {description}
                            </p>
                          </div>

                          <div className="mt-auto pt-5 border-t border-stone-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-medium text-stone-400 uppercase tracking-wider">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{service.duration_minutes} min</span>
                            </div>
                            {!isHighlighted && (
                              <div className="text-sm font-serif font-semibold text-stone-900">
                                {service.price}
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                  <div className="w-2 shrink-0" />
                </div>
              </div>

              {/* DESKTOP VIEW: Grid */}
              <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10 max-w-7xl mx-auto">
                {services.map((service, index) => {
                  const title = lang === 'fr' ? service.title_fr : service.title_en
                  const description = lang === 'fr' ? service.description_fr : service.description_en
                  const isHighlighted = service.id === highlightedServiceId

                  return (
                    <motion.article
                      key={service.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                      className="relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-stone-200/40 border border-stone-100 transition-all duration-500 hover:shadow-2xl hover:shadow-stone-200/60"
                    >
                      {service.image?.url && (
                        <div className="relative w-full h-64 overflow-hidden">
                          <CloudImage
                            image={service.image}
                            alt={service.image.title || title}
                            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                            fit="cover"
                            sizes="(max-width:1024px) 45vw, 380px"
                          />

                          {/* Floating Price Pill */}
                          <div className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-4 py-1.5 text-xs font-bold text-stone-800 shadow-lg">
                             <span>{service.price}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex-1 flex flex-col p-8">
                        <div className="mb-6">
                          <h3 className="text-2xl font-serif font-medium text-stone-900 mb-3">
                            {title}
                          </h3>
                          <p className="text-base text-stone-500 leading-relaxed font-light">
                            {description}
                          </p>
                        </div>

                        <div className="mt-auto pt-6 border-t border-stone-100 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{service.duration_minutes} min</span>
                          </div>
                          {isHighlighted && (
                             <span className="text-[10px] font-bold text-sage-600 bg-sage-50 px-2 py-1 rounded uppercase tracking-wider">
                               {t('services.mostPopular', { defaultValue: 'Popular' })}
                             </span>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Testimonials Section Spacer */}
      <section id="testimonials" className="bg-white">
        <TestimonialBanner />
      </section>
    </div>
  )
}

export default Services
