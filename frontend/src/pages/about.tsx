import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Award, Heart, Sparkles, Users } from 'lucide-react'
import TestimonialBanner from '@/components/ui/TestimonialBanner'
import SecretTrigger from '@/components/secret/SecretTrigger'

export function About() {
  const { t } = useTranslation()

  const specialties = [
    { key: 'specialty1', icon: Sparkles, color: 'bg-terracotta-100 text-terracotta-500' },
    { key: 'specialty2', icon: Heart, color: 'bg-honey-100 text-honey-500' },
    { key: 'specialty3', icon: Users, color: 'bg-sage-100 text-sage-500' },
    { key: 'specialty4', icon: Award, color: 'bg-lavender-100 text-lavender-500' },
  ]

  return (
    <section id="about" className="py-20 px-4 lg:px-8 bg-gradient-warm">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-charcoal mb-4">{t('about.title')}</h2>
          <p className="text-xl text-charcoal/70">{t('about.subtitle')}</p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
          {/* Intro Card */}
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6, delay: 0.1 }}
  className="bg-white rounded-3xl p-8 shadow-soft hover:shadow-warm transition-all duration-300 lg:col-span-2 border-2 border-sage-200/30"
>
  <p className="text-lg text-charcoal/80 leading-relaxed mb-4">
    {t('about.intro')}{' '}
    <SecretTrigger modalId="cmsLogin" times={3} windowMs={900}>
      {/* inline, no extra spacing, looks like normal text */}
      <span className="cursor-text select-text font-semibold text-charcoal/70 hover:text-charcoal transition-colors">
        Serenity
      </span>
    </SecretTrigger>
  </p>

  <div className="inline-flex items-center gap-2 bg-honey-100 px-4 py-2 rounded-full">
    <Award className="w-5 h-5 text-honey-500" />
    <span className="text-sm font-medium text-charcoal">
      {t('about.certification')}
    </span>
  </div>
</motion.div>


          {/* Approach Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-terracotta-100 to-honey-100 rounded-3xl p-8 shadow-soft hover:shadow-warm transition-all duration-300 row-span-2 border-2 border-terracotta-200/30"
          >
            <h3 className="text-2xl font-heading font-semibold text-charcoal mb-4">{t('about.approach')}</h3>
            <p className="text-charcoal/70 leading-relaxed">{t('about.approachText')}</p>
          </motion.div>

          {/* Specialties Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-sage-100 rounded-3xl p-8 shadow-soft hover:shadow-warm transition-all duration-300 lg:col-span-2 border-2 border-sage-200/30"
          >
            <h3 className="text-2xl font-heading font-semibold text-charcoal mb-6">{t('about.specialties')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specialties.map((specialty, index) => (
                <motion.div
                  key={specialty.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-3 bg-white rounded-2xl p-4 hover:shadow-warm transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-terracotta-300/50"
                >
                  <div className={`p-3 rounded-xl ${specialty.color}`}>
                    <specialty.icon className="w-5 h-5" />
                  </div>
                  <span className="text-charcoal font-medium">{t(`about.${specialty.key}`)}</span>
                </motion.div>
              ))}
            </div>

          </motion.div>
        </div>

      </div>
      <TestimonialBanner />
    </section>
  )
}
