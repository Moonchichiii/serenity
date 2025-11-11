import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Award } from 'lucide-react'
import SecretTrigger from '@/components/secret/SecretTrigger'
import { cmsAPI } from '@/api/cms'

export function About() {
  const { t, i18n } = useTranslation()
  type CmsData = {
    about_title_en?: string
    about_title_fr?: string
    about_subtitle_en?: string
    about_subtitle_fr?: string
    about_intro_en?: string
    about_intro_fr?: string
    about_certification_en?: string
    about_certification_fr?: string
    about_approach_title_en?: string
    about_approach_title_fr?: string
    about_approach_text_en?: string
    about_approach_text_fr?: string
    about_specialties_title_en?: string
    about_specialties_title_fr?: string
    specialty_1_en?: string
    specialty_1_fr?: string
    specialty_2_en?: string
    specialty_2_fr?: string
    specialty_3_en?: string
    specialty_3_fr?: string
    specialty_4_en?: string
    specialty_4_fr?: string
  }
  const [cmsData, setCmsData] = useState<CmsData | null>(null)

  // Fetch CMS data
  useEffect(() => {
    cmsAPI
      .getHomePage()
      .then(setCmsData)
      .catch(() => {
        console.log('CMS not ready, using fallback content')
      })
  }, [])

  const lang = i18n.language as 'en' | 'fr'

  // Get content from CMS or fallback to i18n
  const content = useMemo(() => {
    if (cmsData) {
      return {
        title: lang === 'fr' ? cmsData.about_title_fr : cmsData.about_title_en || t('about.title'),
        subtitle: lang === 'fr' ? cmsData.about_subtitle_fr : cmsData.about_subtitle_en || t('about.subtitle'),
        intro: lang === 'fr' ? cmsData.about_intro_fr : cmsData.about_intro_en || t('about.intro'),
        certification: lang === 'fr' ? cmsData.about_certification_fr : cmsData.about_certification_en || t('about.certification'),
        approachTitle: lang === 'fr' ? cmsData.about_approach_title_fr : cmsData.about_approach_title_en || t('about.approach'),
        approachText: lang === 'fr' ? cmsData.about_approach_text_fr : cmsData.about_approach_text_en || t('about.approachText'),
        specialtiesTitle: lang === 'fr' ? cmsData.about_specialties_title_fr : cmsData.about_specialties_title_en || t('about.specialties'),
        specialties: [
          lang === 'fr' ? cmsData.specialty_1_fr : cmsData.specialty_1_en || t('about.specialty1'),
          lang === 'fr' ? cmsData.specialty_2_fr : cmsData.specialty_2_en || t('about.specialty2'),
          lang === 'fr' ? cmsData.specialty_3_fr : cmsData.specialty_3_en || t('about.specialty3'),
          lang === 'fr' ? cmsData.specialty_4_fr : cmsData.specialty_4_en || t('about.specialty4'),
        ],
      }
    }

    // Fallback to i18n
    return {
      title: t('about.title'),
      subtitle: t('about.subtitle'),
      intro: t('about.intro'),
      certification: t('about.certification'),
      approachTitle: t('about.approach'),
      approachText: t('about.approachText'),
      specialtiesTitle: t('about.specialties'),
      specialties: [
        t('about.specialty1'),
        t('about.specialty2'),
        t('about.specialty3'),
        t('about.specialty4'),
      ],
    }
  }, [cmsData, lang, t])

  // Placeholder images for specialties - professional massage/spa imagery
  // Replace these URLs with your own images when ready
  const specialtyImages = [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop', // Massage hands
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=400&fit=crop', // Spa stones
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=400&fit=crop', // Pregnant woman
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', // Wellness/yoga
  ]

  // Helper to strip HTML tags from RichTextField content
  const stripHtml = (html?: string | null) => {
    if (!html) return ''
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  return (
    <section id="about" className="py-24 px-4 lg:px-8 bg-gradient-warm">
      {/* Header - Centered with more breathing room */}
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading text-charcoal mb-6">
            {content.title}
          </h2>
          <p className="text-xl md:text-2xl text-charcoal/70 leading-relaxed">
            {content.subtitle}
          </p>
        </motion.div>

        {/* Modern Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">

          {/* Left Column - Intro Card (spans 7 columns on desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="bg-white rounded-3xl p-8 md:p-10 lg:p-12 shadow-soft hover:shadow-elevated transition-all duration-300 h-full border border-sage-200/50">
              <p className="text-lg md:text-xl text-charcoal/80 leading-relaxed mb-6">
                {stripHtml(content.intro)}{' '}
                <SecretTrigger modalId="cmsLogin" times={3} windowMs={900}>
                  <span className="cursor-text select-text font-semibold text-sage-600 hover:text-sage-700 transition-colors">
                    Serenity
                  </span>
                </SecretTrigger>
              </p>

              {content.certification && (
                <div className="inline-flex items-center gap-3 bg-honey-50 px-5 py-3 rounded-2xl border border-honey-200/50">
                  <Award className="w-5 h-5 text-honey-600" />
                  <span className="text-sm font-medium text-charcoal">
                    {content.certification}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Approach Card (spans 5 columns on desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="bg-gradient-to-br from-sage-50 to-sage-100 rounded-3xl p-8 md:p-10 shadow-soft hover:shadow-elevated transition-all duration-300 h-full border border-sage-200/50">
              <h3 className="text-2xl md:text-3xl font-heading text-charcoal mb-4">
                {content.approachTitle}
              </h3>
              <p className="text-base md:text-lg text-charcoal/70 leading-relaxed">
                {stripHtml(content.approachText)}
              </p>
            </div>
          </motion.div>

          {/* Full Width - Specialties Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-12"
          >
            <div className="bg-white rounded-3xl p-8 md:p-10 lg:p-12 shadow-soft hover:shadow-elevated transition-all duration-300 border border-sage-200/50">
              <h3 className="text-2xl md:text-3xl font-heading text-charcoal mb-8 text-center lg:text-left">
                {content.specialtiesTitle}
              </h3>

              {/* Specialties Grid - 4 cards in a row on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {content.specialties.map((specialty, index) => {
                  const imageUrl = specialtyImages[index] || specialtyImages[0]
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group"
                    >
                      <div className="bg-porcelain rounded-2xl overflow-hidden shadow-sm hover:shadow-warm transition-all duration-300 border border-sage-100">
                        {/* Image Section */}
                        <div className="relative h-48 overflow-hidden bg-sage-100">
                          <img
                            src={imageUrl}
                            alt={specialty}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                          {/* Subtle overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Text Section */}
                        <div className="p-5">
                          <p className="text-base font-medium text-charcoal leading-snug text-center">
                            {specialty}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
