import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  motion,
  useReducedMotion,
  type Variants,
  type Transition,
} from 'framer-motion';
import { Heart, User, Award, MapPin, Phone } from 'lucide-react';

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
import { LocationMap } from '@/components/ui/LocationMap';

// Helper that respects empty strings from CMS
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

  useEffect(() => {
    cmsAPI.getHomePage().then(setCmsData).catch(() => setCmsData(null));
  }, []);

  const lang: 'en' | 'fr' =
    i18n.language === 'en' || i18n.language === 'fr'
      ? i18n.language
      : 'fr';

  // Always respect CMS → i18n only fills ORPHAN fields
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

    // Specialties grid
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

  // Animations
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
          {/* LEFT COLUMN — Story & Approach */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8 sm:space-y-10"
          >
            {/* Section label */}
            <div
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/70"
              role="presentation"
            >
              <Heart className="w-4 h-4" aria-hidden="true" />
              <span>
                {t('about.label', {
                  defaultValue: 'About Me',
                })}{' '}
                / <span lang="fr">À Propos de moi</span>
              </span>
            </div>

            {/* Heading + intro */}
            <div className="space-y-4 sm:space-y-6">
              <h2
                id="about-heading"
                className="heading-primary"
              >
                {content.title}
              </h2>

              <p className="body-text max-w-xl">
                {stripHtml(content.intro)}{' '}
                <SecretTrigger modalId="cmsLogin" times={3} windowMs={900}>
                  <span className="cursor-text select-text font-semibold text-sage-700 hover:text-sage-800 transition-colors">
                    Serenity
                  </span>
                </SecretTrigger>
              </p>

              {content.subtitle && (
                <p className="body-text text-foreground/65 max-w-xl">
                  {content.subtitle}
                </p>
              )}
            </div>

            {/* What guides me */}
            <div className="space-y-4 pt-4">
              <h3 className="heading-secondary">
                {t('about.guidesTitle', { defaultValue: 'What Guides Me' })}
              </h3>

              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('about.guide.clientCareTitle', {
                        defaultValue: 'Client-Centered Care',
                      })}
                    </h4>
                    <p className="text-sm text-foreground/70">
                      {t('about.guide.clientCareBody', {
                        defaultValue:
                          'Your comfort, safety, and goals are my top priorities.',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('about.guide.excellenceTitle', {
                        defaultValue: 'Professional Excellence',
                      })}
                    </h4>
                    <p className="text-sm text-foreground/70">
                      {t('about.guide.excellenceBody', {
                        defaultValue:
                          'I am fully certified and committed to ongoing training.',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('about.guide.holisticTitle', {
                        defaultValue: 'Holistic Approach',
                      })}
                    </h4>
                    <p className="text-sm text-foreground/70">
                      {t('about.guide.holisticBody', {
                        defaultValue:
                          'I address the whole person—body, mind, and spirit.',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certification + CTA */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4">
              {content.certification && (
                <div className="inline-flex items-center gap-3 bg-background px-6 py-4 rounded-2xl shadow-soft border border-primary/15">
                  <Award className="w-7 h-7 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t('about.certificationLabel', {
                        defaultValue: 'Certified',
                      })}
                    </p>
                    <p className="text-xs text-foreground/70">
                      {stripHtml(content.certification)}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-1">
                {/* Uses default sage Button styles, just a soft shadow */}
                <Button
  size="md"
  className="shadow-warm"
  onClick={() =>
    open('contact', { defaultSubject: 'Appointment request' })
  }
>
  {t('about.cta')}
</Button>

              </div>
            </div>
          </motion.article>

          {/* RIGHT COLUMN — Studio & Specialties */}
          {cmsData && (
            <aside className="space-y-8">
              <div className="space-y-3">
                <h3 className="heading-secondary">
                  {content.specialtiesTitle ||
                    t('about.studioTitle', {
                      defaultValue: 'My Private Studio',
                    })}
                </h3>
                <p className="body-text max-w-md">
                  {t('about.studioDescription', {
                    defaultValue:
                      'Experience a tranquil, safe, and nurturing environment designed for your comfort and healing.',
                  })}
                </p>
              </div>

              {/* Specialty cards grid */}
              <motion.div
                variants={gridVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 auto-rows-[160px] sm:auto-rows-[200px] lg:auto-rows-[230px]"
              >
                {content.specialtiesGrid.map((sp, i) => (
                  <motion.div
                    key={`${sp.title}-${i}`}
                    variants={cardVariants}
                    className={[
                      'relative group overflow-hidden rounded-[26px] bg-charcoal/5 shadow-soft',
                      'transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-elevated',
                      'col-span-1',
                      i === 0 ? 'sm:row-span-2' : '',
                    ].join(' ')}
                  >
                    {sp.image?.url && (
                      <CloudImage
                        image={sp.image}
                        alt={sp.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 45vw"
                      />
                    )}

                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/35 to-black/0">
                      <div className="p-4 sm:p-5">
                        <h4 className="text-base sm:text-lg md:text-xl font-serif font-semibold text-white drop-shadow-sm">
                          {sp.title}
                        </h4>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

             {/* Location & contact tile */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
  <div className="text-center p-4 bg-background rounded-xl border border-primary/15 shadow-soft">
    <MapPin className="w-6 h-6 mx-auto text-primary mb-2" />
    <LocationMap />
    <div className="text-sm font-medium text-foreground">
      {t('about.studioLocationTitle', {
        defaultValue: 'Private Studio Location',
      })}
    </div>
    <div className="text-xs text-foreground/70">
      {t('about.byAppointment', {
        defaultValue: 'By Appointment Only',
      })}
    </div>
  </div>
  <div className="text-center p-4 bg-background rounded-xl border border-primary/15 shadow-soft">
    <Phone className="w-6 h-6 mx-auto text-primary mb-2" />
    <div className="text-sm font-medium text-foreground">
      {t('about.contactTitle', {
        defaultValue: 'Contact via email through the booking form',
      })}
    </div>
    <div className="text-xs text-foreground/70">
      {t('about.byAppointment', {
        defaultValue: 'By Appointment Only',
      })}
    </div>
  </div>
</div>

            </aside>
          )}
        </div>

        {/* Approach / philosophy section (bottom) */}
        <div className="mt-24 mb-24 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/70">
            <Heart className="w-4 h-4" />
            <span>{t('about.approachLabel', { defaultValue: 'My Approach' })}</span>
          </div>
          <h2 className="heading-secondary">
            {t('about.approachHeading', {
              defaultValue: 'A Personalized Wellness Journey',
            })}
          </h2>
          <p className="body-large max-w-3xl mx-auto">
            {stripHtml(content.approachText)}
          </p>
        </div>
      </div>

      {/* Soft background blobs — keep existing colors */}
      <div className="pointer-events-none absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/5 rounded-full blur-3xl -z-10" />
    </section>
  );
}
