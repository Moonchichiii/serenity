import { useMemo, lazy, Suspense, type FC } from "react";
import { useTranslation } from "react-i18next";
import {
  motion,
  useReducedMotion,
  type Variants,
  type Transition,
} from "framer-motion";
import {
  Heart,
  User,
  Award,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import SecretTrigger from "@/components/secret/SecretTrigger";
import { Button } from "@/components/ui/Button";
import ResponsiveImageComponent from "@/components/ui/ResponsiveImage";
import { useModal } from "@/components/modal/useModal";
import { useCMSPage, useCMSGlobals } from "@/hooks/useCMS";
import type { ResponsiveImage, WagtailSpecialty } from "@/types/api";
import { cmsText } from "@/lib/cmsText";
import { cn } from "@/lib/utils";

// ── Lazy imports ─────────────────────────────────────────────────────
const LocationMap = lazy(() =>
  import("@/components/ui/LocationMap").then((m) => ({
    default: m.LocationMap,
  })),
);

// ── Constants ────────────────────────────────────────────────────────
const SECRET_TRIGGER_TAPS = 3;
const SECRET_TRIGGER_WINDOW_MS = 900;

const SPRING_TRANSITION: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 22,
};

const FADE_IN_TRANSITION = {
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1],
} as const;

const GRID_STAGGER: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.25 },
  },
};

const CARD_ENTRANCE: Variants = {
  hidden: { opacity: 0, x: 80, scale: 0.94 },
  show: { opacity: 1, x: 0, scale: 1, transition: SPRING_TRANSITION },
};

const WIDE_CARD_INDEX = 2;

// ── Types ────────────────────────────────────────────────────────────
interface GridItem {
  title: string;
  image: ResponsiveImage | null;
}

interface GuideItem {
  icon: LucideIcon;
  titleKey: string;
  bodyKey: string;
}

interface AboutContent {
  title: string;
  subtitle: string;
  intro: string;
  certification: string;
  approachTitle: string;
  approachText: string;
  specialtiesTitle: string;
  studioDescription: string;
  address: string;
  specialtiesGrid: GridItem[];
}

type SupportedLang = "fr" | "en";

// ── Guide definitions ────────────────────────────────────────────────
const GUIDES: readonly GuideItem[] = [
  {
    icon: User,
    titleKey: "about.guide.clientCareTitle",
    bodyKey: "about.guide.clientCareBody",
  },
  {
    icon: Award,
    titleKey: "about.guide.excellenceTitle",
    bodyKey: "about.guide.excellenceBody",
  },
  {
    icon: Heart,
    titleKey: "about.guide.holisticTitle",
    bodyKey: "about.guide.holisticBody",
  },
] as const;

// ─── Uniform guide accents — clean, no rainbow ─────────────────────
const GUIDE_ACCENTS = [
  {
    bg: "bg-transparent",
    border: "border-warm-grey-200",
    icon: "text-charcoal",
  },
  {
    bg: "bg-transparent",
    border: "border-warm-grey-200",
    icon: "text-charcoal",
  },
  {
    bg: "bg-transparent",
    border: "border-warm-grey-200",
    icon: "text-charcoal",
  },
] as const;

// ── Utilities ────────────────────────────────────────────────────────
function stripHtml(html?: string | null): string {
  if (!html) return "";
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent ?? el.innerText ?? "";
}

function resolveLang(language: string): SupportedLang {
  return language.startsWith("fr") ? "fr" : "en";
}

function pickLocalized<T>(lang: SupportedLang, fr: T, en: T): T {
  return lang === "fr" ? fr : en;
}

function buildSpecialtiesGrid(
  specialties: WagtailSpecialty[],
  lang: SupportedLang,
): GridItem[] {
  return specialties
    .map(
      (sp): GridItem => ({
        title: pickLocalized(lang, sp.title_fr ?? "", sp.title_en ?? ""),
        image: sp.image ?? null,
      }),
    )
    .filter((s) => s.title.trim().length > 0);
}

// ── Sub-components ───────────────────────────────────────────────────
const MapFallback: FC = () => (
  <div className="h-[200px] w-full animate-pulse rounded-2xl bg-sand-100" />
);

const MapCard: FC<{ address: string }> = ({ address }) => (
  <div className="overflow-hidden rounded-2xl border border-warm-grey-200/50">
    <Suspense fallback={<MapFallback />}>
      <LocationMap />
    </Suspense>
    <div className="bg-white/40 px-5 py-3">
      <p className="whitespace-pre-line text-xs leading-relaxed text-warm-grey-400">
        {address}
      </p>
    </div>
  </div>
);

