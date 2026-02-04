import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, User, Award, MapPin } from 'lucide-react';

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

const LocationMap = lazy(() => import('@/components/ui/LocationMap').then(m => ({ default: m.LocationMap })));

const pick = (
  cmsValue: string | null | undefined,
  fallback: string
): string => (cmsValue !== null && cmsValue !== undefined ? cmsValue : fallback);

type GridItem = { title: string; image?: WagtailImage | null };

export function About() {
  const { t, i18n } = useTranslation();
  const { open } = useModal();
  const [cmsData, setCmsData] = useState<WagtailHomePage | null>(null);

  useEffect(() => {
    cmsAPI.getHomePage().then(setCmsData).catch(() => setCmsData(null));
  }, []);

  const lang: 'en' | 'fr' =
    i18n.language === 'en' || i18n.language === 'fr'
      ? i18n.language
      : 'fr';

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
    };

    if (!cmsData) return base;

    const specialtiesGrid = (cmsData.specialties ?? [])
      .map((sp: WagtailSpecialty): GridItem => ({
        title: pick(lang === 'fr' ? sp.title_fr : sp.title_en, ''),
        image: sp.image ?? null,
      }))
      .filter((s) => s.title.trim().length > 0);

    return {
      ...base,
      title: pick(cmsData[`about_title_${lang}`], base.title),
      subtitle: pick(cmsData[`about_subtitle_${lang}`], base.subtitle),
      intro: pick(cmsData[`about_intro_${lang}`], base.intro),
      certification: pick(
        cmsData[`about_certification_${lang}`],
        base.certification
      ),
      approachTitle: pick(
        cmsData[`about_approach_title_${lang}`],
        base.approachTitle
      ),
      approachText: pick(
        cmsData[`about_approach_text_${lang}`],
        base.approachText
      ),
      specialtiesTitle: pick(
        cmsData[`about_specialties_title_${lang}`],
        base.specialtiesTitle
      ),
      specialtiesGrid,
    };
  }, [cmsData, lang, t]);

  const stripHtml = (html?: string | null) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <section
      id="about"
      className="relative py-24 bg-stone-50/30"
      aria-labelledby="about-heading"
    >
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

          {/* LEFT COLUMN: Text Content (Span 7) */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-10"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-sage-600 uppercase">
              <span className="w-8 h-[1px] bg-sage-400"></span>
              <span>
                {t('about.label', { defaultValue: 'About Me' })}{' '}
                / <span lang="fr">À Propos de moi</span>
              </span>
            </div>

            {/* Heading - Huge & Serif */}
            <h2 id="about-heading" className="text-4xl md:text-6xl font-heading text-charcoal leading-[1.1]">
              {content.title}
            </h2>

            {/* Editorial Intro - Left Aligned, Relaxed Leading */}
            <div className="text-lg md:text-xl text-stone-600 leading-loose space-y-6">
               <div>
                  {stripHtml(content.intro)}{' '}
                  <SecretTrigger modalId="cmsLogin" times={3} windowMs={900}>
                    <span className="cursor-text select-text font-semibold text-sage-700 hover:text-sage-800 transition-colors">
                      Serenity
                    </span>
                  </SecretTrigger>
               </div>
               {content.subtitle && <p className="text-stone-500 italic font-serif">{content.subtitle}</p>}
            </div>

            {/* Values Grid - Refined Clean Look */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-heading text-charcoal mb-6 border-b border-stone-200 pb-2">
                {t('about.guidesTitle', { defaultValue: 'What Guides Me' })}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                <div className="space-y-3">
                   <User className="w-6 h-6 text-sage-600" />
                   <h4 className="font-heading text-xl text-charcoal">{t('about.guide.clientCareTitle', { defaultValue: 'Client-Centered Care' })}</h4>
                   <p className="text-sm text-stone-500 leading-relaxed">{t('about.guide.clientCareBody')}</p>
                </div>

                <div className="space-y-3">
                   <Award className="w-6 h-6 text-honey-500" />
                   <h4 className="font-heading text-xl text-charcoal">{t('about.guide.excellenceTitle', { defaultValue: 'Professional Excellence' })}</h4>
                   <p className="text-sm text-stone-500 leading-relaxed">{t('about.guide.excellenceBody')}</p>
                </div>

                <div className="space-y-3">
                   <Heart className="w-6 h-6 text-rose-400" />
                   <h4 className="font-heading text-xl text-charcoal">{t('about.guide.holisticTitle', { defaultValue: 'Holistic Approach' })}</h4>
                   <p className="text-sm text-stone-500 leading-relaxed">{t('about.guide.holisticBody')}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-8 items-center sm:items-start">
              <Button
                size="lg"
                className="rounded-full px-8 bg-charcoal text-white hover:bg-sage-700 transition-colors shadow-xl shadow-sage-900/10 w-full sm:w-auto"
                onClick={() => open('contact', { defaultSubject: 'Appointment request' })}
              >
                {t('about.cta')}
              </Button>

              {content.certification && (
                <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-stone-100 shadow-sm w-full sm:w-auto">
                  <Award className="w-5 h-5 text-sage-500" />
                  <span className="text-xs text-stone-600 font-medium max-w-[200px]">
                     {stripHtml(content.certification)}
                  </span>
                </div>
              )}
            </div>
          </motion.article>

          {/* RIGHT COLUMN: Visuals & Map (Span 5) - STICKY */}
          <aside className="hidden lg:block lg:col-span-5 space-y-8 sticky top-24">
             {/* Image Grid */}
             {content.specialtiesGrid.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {content.specialtiesGrid.slice(0, 4).map((sp, i) => (
                    <div
                      key={i}
                      className={`relative rounded-2xl overflow-hidden shadow-soft border border-stone-100 group ${i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}
                    >
                        {sp.image?.url && (
                          <CloudImage
                            image={sp.image}
                            alt={sp.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width:1024px) 50vw, 400px"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                        <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-lg">
                          <span className="text-xs font-bold text-charcoal uppercase tracking-wider">{sp.title}</span>
                        </div>
                    </div>
                  ))}
                </div>
             )}

             {/* Minimal Map Card */}
             <div className="bg-white p-6 rounded-3xl shadow-soft border border-stone-100">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-sage-50 rounded-full text-sage-600"><MapPin size={20}/></div>
                    <div>
                      <h5 className="font-bold text-charcoal text-sm">Mon Cabinet</h5>
                      <p className="text-xs text-stone-500">Marseille, France</p>
                    </div>
                 </div>
                 <Suspense fallback={<div className="h-40 bg-stone-100 animate-pulse rounded-xl"/>}>
                    <div className="rounded-xl overflow-hidden h-40 grayscale-[50%] hover:grayscale-0 transition-all duration-500">
                      <LocationMap />
                    </div>
                 </Suspense>
             </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
