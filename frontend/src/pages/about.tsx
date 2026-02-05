import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import {
  motion,
  useReducedMotion,
  type Variants,
  type Transition,
} from 'framer-motion';
import { Heart, User, Award, MapPin, Mail, ArrowRight } from 'lucide-react';

import SecretTrigger from '@/components/secret/SecretTrigger';
import {
  cmsAPI,
  type WagtailHomePage,
  type WagtailImage,
  type WagtailSpecialty,
} from '@/api/cms';
import { Button } from '@/components/ui/Button';
import CloudImage from '@/components/ResponsiveImage';
import { useModal } from '@/shared/hooks/useModal';

// Performance: Lazy load the map
const LocationMap = lazy(() => import('@/components/ui/LocationMap').then(m => ({ default: m.LocationMap })));

// Helper for loading states
const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-stone-200/50 animate-pulse rounded ${className}`} />
);

const pick = (
  cmsValue: string | null | undefined,
  fallback: string
): string => (cmsValue !== null && cmsValue !== undefined ? cmsValue : fallback);

type GridItem = { title: string; image?: WagtailImage | null };

export function About() {
  const { t, i18n } = useTranslation();
  const { open } = useModal();
  const [cmsData, setCmsData] = useState<WagtailHomePage | null>(null);
  const reduceMotion = useReducedMotion();

  const isLoading = !cmsData;

  useEffect(() => {
    cmsAPI.getHomePage().then(setCmsData).catch(() => setCmsData(null));
  }, []);

  const lang: 'en' | 'fr' =
    i18n.language === 'en' || i18n.language === 'fr'
      ? i18n.language
      : 'fr';

  // CMS-FIRST CONTENT LOGIC
  const content = useMemo(() => {
    if (!cmsData) return null;

    const specialtiesGrid = (cmsData.specialties ?? [])
      .map((sp: WagtailSpecialty): GridItem => ({
        title: pick(lang === 'fr' ? sp.title_fr : sp.title_en, ''),
        image: sp.image ?? null,
      }))
      .filter((s) => s.title.trim().length > 0);

    return {
      title: pick(cmsData[`about_title_${lang}`], ''),
      subtitle: pick(cmsData[`about_subtitle_${lang}`], ''),
      intro: pick(cmsData[`about_intro_${lang}`], ''),
      certification: pick(cmsData[`about_certification_${lang}`], ''),
      approachTitle: pick(cmsData[`about_approach_title_${lang}`], ''),
      approachText: pick(cmsData[`about_approach_text_${lang}`], ''),
      specialtiesTitle: pick(cmsData[`about_specialties_title_${lang}`], ''),
      studioDescription: t('about.studioDescriptionFallback'),
      specialtiesGrid,
    };
  }, [cmsData, lang, t]);

  const stripHtml = (html?: string | null) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const spring: Transition = { type: 'spring', stiffness: 220, damping: 22 };
  const gridVariants: Variants | undefined = reduceMotion
    ? undefined
    : {
        hidden: {},
        show: {
          transition: { staggerChildren: 0.08, delayChildren: 0.12 },
        },
      };
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
      };

  return (
    <section
      id="about"
      className="section-padding relative overflow-hidden bg-background"
      aria-labelledby="about-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* ==================== LEFT COLUMN ==================== */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col h-full"
          >
            {/* 1. Header Block */}
            <div className="space-y-6 mb-10">
              <div
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-sage-600"
                role="presentation"
              >
                <Heart className="w-4 h-4" aria-hidden="true" />
                <span>{t('about.label')}</span>
              </div>

              <h2 id="about-heading" className="text-4xl sm:text-5xl font-serif text-foreground min-h-[1em]">
                {isLoading || !content ? (
                  <Skeleton className="h-12 w-3/4 max-w-sm" />
                ) : (
                  content.title
                )}
              </h2>

              <div className="text-lg text-foreground/80 leading-relaxed max-w-xl min-h-[4em]">
                 {isLoading || !content ? (
                   <div className="space-y-3">
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-5/6" />
                     <Skeleton className="h-4 w-4/6" />
                   </div>
                 ) : (
                   <>
                     <p>{stripHtml(content.intro)}</p>
                     <div className="mt-4 flex justify-end opacity-40 hover:opacity-100 transition-opacity">
                       <SecretTrigger modalId="cmsLogin" times={3} windowMs={900}>
                         <span className="text-[10px] uppercase tracking-widest text-sage-500 font-bold cursor-default">
                           Serenity
                         </span>
                       </SecretTrigger>
                     </div>
                   </>
                 )}
              </div>
            </div>

            {/* 2. Guides Block */}
            <div className="space-y-6 border-t border-stone-200/60 pt-8 mb-10">
              <h3 className="font-serif text-2xl text-foreground">
                {t('about.guidesTitle')}
              </h3>

              <div className="grid gap-6">
                {[
                  { icon: User, title: 'about.guide.clientCareTitle', body: 'about.guide.clientCareBody' },
                  { icon: Award, title: 'about.guide.excellenceTitle', body: 'about.guide.excellenceBody' },
                  { icon: Heart, title: 'about.guide.holisticTitle', body: 'about.guide.holisticBody' },
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

            {/* 3. CTA + Certification */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-16">
              <div className="min-h-[60px]">
                {isLoading || !content ? (
                  <Skeleton className="h-16 w-48 rounded-2xl" />
                ) : content.certification ? (
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
                  onClick={() =>
                    open('contact', { defaultSubject: t('contact.form.subjectDefault') })
                  }
                >
                  {t('about.cta')} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* 4. APPROACH SECTION (Moved Here for Balance) */}
            <div className="mt-auto pt-10 border-t border-stone-200/60">
               <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-sage-600 mb-4">
                <Award className="w-4 h-4" />
                <span>{t('about.approachLabel')}</span>
              </div>

              <h3 className="text-3xl font-serif text-foreground mb-6 min-h-[1.2em]">
                 {isLoading || !content ? <Skeleton className="h-8 w-64" /> : content.approachTitle}
              </h3>

              <div className="text-base text-foreground/75 leading-relaxed space-y-4">
                {isLoading || !content ? (
                  <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                  </>
                ) : (
                  <p>{stripHtml(content.approachText)}</p>
                )}
              </div>
            </div>
          </motion.article>


          {/* ==================== RIGHT COLUMN ==================== */}
          <aside className="space-y-10 lg:sticky lg:top-24">

            {/* 1. Images Grid */}
            <div className="space-y-4">
               {/* Note: In a real "Zen" design, we might move this heading inside the grid or remove it to be cleaner */}
              <h3 className="font-serif text-2xl text-foreground px-1">
                {isLoading || !content ? <Skeleton className="h-8 w-48" /> : content.specialtiesTitle}
              </h3>

              <motion.div
                variants={gridVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {isLoading || !content ? (
                  <>
                    <Skeleton className="col-span-1 h-48 rounded-[24px]" />
                    <Skeleton className="col-span-1 h-48 rounded-[24px]" />
                    <Skeleton className="col-span-1 sm:col-span-2 h-48 rounded-[24px]" />
                  </>
                ) : (
                  content.specialtiesGrid.map((sp, i) => (
                    <motion.div
                      key={`${sp.title}-${i}`}
                      variants={cardVariants}
                      className={[
                        'relative group overflow-hidden rounded-[24px] bg-stone-100 shadow-sm border border-stone-100',
                        'transition-all duration-500 hover:shadow-warm hover:-translate-y-1',
                        i === 2 ? 'sm:col-span-2 aspect-[2/1]' : 'aspect-square' // First 2 square, 3rd wide
                      ].join(' ')}
                    >
                      {sp.image?.url && (
                        <CloudImage
                          image={sp.image}
                          alt={sp.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                        />
                      )}
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-5">
                        <span className="text-white font-medium text-lg font-serif tracking-wide">
                          {sp.title}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>

            {/* 2. Location & Contact Cards (Stacked vertically in right column) */}
            <div className="space-y-5">

              {/* Map Card */}
              <div className="p-5 bg-white rounded-[24px] border border-stone-100 shadow-soft group hover:shadow-warm transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-sage-50 flex items-center justify-center text-sage-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                       {t('about.studioTitle', { defaultValue: 'My Studio' })}
                    </h4>
                    <p className="text-xs text-stone-500">
                      5 Avenues, 13004 Marseille
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-stone-100 relative h-[180px]">
                   <Suspense fallback={<div className="w-full h-full bg-stone-100 animate-pulse" />}>
                    <LocationMap />
                  </Suspense>
                </div>
              </div>

              {/* Contact Card */}
              <div className="p-6 bg-sage-50/50 rounded-[24px] border border-sage-100/50 flex items-center justify-between">
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
                   onClick={() => open('contact')}
                   className="text-sage-700 hover:text-sage-800 hover:bg-sage-100"
                >
                   <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </section>
  );
}
