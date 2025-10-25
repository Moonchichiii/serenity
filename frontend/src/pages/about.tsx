import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Award, Heart, Sparkles, Users } from 'lucide-react'
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

  const specialtyIcons = [
    { icon: Sparkles, color: 'bg-terracotta-100 text-terracotta-500' },
    { icon: Heart, color: 'bg-honey-100 text-honey-500' },
    { icon: Users, color: 'bg-sage-100 text-sage-500' },
    { icon: Award, color: 'bg-lavender-100 text-lavender-500' },
  ]

  // Helper to strip HTML tags from RichTextField content
  const stripHtml = (html?: string | null) => {
    if (!html) return ''
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

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
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-charcoal mb-4">
            {content.title}
          </h2>
          <p className="text-xl text-charcoal/70">{content.subtitle}</p>
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
              {stripHtml(content.intro)}{' '}
              <SecretTrigger modalId="cmsLogin" times={3} windowMs={900}>
                <span className="cursor-text select-text font-semibold text-charcoal/70 hover:text-charcoal transition-colors">
                  Serenity
                </span>
              </SecretTrigger>
            </p>

            {content.certification && (
              <div className="inline-flex items-center gap-2 bg-honey-100 px-4 py-2 rounded-full">
                <Award className="w-5 h-5 text-honey-500" />
                <span className="text-sm font-medium text-charcoal">
                  {content.certification}
                </span>
              </div>
            )}
          </motion.div>

          {/* Approach Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-terracotta-100 to-honey-100 rounded-3xl p-8 shadow-soft hover:shadow-warm transition-all duration-300 row-span-2 border-2 border-terracotta-200/30"
          >
            <h3 className="text-2xl font-heading font-semibold text-charcoal mb-4">
              {content.approachTitle}
            </h3>
            <p className="text-charcoal/70 leading-relaxed">
              {stripHtml(content.approachText)}
            </p>
          </motion.div>

          {/* Specialties Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-sage-100 rounded-3xl p-8 shadow-soft hover:shadow-warm transition-all duration-300 lg:col-span-2 border-2 border-sage-200/30"
          >
            <h3 className="text-2xl font-heading font-semibold text-charcoal mb-6">
              {content.specialtiesTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {content.specialties.map((specialty, index) => {
                const Icon = specialtyIcons[index]?.icon
                const iconColor = specialtyIcons[index]?.color ?? ''
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-3 bg-white rounded-2xl p-4 hover:shadow-warm transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-terracotta-300/50"
                  >
                    <div className={`p-3 rounded-xl ${iconColor}`}>
                      {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <span className="text-charcoal font-medium">{specialty}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  )
}
