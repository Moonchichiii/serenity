import { useMemo, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import {
  motion,
  useReducedMotion,
  type Variants,
  type Transition,
} from 'framer-motion'
import { Heart, User, Award, Mail, ArrowRight } from 'lucide-react'

import SecretTrigger from '@/components/secret/SecretTrigger'
import { Button } from '@/components/ui/Button'
import CloudImage from '@/components/ResponsiveImage'
import { useModal } from '@/shared/hooks/useModal'

// ✅ Refactored: Import selector instead of fetch hook
import { useCMSPage } from '@/lib/cmsSelectors'

// Performance: Lazy load the map
const LocationMap = lazy(() =>
  import('@/components/ui/LocationMap').then(m => ({ default: m.LocationMap }))
)

type GridItem = { title: string; image: any }

export function About() {
  const { t, i18n } = useTranslation()
  const { open } = useModal()
  const reduceMotion = useReducedMotion()

  // ✅ Read directly from store (pre-loaded)
  const cmsData = useCMSPage()

  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en'

  // CMS-FIRST CONTENT LOGIC
  const content = useMemo(() => {
    // Graceful fallback if data isn't ready (though it should be)
    if (!cmsData) return null

    const specialtiesGrid = (cmsData.specialties || [])
      .map((sp: any): GridItem => ({
        title: lang === 'fr' ? sp.title_fr : sp.title, // Manual fallback logic if not using getLocalizedText helper
        image: sp.image || null,
      }))
      .filter(s => s.title && s.title.trim().length > 0)

    return {
      title: (lang === 'fr' ? cmsData.about_title_fr : cmsData.about_title_en) ?? t('about.title'),
      subtitle: (lang === 'fr' ? cmsData.about_subtitle_fr : cmsData.about_subtitle_en) ?? t('about.subtitle'),
      intro: (lang === 'fr' ? cmsData.about_intro_fr : cmsData.about_intro_en) ?? t('about.intro'),
      certification: (lang === 'fr' ? cmsData.about_certification_fr : cmsData.about_certification_en) ?? '',
      approachTitle: (lang === 'fr' ? cmsData.about_approach_title_fr : cmsData.about_approach_title_en) ?? t('about.approachTitle'),
      approachText: (lang === 'fr' ? cmsData.about_approach_text_fr : cmsData.about_approach_text_en) ?? t('about.approachText'),
      specialtiesTitle: (lang === 'fr' ? cmsData.about_specialties_title_fr : cmsData.about_specialties_title_en) ?? t('about.specialtiesTitle'),
      studioDescription: t('about.studioDescriptionFallback'),
      address: cmsData.address ?? t('footer.address'),
      specialtiesGrid,
    }
  }, [cmsData, lang, t])

  const stripHtml = (html?: string | null) => {
    if (!html) return ''
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const spring: Transition = { type: 'spring', stiffness: 220, damping: 22 }
  const gridVariants: Variants | undefined = reduceMotion
    ? undefined
    : {
        hidden: {},
        show: {
          transition: { staggerChildren: 0.08, delayChildren: 0.12 },
        },
      }
  const cardVariants: Variants | undefined = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 18, scale: 0.97 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: spring,
        },
      }

  // Reusable Map Component
  const MapCard = () => (
    <div className="p-1">
      <Suspense
        fallback={
          <div className="w-full h-[220px] bg-stone-100 animate-pulse rounded-2xl" />
        }
      >
        <LocationMap />
      </Suspense>

      <div className="mt-3 px-1">
        <p className="text-xs text-stone-500 leading-relaxed">
          {content?.address}
        </p>
      </div>
    </div>
  )

  if (!content) return null // Hide section if no data (rare case)

  return (
    <section
      id="about"
      className="section-padding relative overflow-hidden bg-background"
      aria-labelledby="about-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* ==================== LEFT COLUMN (TEXT + MAP) ==================== */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col h-full"
          >
            {/* 1. Header & Intro */}
            <div className="space-y-6 mb-10">
              <h2
                id="about-heading"
                className="text-4xl sm:text-5xl font-serif text-foreground min-h-[1em]"
              >
                {content.title}
              </h2>

              <div className="text-lg text-foreground/80 leading-relaxed max-w-xl min-h-[4em]">
                <div>
                  <span className="inline">{stripHtml(content.intro)}</span>
                  <span className="inline-block ml-1 opacity-20 hover:opacity-100 transition-opacity align-baseline">
                    <SecretTrigger modalId="cmsLogin" times={3} windowMs={900}>
                      <span className="text-[10px] uppercase tracking-widest text-[#2e2e2e] font-bold cursor-default select-none">
                        Serenity.
                      </span>
                    </SecretTrigger>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Guides */}
            <div className="space-y-6 border-t border-stone-200/60 pt-8 mb-10">
              <h3 className="font-serif text-2xl text-foreground">
                {t('about.guidesTitle')}
              </h3>
              <div className="grid gap-6">
                {[
                  {
                    icon: User,
                    title: 'about.guide.clientCareTitle',
                    body: 'about.guide.clientCareBody',
                  },
                  {
                    icon: Award,
                    title: 'about.guide.excellenceTitle',
                    body: 'about.guide.excellenceBody',
                  },
                  {
                    icon: Heart,
                    title: 'about.guide.holisticTitle',
                    body: 'about.guide.holisticBody',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-sage-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-5 h-5 text-sage-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-0.5">
                        {t(item.title)}
                      </h4>
                      <p className="text-sm text-foreground/70 leading-relaxed">
                        {t(item.body)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-12">
              <div className="min-h-[60px]">
                {content.certification ? (
                  <div className="inline-flex items-center gap-3 pl-1 pr-6 py-2 border-l-2 border-sage-300">
                    <div>
                      <p className="text-sm font-bold text-foreground uppercase tracking-wider">
                        {t('about.certificationLabel')}
                      </p>
                      <p className="text-xs text-foreground/60">
                        {stripHtml(content.certification)}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
              <div>
                <Button
                  size="lg"
                  className="shadow-warm hover:shadow-elevated transition-all"
                  aria-label={t('contact.open', {
                    defaultValue: 'Open contact form',
                  })}
                  onClick={() =>
                    open('contact', {
                      defaultSubject: t('contact.form.subjectDefault'),
                    })
                  }
                >
                  {t('about.cta')} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* 4. Approach Section + CONTACT CARD + MAP */}
            <div className="mt-6 pt-10 border-t border-stone-200/60">
              <h3 className="text-3xl font-serif text-foreground mb-4 min-h-[1.2em]">
                {content.approachTitle}
              </h3>

              <div className="text-base text-foreground/75 leading-relaxed space-y-4 mb-8">
                <p>{stripHtml(content.approachText)}</p>
              </div>

              {/* Contact Card */}
              <div className="p-6 bg-sage-50/50 rounded-[24px] border border-sage-100/50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-sage-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {t('contact.form.title')}
                    </p>
                    <p className="text-xs text-stone-500">
                      {t('about.byAppointment')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t('contact.open', {
                    defaultValue: 'Open contact form',
                  })}
                  onClick={() => open('contact')}
                  className="text-sage-700 hover:text-sage-800 hover:bg-sage-100"
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              <MapCard />
            </div>
          </motion.article>

          {/* ==================== RIGHT COLUMN (VISUALS ONLY) ==================== */}
          <aside className="space-y-10 lg:sticky lg:top-24 hidden lg:block">
            <div className="space-y-4">
              <h3 className="font-serif text-2xl text-foreground px-1">
                {content.specialtiesTitle}
              </h3>

              <motion.div
                variants={gridVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                {content.specialtiesGrid.map((sp, i) => (
                  <motion.div
                    key={`${sp.title}-${i}`}
                    variants={cardVariants}
                    className={[
                      'relative group overflow-hidden rounded-[24px] bg-stone-100 shadow-sm border border-stone-100',
                      'transition-all duration-500 hover:shadow-warm hover:-translate-y-1',
                      i === 2 ? 'col-span-2 aspect-[2/1]' : 'aspect-square',
                    ].join(' ')}
                  >
                    {sp.image?.url && (
                      <CloudImage
                        image={sp.image}
                        alt={sp.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width:1024px) 50vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-5">
                      <span className="text-white font-medium text-lg font-serif tracking-wide">
                        {sp.title}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