const GuideEntry: FC<{ item: GuideItem; index: number }> = ({
  item,
  index,
}) => {
  const { t } = useTranslation();
  const Icon = item.icon;
  const accent = GUIDE_ACCENTS[index % GUIDE_ACCENTS.length];

  return (
    <div className="flex items-start gap-5">
      <div
        className={cn(
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
          accent.bg,
          accent.border,
        )}
      >
        <Icon className={cn("h-[18px] w-[18px] stroke-[1.5]", accent.icon)} />
      </div>
      <div>
        <h4 className="mb-1 text-sm font-semibold tracking-wide text-charcoal">
          {t(item.titleKey)}
        </h4>
        <p className="text-sm leading-relaxed text-warm-grey-400">
          {t(item.bodyKey)}
        </p>
      </div>
    </div>
  );
};

const SpecialtyCard: FC<{
  item: GridItem;
  index: number;
  variants: Variants | undefined;
}> = ({ item, index, variants }) => (
  <motion.div
    variants={variants}
    className={cn(
      "group relative overflow-hidden rounded-3xl bg-sand-100",
      "shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated",
      index === WIDE_CARD_INDEX
        ? "col-span-2 aspect-[2.2/1]"
        : "aspect-[4/5]",
    )}
  >
    {item.image?.src && (
      <ResponsiveImageComponent
        image={item.image}
        alt={item.title}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        sizes="(max-width:1024px) 50vw, 33vw"
      />
    )}
    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-charcoal/55 via-charcoal/10 to-transparent p-6">
      <span className="font-serif text-lg tracking-wide text-white drop-shadow-md">
        {item.title}
      </span>
    </div>
  </motion.div>
);

const CertificationBadge: FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="inline-flex items-center gap-3 border-l-2 border-charcoal py-2 pl-4 pr-5">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-charcoal">
        {label}
      </p>
      <p className="text-xs text-warm-grey-400">{value}</p>
    </div>
  </div>
);

const ContactCard: FC<{ onContact: () => void }> = ({ onContact }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-8 flex items-center justify-between rounded-2xl border border-warm-grey-200 bg-white/60 p-5 transition-all duration-300 hover:border-warm-grey-300 hover:shadow-soft">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-warm-grey-200 text-charcoal">
          <ArrowRight className="h-[18px] w-[18px] stroke-[1.5]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-charcoal">
            {t("contact.form.title")}
          </p>
          <p className="text-xs text-warm-grey-400">
            {t("about.byAppointment")}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        aria-label={t("contact.open", {
          defaultValue: "Open contact form",
        })}
        onClick={onContact}
        className="text-charcoal hover:bg-sand-100 hover:text-charcoal"
      >
        <ArrowRight className="h-5 w-5 stroke-[1.5]" />
      </Button>
    </div>
  );
};

// ── Content builder hook ─────────────────────────────────────────────
function useAboutContent(): AboutContent | null {
  const { t, i18n } = useTranslation();
  const cmsData = useCMSPage();
  const globals = useCMSGlobals();
  const lang = resolveLang(i18n.language);

  return useMemo(() => {
    if (!cmsData) return null;

    const pick = <T,>(fr: T, en: T): T => pickLocalized(lang, fr, en);
    const txt = (fr: unknown, en: unknown, fallback: string): string =>
      cmsText(pick(fr, en) as string | undefined, fallback);

    return {
      title: txt(
        cmsData.about_title_fr,
        cmsData.about_title_en,
        t("about.title"),
      ),
      subtitle: txt(
        cmsData.about_subtitle_fr,
        cmsData.about_subtitle_en,
        t("about.subtitle"),
      ),
      intro: txt(
        cmsData.about_intro_fr,
        cmsData.about_intro_en,
        t("about.intro"),
      ),
      certification: txt(
        cmsData.about_certification_fr,
        cmsData.about_certification_en,
        "",
      ),
      approachTitle: txt(
        cmsData.about_approach_title_fr,
        cmsData.about_approach_title_en,
        t("about.approachTitle"),
      ),
      approachText: txt(
        cmsData.about_approach_text_fr,
        cmsData.about_approach_text_en,
        t("about.approachText"),
      ),
      specialtiesTitle: txt(
        cmsData.about_specialties_title_fr,
        cmsData.about_specialties_title_en,
        t("about.specialtiesTitle"),
      ),
      studioDescription: t("about.studioDescriptionFallback"),
      address:
        globals?.site?.address_full?.trim() || t("footer.addressFull"),
      specialtiesGrid: buildSpecialtiesGrid(
        cmsData.specialties ?? [],
        lang,
      ),
    };
  }, [cmsData, globals, lang, t]);
}

