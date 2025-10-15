import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

// If you have these files, keep the imports.
// Otherwise, replace with your own images or move them to /public and use "/hero-1.jpg" etc.
import heroImage1 from '@/assets/hero-image.jpg'
import heroImage2 from '@/assets/hero-image-2.jpg'
import heroImage3 from '@/assets/hero-image-3.jpg'

export function Hero() {
  const { t } = useTranslation()

  const heroImages = useMemo(
    () => [
      { src: heroImage1, alt: 'Serene spa environment with natural lighting' },
      { src: heroImage2, alt: 'Peaceful massage therapy room with bamboo elements' },
      { src: heroImage3, alt: 'Tranquil wellness space with organic textures' },
    ],
    []
  )

  const [active, setActive] = useState(0)

  // Auto-advance every 5s
  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(id)
  }, [heroImages.length])

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-hero"
    >
      {/* Background Images (crossfade + subtle zoom) */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, idx) => (
          <motion.img
            key={idx}
            src={image.src}
            alt={image.alt}
            className="absolute inset-0 w-full h-full object-cover"
            initial={false}
            animate={{
              opacity: active === idx ? 1 : 0,
              scale: active === idx ? 1.05 : 1.0,
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        ))}

        {/* Warm overlay gradient to keep text readable */}
        <div className="absolute inset-0 bg-gradient-to-br from-sage-200/70 via-sand-100/70 to-porcelain/70" />
      </div>

      {/* Animated background blobs (your original) */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sage-300 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-honey-200 rounded-full mix-blend-multiply filter blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-terracotta-200 rounded-full mix-blend-multiply filter blur-3xl animate-float"
          style={{ animationDelay: '4s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-charcoal mb-6 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('hero.title')}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-charcoal/80 mb-10 max-w-2xl mx-auto text-balance"
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
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-porcelain to-transparent z-10" />
    </section>
  )
}
