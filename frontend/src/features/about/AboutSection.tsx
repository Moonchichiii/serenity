import { useMemo, lazy, Suspense, type FC } from "react";
import { useTranslation } from "react-i18next";
import {
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { Heart, User, Award, ArrowRight, type LucideIcon } from "lucide-react";

import SecretTrigger from "@/components/secret/SecretTrigger";
import { Button } from "@/components/ui/Button";
import { useModal } from "@/components/modal/useModal";
import { useCMSPage, useCMSGlobals } from "@/hooks/useCMS";
import { cmsText } from "@/lib/cmsText";
import { cn } from "@/lib/utils";

// ── Lazy imports ─────────────────────────────────────────────────────
const LocationMap = lazy(() =>
  import("@/components/ui/LocationMap").then((m) => ({
    default: m.LocationMap,
  }))
);

// ── Constants ────────────────────────────────────────────────────────
const SECRET_TRIGGER_TAPS = 3;
const SECRET_TRIGGER_WINDOW_MS = 900;

const FADE_IN_TRANSITION: Transition = {
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1],
};

// ── Types ────────────────────────────────────────────────────────────
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
  studioDescription: string;
  address: string;
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

// ─── Uniform guide accents ───────────────────────────────────────────
const GUIDE_ACCENTS = [
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

const GuideEntry: FC<{ item: GuideItem; index: number }> = ({ item, index }) => {
  const { t } = useTranslation();
  const Icon = item.icon;
  const accent = GUIDE_ACCENTS[0]; // Simplified since accents are uniform

  return (
    <div className="flex items-start gap-5">
      <div
        className={cn(
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
          accent.bg,
          accent.border
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
        t("about.title")
      ),
      subtitle: txt(
        cmsData.about_subtitle_fr,
        cmsData.about_subtitle_en,
        t("about.subtitle")
      ),
      intro: txt(
        cmsData.about_intro_fr,
        cmsData.about_intro_en,
        t("about.intro")
      ),
      certification: txt(
        cmsData.about_certification_fr,
        cmsData.about_certification_en,
        ""
      ),
      approachTitle: txt(
        cmsData.about_approach_title_fr,
        cmsData.about_approach_title_en,
        t("about.approachTitle")
      ),
      approachText: txt(
        cmsData.about_approach_text_fr,
        cmsData.about_approach_text_en,
        t("about.approachText")
      ),
      studioDescription: t("about.studioDescriptionFallback"),
      address: globals?.site?.address_full?.trim() || t("footer.addressFull"),
    };
  }, [cmsData, globals, lang, t]);
}
// ── Main component ──────────────────────────────────────────────────
export const About: FC = () => {
  const { t } = useTranslation();
  const { open } = useModal();
  const reduceMotion = useReducedMotion();
  const content = useAboutContent();

  const openContactDefault = () =>
    open("contact", { defaultSubject: t("contact.form.subjectDefault") });

  if (!content) return null;

  return (
    <section
      id="about"
      className="section-spacious relative overflow-hidden bg-tint-cream"
      aria-labelledby="about-heading"
    >
      {/* Subtle background elements for depth */}
      <div className="noise-texture-subtle" aria-hidden="true" />
      <div
        className="organic-blob organic-blob-sage absolute -top-60 -right-60 h-[400px] w-[400px] opacity-25"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={reduceMotion ? undefined : FADE_IN_TRANSITION}
          className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24"
        >
          {/* ─── LEFT COLUMN: Bio & CTA (Sticky) ────────────────── */}
          <div className="flex flex-col items-start lg:col-span-5 lg:sticky lg:top-32 lg:h-max">
            <h2
              id="about-heading"
              className="mb-8 text-editorial-lg text-charcoal heading-accent"
            >
              {content.title}
            </h2>

            <div className="mb-10 text-base leading-[1.8] text-warm-grey-600">
              <span className="inline">{stripHtml(content.intro)}</span>
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

            <div className="flex w-full flex-col gap-8">
              {content.certification && (
                <CertificationBadge
                  label={t("about.certificationLabel")}
                  value={stripHtml(content.certification)}
                />
              )}
              <Button
                variant="cta"
                size="lg"
                className="w-fit shadow-elevated"
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

          {/* ─── RIGHT COLUMN: Guides, Approach & Map ───────────── */}
          <div className="flex flex-col gap-16 lg:col-span-7 lg:pt-4">
            {/* Guides */}
            <div className="space-y-8">
              <h3 className="font-serif text-3xl text-charcoal">
                {t("about.guidesTitle")}
              </h3>
              <div className="grid gap-8">
                {GUIDES.map((item, i) => (
                  <GuideEntry key={item.titleKey} item={item} index={i} />
                ))}
              </div>
            </div>

            {/* Approach */}
            <div className="space-y-6 border-t border-warm-grey-200/50 pt-12">
              <h3 className="min-h-[1.2em] text-editorial-md text-charcoal">
                {content.approachTitle}
              </h3>
              <p className="text-pull-quote">
                {stripHtml(content.approachText)}
              </p>
            </div>

            {/* Map */}
            <div className="border-t border-warm-grey-200/50 pt-12">
              <MapCard address={content.address} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
