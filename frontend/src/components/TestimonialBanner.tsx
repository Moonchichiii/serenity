import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { cmsAPI, type WagtailTestimonial } from '@/api/cms'

export function TestimonialBanner() {
  const { t, i18n } = useTranslation()
  const [testimonials, setTestimonials] = useState<WagtailTestimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch featured testimonials
    // Backend now returns language-aware text based on Accept-Language header
    cmsAPI
      .getTestimonials(true) // featured=true
      .then(data => {
        setTestimonials(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load testimonials:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500" />
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return null // Don't show section if no testimonials
  }

  return (
    <section className="py-20 bg-cream-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-serif font-bold text-charcoal mb-4">
            {t('testimonials.title', 'What Clients Say')}
          </h2>
          <p className="text-lg text-charcoal/70">
            {t('testimonials.subtitle', 'Real experiences from real people')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar - now provided by backend */}
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-charcoal">{testimonial.name}</h3>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? 'fill-honey-400 text-honey-400'
                            : 'text-charcoal/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Text - backend returns language-specific text */}
              <p className="text-charcoal/70 leading-relaxed line-clamp-4">
                {testimonial.text}
              </p>

              {/* Date - already formatted by backend */}
              <p className="text-sm text-charcoal/50 mt-4">{testimonial.date}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialBanner
