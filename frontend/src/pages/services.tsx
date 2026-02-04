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
    <div className="services-page bg-stone-50/50">
      <ServicesHero />

      <section id="services" className="pt-16 lg:pt-24 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-left md:text-center mb-10 md:mb-16"
          >
            <span className="text-xs font-bold tracking-[0.2em] text-sage-600 uppercase mb-3 block">
              {t('services.label', { defaultValue: 'Our Menu' })}
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-normal text-charcoal mb-4">
              {t('services.title')}
            </h2>
            <p className="text-lg text-charcoal/60 max-w-2xl md:mx-auto leading-relaxed">
              {t('services.subtitle')}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              No services found.
            </div>
          ) : (
            <>
              {/* --- MOBILE: HORIZONTAL SNAP SCROLL --- */}
              {/* FIX: Removed px-2, kept -mx-4 px-4 to match container alignment */}
              <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 no-scrollbar">
                {services.map((service) => {
                  const title = lang === 'fr' ? service.title_fr : service.title_en
                  const description = lang === 'fr' ? service.description_fr : service.description_en

                  return (
                    <article
                      key={service.id}
                      className="snap-center shrink-0 w-[85vw] bg-white rounded-3xl overflow-hidden shadow-soft border border-stone-100 flex flex-col"
                    >
                      {/* Card Image */}
                      {service.image?.url && (
                        <div className="relative h-56 w-full">
                          <CloudImage
                            image={service.image}
                            alt={service.image.title || title}
                            className="w-full h-full object-cover"
                            fit="cover"
                            sizes="85vw"
                          />
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-charcoal shadow-sm">
                            {service.price}
                          </div>
                        </div>
                      )}

                      {/* Card Body */}
                      <div className="p-6 flex flex-col grow">
                        <div className="mb-2">
                          <h3 className="text-2xl font-heading text-charcoal">
                            {title}
                          </h3>
                        </div>
                        <p className="text-stone-600 text-sm leading-loose mb-6 line-clamp-3">
                          {description}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-stone-100">
                          <span className="flex items-center gap-2 text-sm font-medium text-stone-500">
                            <Clock className="w-4 h-4" /> {service.duration_minutes} min
                          </span>
                          <span className="flex items-center gap-1 text-sage-700 font-semibold text-sm">
                            {lang === 'fr' ? 'Détails' : 'Details'} <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </article>
                  )
                })}
                {/* Spacer for right padding scroll */}
                <div className="w-2 shrink-0" />
              </div>

              {/* --- DESKTOP: STANDARD GRID --- */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => {
                  const title = lang === 'fr' ? service.title_fr : service.title_en
                  const description = lang === 'fr' ? service.description_fr : service.description_en
                  const isHighlighted = service.id === highlightedServiceId

                  return (
                    <motion.article
                      key={service.id}
                      initial={{ opacity: 0, y: 24, scale: 0.98 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: index * 0.06 }}
                      whileHover={{ y: -6 }}
                      className="relative flex flex-col overflow-hidden rounded-[26px] bg-white shadow-soft border border-stone-100 hover:shadow-elevated transition-all duration-300 w-full"
                    >
                      {service.image?.url && (
                        <div className="relative w-full h-48 overflow-hidden">
                          <CloudImage
                            image={service.image}
                            alt={service.image.title || title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            fit="cover"
                            sizes="(max-width:1024px) 45vw, 320px"
                          />

                          {isHighlighted && (
                            <>
                              <div className="absolute top-3 left-3 inline-flex items-center rounded-full bg-rose-500 text-white text-[11px] font-semibold px-3 py-1 shadow-md">
                                {t('services.mostPopular', { defaultValue: 'Most popular' })}
                              </div>

                              <div className="absolute top-3 right-3 inline-flex items-center rounded-full bg-white/95 px-3 py-1 shadow-sm text-[11px] font-semibold text-charcoal">
                                <Euro className="w-3 h-3 text-honey-500 mr-1" />
                                <span className="mr-1">{service.price}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex-1 flex flex-col px-6 pt-5 pb-5">
                        <div className="mb-4">
                          <h3 className="text-xl font-heading font-semibold text-charcoal mb-2">
                            {title}
                          </h3>
                          <p className="text-sm text-charcoal/70 leading-relaxed line-clamp-3">
                            {description}
                          </p>
                        </div>

                        <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                            <Clock className="w-4 h-4 text-sage-500" />
                            <span>{service.duration_minutes} min</span>
                          </div>
                          {!isHighlighted && (
                            <div className="inline-flex items-center gap-1 text-sm font-semibold text-charcoal">
                              <span className="text-stone-400 font-normal mr-2">|</span>
                              <span>{service.price}</span>
                            </div>
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

      <section id="testimonials" className="bg-white border-t border-stone-100/50">
        <TestimonialBanner />
      </section>
    </div>
  )
}

export default Services
