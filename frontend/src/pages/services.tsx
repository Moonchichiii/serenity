import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Clock, Euro } from 'lucide-react'

const serviceKeys = ['swedish', 'deep', 'therapeutic', 'prenatal'] as const

export function Services() {
  const { t } = useTranslation()

  return (
    <section id="services" className="bg-porcelain py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="font-heading text-charcoal mb-4 text-4xl font-bold md:text-5xl">
            {t('services.title')}
          </h2>
          <p className="text-charcoal/70 mx-auto max-w-2xl text-xl">{t('services.subtitle')}</p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
          {serviceKeys.map((service, index) => (
            <motion.div
              key={service}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="card hover-lift group h-full p-8"
            >
              <div className="mb-6">
                <h3 className="font-heading text-charcoal group-hover:text-terracotta-500 mb-3 text-2xl font-semibold transition-colors duration-300">
                  {t(`services.${service}.title`)}
                </h3>
                <p className="text-charcoal/70 text-base leading-relaxed">
                  {t(`services.${service}.description`)}
                </p>
              </div>

              <div className="border-sage-200/30 group-hover:border-terracotta-300/50 flex items-center justify-between border-t-2 pt-6 transition-colors duration-300">
                <div className="text-charcoal/70 flex items-center space-x-2">
                  <Clock className="text-sage-400 group-hover:text-terracotta-400 h-5 w-5 transition-colors" />
                  <span className="text-sm font-medium">{t(`services.${service}.duration`)}</span>
                </div>
                <div className="text-charcoal flex items-center space-x-1 text-xl font-semibold">
                  <Euro className="text-honey-500 h-6 w-6" />
                  <span className="group-hover:text-terracotta-500 transition-colors">
                    {t(`services.${service}.price`).replace('€', '')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
