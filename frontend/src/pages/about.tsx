import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import SecretTrigger from '@/components/secret/SecretTrigger'
import { cmsAPI } from '@/api/cms'
import { Button } from '@/components/ui/Button'

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
    specialty_5_en?: string
    specialty_5_fr?: string
  }
  const [cmsData, setCmsData] = useState<CmsData | null>(null)

  useEffect(() => {
    cmsAPI
      .getHomePage()
      .then(setCmsData)
      .catch(() => {
        console.log('CMS not ready, using fallback content')
      })
  }, [])

  const lang = i18n.language as 'en' | 'fr'

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
          lang === 'fr' ? cmsData.specialty_5_fr : cmsData.specialty_5_en || '',
        ].filter((s): s is string => Boolean(s)),
      }
    }
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
      ].filter((s): s is string => Boolean(s)),
    }
  }, [cmsData, lang, t])

  const stripHtml = (html?: string | null) => {
    if (!html) return ''
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  return (
    <section id="about" className="min-h-screen bg-accent/20 relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[85vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8 lg:pr-12"
          >
            {content.certification && (
              <div className="inline-flex items-center gap-2 bg-primary/30 backdrop-blur-sm px-4 py-2 rounded-full border border-primary">
                <span className="text-sm font-medium text-foreground">{stripHtml(content.certification)}</span>
              </div>
            )}

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
              {content.title}
            </h1>

            <p className="text-lg md:text-xl text-foreground/70 leading-relaxed max-w-lg">
              {stripHtml(content.intro)}{' '}
              <SecretTrigger modalId="cmsLogin" times={3} windowMs={900}>
                <span className="cursor-text select-text font-semibold text-sage-700 hover:text-sage-800 transition-colors">
                  Serenity
                </span>
              </SecretTrigger>
            </p>

            {content.subtitle && (
              <p className="text-base md:text-lg text-foreground/60 max-w-lg">{content.subtitle}</p>
            )}

            <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
              {t('about.cta', { defaultValue: 'Book a Session' })}
            </Button>
          </motion.div>

          {/* Pinterest-Style Image Masonry Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:balance]"
          >
            {[
              { src: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&auto=format&fit=crop', caption: 'Professional massage therapy' },
              { src: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=900&auto=format&fit=crop', caption: 'Relaxing environment' },
              { src: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&auto=format&fit=crop', caption: 'Therapeutic tools' },
              { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&auto=format&fit=crop', caption: 'Holistic wellness care' },
            ].map((img, i) => (
              <div key={i} className="inline-block w-full mb-5 break-inside-avoid rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <img
                src={img.src}
                alt={img.caption}
                className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
              <div className="px-4 py-3 bg-white/70 backdrop-blur-sm">
                <p className="text-sm text-foreground/70 text-center">{img.caption}</p>
              </div>
            </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-32 grid md:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{content.approachTitle}</h2>
            <p className="text-base md:text-lg text-foreground/70 leading-relaxed">
              {stripHtml(content.approachText)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{content.specialtiesTitle}</h2>
            <ul className="space-y-3">
              {content.specialties.map((specialty, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-accent text-xl">•</span>
                  <span className="text-base md:text-lg text-foreground/70">{specialty}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/5 rounded-full blur-3xl -z-10" />
    </section>
  )
}