// ── Main component ──────────────────────────────────────────────────
export const About: FC = () => {
  const { t } = useTranslation();
  const { open } = useModal();
  const reduceMotion = useReducedMotion();
  const content = useAboutContent();

  const gridVariants = reduceMotion ? undefined : GRID_STAGGER;
  const cardVariants = reduceMotion ? undefined : CARD_ENTRANCE;

  const openContactDefault = () =>
    open("contact", { defaultSubject: t("contact.form.subjectDefault") });

  const openContact = () => open("contact");

  if (!content) return null;

  return (
    <section
      id="about"
      className="section-spacious relative overflow-hidden bg-tint-cream"
      aria-labelledby="about-heading"
    >
      {/* Single subtle background element */}
      <div className="noise-texture-subtle" aria-hidden="true" />
      <div
        className="organic-blob organic-blob-sage absolute -top-60 -right-60 h-[400px] w-[400px] opacity-25"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-24">
          {/* ─── LEFT COLUMN ─────────────────────────────────── */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={FADE_IN_TRANSITION}
            className="flex h-full flex-col"
          >
            {/* Header & Intro */}
            <div className="mb-12 space-y-6">
              <h2
                id="about-heading"
                className="min-h-[1em] text-editorial-lg text-charcoal heading-accent"
              >
                {content.title}
              </h2>

              <div className="min-h-[4em] max-w-xl text-base leading-[1.8] text-warm-grey-500">
                <div>
                  <span className="inline">
                    {stripHtml(content.intro)}
                  </span>
                  <span className="ml-1 inline-block align-baseline opacity-20 transition-opacity hover:opacity-100">
                    <SecretTrigger
                      modalId="cmsLogin"
                      times={SECRET_TRIGGER_TAPS}
                      windowMs={SECRET_TRIGGER_WINDOW_MS}
                    >
                      <span className="cursor-default select-none text-[10px] font-bold uppercase tracking-widest text-charcoal">
                        Serenity.
                      </span>
                    </SecretTrigger>
                  </span>
                </div>
              </div>
            </div>

            {/* Guides */}
            <div className="mb-12 space-y-7 border-t border-warm-grey-200/50 pt-10">
              <h3 className="font-serif text-2xl text-charcoal">
                {t("about.guidesTitle")}
              </h3>
              <div className="grid gap-7">
                {GUIDES.map((item, i) => (
                  <GuideEntry
                    key={item.titleKey}
                    item={item}
                    index={i}
                  />
                ))}
              </div>
            </div>

            {/* CTA row */}
            <div className="mb-14 flex flex-col gap-8 sm:flex-row sm:items-center">
              <div className="min-h-[60px]">
                {content.certification && (
                  <CertificationBadge
                    label={t("about.certificationLabel")}
                    value={stripHtml(content.certification)}
                  />
                )}
              </div>
              <div>
                <Button
                  variant="cta"
                  size="lg"
                  className="shadow-elevated"
                  aria-label={t("contact.open", {
                    defaultValue: "Open contact form",
                  })}
                  onClick={openContactDefault}
                >
                  {t("about.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Approach + Map (contact card removed — CTA already opens modal) */}
            <div className="mt-auto border-t border-warm-grey-200/50 pt-10">
              <h3 className="mb-5 min-h-[1.2em] text-editorial-md text-charcoal">
                {content.approachTitle}
              </h3>

              <div className="mb-10 space-y-4">
                <p className="text-pull-quote">
                  {stripHtml(content.approachText)}
                </p>
              </div>

              <MapCard address={content.address} />
            </div>
          </motion.article>

          {/* ─── RIGHT COLUMN ────────────────────────────────── */}
          <aside className="hidden space-y-8 lg:sticky lg:top-28 lg:block">
            <div className="space-y-5">
              <h3 className="px-1 font-serif text-2xl text-charcoal">
                {content.specialtiesTitle}
              </h3>

              <motion.div
                variants={gridVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                className="grid grid-cols-2 gap-3"
              >
                {content.specialtiesGrid.map((sp, i) => (
                  <SpecialtyCard
                    key={`${sp.title}-${i}`}
                    item={sp}
                    index={i}
                    variants={cardVariants}
                  />
                ))}
              </motion.div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
