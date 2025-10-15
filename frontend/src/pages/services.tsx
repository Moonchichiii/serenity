import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Clock, Euro } from 'lucide-react'

const serviceKeys = ['swedish', 'deep', 'therapeutic', 'prenatal'] as const

export function Services() {
  const { t } = useTranslation()

  return (
    <section id="services" className="py-20 lg:py-32 bg-porcelain">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-charcoal mb-4">{t('services.title')}</h2>
          <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">{t('services.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {serviceKeys.map((service, index) => (
            <motion.div
              key={service}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="card hover-lift h-full p-8 group"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-heading font-semibold text-charcoal mb-3 group-hover:text-terracotta-500 transition-colors duration-300">
                  {t(`services.${service}.title`)}
                </h3>
                <p className="text-base text-charcoal/70 leading-relaxed">{t(`services.${service}.description`)}</p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t-2 border-sage-200/30 group-hover:border-terracotta-300/50 transition-colors duration-300">
                <div className="flex items-center space-x-2 text-charcoal/70">
                  <Clock className="w-5 h-5 text-sage-400 group-hover:text-terracotta-400 transition-colors" />
                  <span className="text-sm font-medium">{t(`services.${service}.duration`)}</span>
                </div>
                <div className="flex items-center space-x-1 text-charcoal font-semibold text-xl">
                  <Euro className="w-6 h-6 text-honey-500" />
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