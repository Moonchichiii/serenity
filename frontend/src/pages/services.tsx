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

      <section id="services" className="pt-16 lg:pt-24 pb-8 lg:pb-10 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-left md:text-center mb-8 md:mb-14 px-1"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-charcoal mb-3 md:mb-4">
              {t('services.title')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-charcoal/70 max-w-2xl md:mx-auto">
              {t('services.subtitle')}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-pulse text-charcoal/60">
                Loading services...
              </div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-charcoal/70">
                No services available yet. Add them in Wagtail!
              </p>
            </div>
          ) : (
            <>
              {/* ========================================= */}
              {/* MOBILE VIEW: Horizontal Snap Scroll       */}
              {/* ========================================= */}
              <div className="md:hidden relative">

                {/* SLIDE INDICATOR (Matches your screenshot) */}
                <div className="flex justify-end px-4 mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-sage-600 tracking-widest uppercase">
                    {/* Uses the translation key with fallback */}
                    <span>{t('services.slide', { defaultValue: 'SLIDE' })}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/*
                   SCROLL CONTAINER
                   1. [&::-webkit-scrollbar]:hidden  -> Hides scrollbar on Chrome/Safari/Webkit
                   2. [-ms-overflow-style:none]      -> Hides scrollbar on IE/Edge
                   3. [scrollbar-width:none]         -> Hides scrollbar on Firefox
                */}
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {services.map((service) => {
                    const title = lang === 'fr' ? service.title_fr : service.title_en
                    const description = lang === 'fr' ? service.description_fr : service.description_en
                    const isHighlighted = service.id === highlightedServiceId

                    return (
                      <article
                        key={service.id}
                        className="snap-center shrink-0 w-[85vw] relative flex flex-col overflow-hidden rounded-[26px] bg-white shadow-soft border border-sage-100/70"
                      >
                        {/* Image + badges */}
                        {service.image?.url && (
                          <div className="relative w-full h-48 overflow-hidden">
                            <CloudImage
                              image={service.image}
                              alt={service.image.title || title}
                              className="w-full h-full object-cover"
                              fit="cover"
                              sizes="85vw"
                            />

                            {isHighlighted && (
                              <>
                                {/* Most popular badge */}
                                <div className="absolute top-3 left-3 inline-flex items-center rounded-full bg-rose-500 text-porcelain text-[10px] font-semibold px-2 py-1 shadow-soft">
                                  {t('services.mostPopular', { defaultValue: 'Most popular' })}
                                </div>

                                {/* Price pill badge */}
                                <div className="absolute top-3 right-3 inline-flex items-center rounded-full bg-white/95 px-2 py-1 shadow-soft text-[10px] font-semibold text-charcoal">
                                  <Euro className="w-3 h-3 text-honey-500 mr-1" />
                                  <span className="mr-1">{service.price}</span>
                                  <span className="text-charcoal/80">
                                    • {service.duration_minutes} min
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        <div className="flex-1 flex flex-col px-5 pt-5 pb-5">
                          <div className="mb-4">
                            <h3 className="text-xl font-heading font-semibold text-charcoal mb-2">
                              {title}
                            </h3>
                            <p className="text-sm text-charcoal/70 leading-relaxed line-clamp-4">
                              {description}
                            </p>
                          </div>

                          <div className="mt-auto pt-4 border-t border-sage-200/60 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-charcoal/70 font-medium">
                              <Clock className="w-4 h-4 text-sage-500" />
                              <span>{service.duration_minutes} min</span>
                            </div>

                            {!isHighlighted && (
                              <div className="inline-flex items-center gap-1 text-sm font-semibold text-charcoal">
                                <Euro className="w-4 h-4 text-honey-500" />
                                <span>{service.price}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                  {/* Spacer */}
                  <div className="w-2 shrink-0" />
                </div>
              </div>

              {/* ========================================= */}
              {/* DESKTOP VIEW: Original Grid               */}
              {/* ========================================= */}
              <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto cv-auto">
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
                      className={[
                        'relative flex flex-col overflow-hidden',
                        'rounded-[26px] bg-porcelain shadow-soft border border-sage-100/70',
                        'hover:shadow-elevated hover:border-sage-300/80',
                        'transition-all duration-300',
                        'max-w-md w-full mx-auto',
                      ].join(' ')}
                    >
                      {/* Image + badges */}
                      {service.image?.url && (
                        <div className="relative w-full h-44 sm:h-48 overflow-hidden">
                          <CloudImage
                            image={service.image}
                            alt={service.image.title || title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            fit="cover"
                            sizes="(max-width:1024px) 45vw, 320px"
                          />

                          {isHighlighted && (
                            <>
                              <div className="absolute top-3 left-3 inline-flex items-center rounded-full bg-rose-500 text-porcelain text-[11px] font-semibold px-3 py-1 shadow-soft">
                                {t('services.mostPopular', {
                                  defaultValue: 'Most popular',
                                })}
                              </div>
                              <div className="absolute top-3 right-3 inline-flex items-center rounded-full bg-white/95 px-3 py-1 shadow-soft text-[11px] font-semibold text-charcoal">
                                <Euro className="w-3 h-3 text-honey-500 mr-1" />
                                <span className="mr-1">{service.price}</span>
                                <span className="text-charcoal/80">
                                  • {service.duration_minutes} min
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex-1 flex flex-col px-5 sm:px-6 pt-5 pb-4">
                        <div className="mb-4">
                          <h3 className="text-xl sm:text-2xl font-heading font-semibold text-charcoal mb-1.5">
                            {title}
                          </h3>
                          <p className="text-sm sm:text-base text-charcoal/70 leading-relaxed">
                            {description}
                          </p>
                        </div>

                        <div className="mt-auto pt-4 border-t border-sage-200/60 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-charcoal/70">
                            <Clock className="w-4 h-4 text-sage-500" />
                            <span>{service.duration_minutes} min</span>
                          </div>
                          {!isHighlighted && (
                            <div className="inline-flex items-center gap-1 text-sm font-semibold text-charcoal">
                              <Euro className="w-4 h-4 text-honey-500" />
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

      <section
        id="testimonials"
        className="mt-10 lg:mt-16 pt-12 lg:pt-16 pb-0 bg-porcelain"
      >
        <div className="mx-[calc(100%-100vw)] w-screen">
          <TestimonialBanner />
        </div>
      </section>
    </div>
  )
}

export default Services
