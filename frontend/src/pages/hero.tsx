import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

export function Hero() {
  const { t } = useTranslation()

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="home"
      className="bg-gradient-hero relative flex min-h-screen items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="bg-sage-300 animate-float absolute top-20 left-10 h-72 w-72 rounded-full mix-blend-multiply blur-3xl filter" />
        <div
          className="bg-honey-200 animate-float absolute top-40 right-10 h-72 w-72 rounded-full mix-blend-multiply blur-3xl filter"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="bg-terracotta-200 animate-float absolute bottom-20 left-1/2 h-72 w-72 rounded-full mix-blend-multiply blur-3xl filter"
          style={{ animationDelay: '4s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.h1
            className="font-heading text-charcoal mb-6 text-5xl font-bold text-balance md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('hero.title')}
          </motion.h1>

          <motion.p
            className="text-charcoal/80 mx-auto mb-10 max-w-2xl text-xl text-balance md:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button size="lg" onClick={scrollToBooking} className="shadow-elevated hover:scale-105">
              {t('hero.cta')}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Element */}
      <div className="from-porcelain absolute right-0 bottom-0 left-0 z-10 h-24 bg-gradient-to-t to-transparent" />
    </section>
  )
}
