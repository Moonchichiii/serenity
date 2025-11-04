import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Clock, Euro } from 'lucide-react'
import { cmsAPI, type WagtailService } from '@/api/cms'
import { ServicesHero } from '@/pages/ServicesHero'
import TestimonialBanner from '@/components/TestimonialBanner'
import CloudImage from '@/components/ResponsiveImage'

export function Services() {
  const { t, i18n } = useTranslation()
  const [services, setServices] = useState<WagtailService[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    cmsAPI.getServices().then(setServices).catch(() => setServices([])).finally(() => setIsLoading(false))
  }, [])

  const lang = (i18n.language?.startsWith('fr') ? 'fr' : 'en') as 'en' | 'fr'

  return (
    <div className="services-page">
      <ServicesHero />

      <section id="services" className="pt-16 lg:pt-24 pb-8 lg:pb-10 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-charcoal mb-3 md:mb-4">
              {t('services.title')}
            </h2>
            <p className="text-lg md:text-xl text-charcoal/70 max-w-2xl mx-auto">
              {t('services.subtitle')}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="text-center">
              <div className="animate-pulse text-charcoal/60">Loading services...</div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center">
              <p className="text-charcoal/70">No services available yet. Add them in Wagtail!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto cv-auto">
              {services.map((service, index) => {
                const title = lang === 'fr' ? service.title_fr : service.title_en
                const description = lang === 'fr' ? service.description_fr : service.description_en

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="card hover-lift h-full p-8 group"
                  >
                    {service.image?.url && (
                      <div className="mb-4 -mx-8 -mt-8">
                        <CloudImage
                          image={service.image}
                          alt={service.image.title || title}
                          className="w-full h-48 rounded-t-3xl"
                          fit="cover"
                          // ~full width on phones, 50% on md, fixed ~320px on desktop
                          sizes="(max-width:640px) 95vw, (max-width:1024px) 45vw, 320px"
                        />
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-2xl font-heading font-bold text-charcoal mb-3 group-hover:text-terracotta-500 transition-colors duration-300">
                        {title}
                      </h3>
                      <p className="text-base text-charcoal/70 leading-relaxed">{description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t-2 border-sage-200/30 group-hover:border-terracotta-300/50 transition-colors duration-300">
                      <div className="flex items-center space-x-2 text-charcoal/70">
                        <Clock className="w-5 h-5 text-sage-400 group-hover:text-terracotta-400 transition-colors" />
                        <span className="text-sm font-normal">{service.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center space-x-1 text-charcoal font-semibold text-xl">
                        <Euro className="w-6 h-6 text-honey-500" />
                        <span className="group-hover:text-terracotta-500 transition-colors">{service.price}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section id="testimonials" className="mt-10 lg:mt-16 pt-12 lg:pt-16 pb-0 bg-porcelain">
        <div className="mx-[calc(100%-100vw)] w-screen">
          <TestimonialBanner />
        </div>
      </section>
    </div>
  )
}

export default Services
