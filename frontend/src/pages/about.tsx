import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import SecretTrigger from '@/components/secret/SecretTrigger'
import { cmsAPI, type WagtailHomePage, type WagtailImage, type WagtailSpecialty } from '@/api/cms'
import { Button } from '@/components/ui/Button'
import CloudImage from '@/components/ResponsiveImage'
import { useModal } from '@/shared/hooks/useModal'

type GridItem = { title: string; image?: WagtailImage | null }

export function About() {
  const { t, i18n } = useTranslation()
  const { open } = useModal()
  const [cmsData, setCmsData] = useState<WagtailHomePage | null>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    cmsAPI.getHomePage().then(setCmsData).catch(() => setCmsData(null))
  }, [])

  const lang: 'en' | 'fr' = (i18n.language === 'en' || i18n.language === 'fr') ? i18n.language : 'fr'

  const content = useMemo(() => {
    const base = {
      title: t('about.title'),
      subtitle: t('about.subtitle'),
      intro: t('about.intro'),
      certification: t('about.certification'),
      approachTitle: t('about.approach'),
      approachText: t('about.approachText'),
      specialtiesTitle: t('about.specialties'),
      specialtiesGrid: [] as GridItem[],
    }

    if (!cmsData) return base

    const specialtiesGrid =
      (cmsData.specialties ?? [])
        .map((sp: WagtailSpecialty): GridItem => ({
          title: (lang === 'fr' ? sp.title_fr : sp.title_en) || '',
          image: sp.image ?? null,
        }))
        .filter((s: GridItem): s is GridItem => Boolean(s.title))

    return {
      ...base,
      title: (lang === 'fr' ? cmsData.about_title_fr : cmsData.about_title_en) || base.title,
      subtitle: (lang === 'fr' ? cmsData.about_subtitle_fr : cmsData.about_subtitle_en) || base.subtitle,
      intro: (lang === 'fr' ? cmsData.about_intro_fr : cmsData.about_intro_en) || base.intro,
      certification: (lang === 'fr' ? cmsData.about_certification_fr : cmsData.about_certification_en) || base.certification,
      approachTitle: (lang === 'fr' ? cmsData.about_approach_title_fr : cmsData.about_approach_title_en) || base.approachTitle,
      approachText: (lang === 'fr' ? cmsData.about_approach_text_fr : cmsData.about_approach_text_en) || base.approachText,
      specialtiesTitle: (lang === 'fr' ? cmsData.about_specialties_title_fr : cmsData.about_specialties_title_en) || base.specialtiesTitle,
      specialtiesGrid,
    }
  }, [cmsData, lang, t])

  const stripHtml = (html?: string | null) => {
    if (!html) return ''
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  // Framer Motion variants (disabled if reduceMotion)
  const gridVariants = reduceMotion
    ? undefined
    : {
        hidden: {},
        show: {
          transition: { staggerChildren: 0.08, delayChildren: 0.12 },
        },
      }

  const cardVariants = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: -24, scale: 0.98 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 220, damping: 22 },
        },
      }

  return (
    <section id="about" className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[70vh]">
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

            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => open('contact', { defaultSubject: 'Appointment request' })}
            >
              {t('about.cta', { defaultValue: 'Book a Session' })}
            </Button>
          </motion.div>

          {/* Loading skeleton for the grid */}
          {!cmsData && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:balance]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="inline-block w-full mb-5 break-inside-avoid rounded-3xl overflow-hidden shadow-lg">
                  <div className="aspect-[4/3] animate-pulse bg-sand-200" />
                  <div className="h-10 bg-white/70" />
                </div>
              ))}
            </div>
          )}

          {/* CMS-driven Specialties Masonry Grid */}
          {cmsData && (
            <motion.div
              variants={gridVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:balance]"
            >
              {content.specialtiesGrid.map((sp: GridItem, i: number) => (
                <motion.div
                  key={`${sp.title}-${i}`}
                  variants={cardVariants}
                  className="inline-block w-full mb-5 break-inside-avoid rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {sp.image?.url ? (
                    <CloudImage
                      image={sp.image}
                      alt={sp.title}
                      className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="aspect-[4/3] bg-muted grid place-items-center">
                      <span className="text-foreground/50 text-sm">{sp.title}</span>
                    </div>
                  )}
                  <div className="px-4 py-3 bg-white/70 backdrop-blur-sm">
                    <p className="text-sm text-foreground/80 text-center">{sp.title}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Keep “My approach” only; remove duplicate specialties list */}
        <div className="mt-24 max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            {content.approachTitle}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-4 text-base md:text-lg text-foreground/70 leading-relaxed"
          >
            {stripHtml(content.approachText)}
          </motion.p>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/5 rounded-full blur-3xl -z-10" />
    </section>
  )
}
