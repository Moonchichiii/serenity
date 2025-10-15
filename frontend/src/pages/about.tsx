import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Award, Heart, Sparkles, Users } from 'lucide-react'

export function About() {
  const { t } = useTranslation()

  const specialties = [
    { key: 'specialty1', icon: Sparkles, color: 'bg-terracotta-100 text-terracotta-500' },
    { key: 'specialty2', icon: Heart, color: 'bg-honey-100 text-honey-500' },
    { key: 'specialty3', icon: Users, color: 'bg-sage-100 text-sage-500' },
    { key: 'specialty4', icon: Award, color: 'bg-lavender-100 text-lavender-500' },
  ]

  return (
    <section id="about" className="bg-gradient-warm px-4 py-20 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-charcoal mb-4 text-4xl font-bold md:text-5xl">
            {t('about.title')}
          </h2>
          <p className="text-charcoal/70 text-xl">{t('about.subtitle')}</p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid auto-rows-auto grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Intro Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="shadow-soft hover:shadow-warm border-sage-200/30 rounded-3xl border-2 bg-white p-8 transition-all duration-300 lg:col-span-2"
          >
            <p className="text-charcoal/80 mb-4 text-lg leading-relaxed">{t('about.intro')}</p>
            <div className="bg-honey-100 inline-flex items-center gap-2 rounded-full px-4 py-2">
              <Award className="text-honey-500 h-5 w-5" />
              <span className="text-charcoal text-sm font-medium">{t('about.certification')}</span>
            </div>
          </motion.div>

          {/* Approach Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="from-terracotta-100 to-honey-100 shadow-soft hover:shadow-warm border-terracotta-200/30 row-span-2 rounded-3xl border-2 bg-gradient-to-br p-8 transition-all duration-300"
          >
            <h3 className="font-heading text-charcoal mb-4 text-2xl font-semibold">
              {t('about.approach')}
            </h3>
            <p className="text-charcoal/70 leading-relaxed">{t('about.approachText')}</p>
          </motion.div>

          {/* Specialties Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-sage-100 shadow-soft hover:shadow-warm border-sage-200/30 rounded-3xl border-2 p-8 transition-all duration-300 lg:col-span-2"
          >
            <h3 className="font-heading text-charcoal mb-6 text-2xl font-semibold">
              {t('about.specialties')}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {specialties.map((specialty, index) => (
                <motion.div
                  key={specialty.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="hover:shadow-warm hover:border-terracotta-300/50 flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-transparent bg-white p-4 transition-all duration-300"
                >
                  <div className={`rounded-xl p-3 ${specialty.color}`}>
                    <specialty.icon className="h-5 w-5" />
                  </div>
                  <span className="text-charcoal font-medium">{t(`about.${specialty.key}`)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
