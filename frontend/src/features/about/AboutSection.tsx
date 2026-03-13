import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import {
  motion,
  useReducedMotion,
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
import { useModal } from "@/components/modal/useModal";
import { useCMSPage, useCMSGlobals } from "@/hooks/useCMS";
import { cmsText } from "@/lib/cmsText";
import { cn } from "@/lib/utils";

const SECRET_TRIGGER_TAPS = 3;
const SECRET_TRIGGER_WINDOW_MS = 900;

const FADE_IN_TRANSITION: Transition = {
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1],
};

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

const GuideEntry: FC<{ item: GuideItem }> = ({ item }) => {
  const { t } = useTranslation();
  const Icon = item.icon;

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-warm-grey-200/35 bg-white/20 p-3 sm:p-0 sm:rounded-none sm:border-0 sm:bg-transparent">
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center",
          "rounded-lg border border-warm-grey-200 bg-transparent",
        )}
      >
        <Icon className="h-4 w-4 stroke-[1.5] text-charcoal" />
      </div>

      <div>
        <h4
          className="mb-0.5 font-semibold tracking-wide text-charcoal"
          style={{
            fontSize: "var(--typo-small)",
            lineHeight: "var(--leading-small)",
          }}
        >
          {t(item.titleKey)}
        </h4>
        <p
          className="text-warm-grey-500 sm:text-warm-grey-400"
          style={{
            fontSize: "var(--typo-small)",
            lineHeight: "var(--leading-small)",
          }}
        >
          {t(item.bodyKey)}
        </p>
      </div>
    </div>
  );
};

const CertificationBadge: FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="inline-flex items-center gap-3 border-l-2 border-charcoal py-2 pl-4 pr-5">
    <div>
      <p
        className="font-bold uppercase tracking-widest text-charcoal"
        style={{
          fontSize: "var(--typo-overline)",
          lineHeight: "var(--leading-overline)",
        }}
      >
        {label}
      </p>
      <p
        className="text-warm-grey-400"
        style={{
          fontSize: "var(--typo-caption)",
          lineHeight: "var(--leading-caption)",
        }}
      >
        {value}
      </p>
    </div>
  </div>
);

function useAboutContent(): AboutContent | null {
  const { t, i18n } = useTranslation();
  const cmsData = useCMSPage();
  const globals = useCMSGlobals();
  const lang = resolveLang(i18n.language);

  return useMemo(() => {
    if (!cmsData) return null;

    const pick = <T,>(fr: T, en: T): T =>
      pickLocalized(lang, fr, en);

    const txt = (
      fr: unknown,
      en: unknown,
      fallback: string,
    ): string =>
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
      studioDescription: t("about.studioDescriptionFallback"),
      address:
        globals?.site?.address_full?.trim() ||
        t("footer.addressFull"),
    };
  }, [cmsData, globals, lang, t]);
}

export const About: FC = () => {
  const { t } = useTranslation();
  const { open } = useModal();
  const reduceMotion = useReducedMotion();
  const content = useAboutContent();

  const openContactDefault = () =>
    open("contact", {
      defaultSubject: t("contact.form.subjectDefault"),
    });

  if (!content) return null;

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-tint-cream py-[var(--space-section-y)]"
      aria-labelledby="about-heading"
    >
      <div className="noise-texture-subtle" aria-hidden="true" />
      <div
        className="organic-blob organic-blob-sage absolute -right-60 -top-60 h-[400px] w-[400px] opacity-25"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto max-w-6xl px-[var(--space-container-x)]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={
            reduceMotion ? undefined : FADE_IN_TRANSITION
          }
          className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-[var(--space-grid-gap)]"
        >
          <div className="flex flex-col items-start gap-6 lg:col-span-5 lg:sticky lg:top-32 lg:h-max lg:gap-0">
            <h2
              id="about-heading"
              className="heading-accent mb-[var(--space-heading-to-paragraph)] font-serif font-light text-charcoal"
              style={{
                fontSize: "var(--typo-h2)",
                lineHeight: "var(--leading-h2)",
              }}
            >
              {content.title}
            </h2>

            <div
              className="mb-8 max-w-[34ch] text-warm-grey-600 sm:mb-[var(--space-heading-to-paragraph)]"
              style={{
                fontSize: "var(--typo-body)",
                lineHeight: "1.7",
              }}
            >
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

            <div className="flex w-full flex-col gap-5 sm:gap-6">
              {content.certification && (
                <CertificationBadge
                  label={t("about.certificationLabel")}
                  value={stripHtml(content.certification)}
                />
              )}

              <Button
                variant="cta"
                size="lg"
                className="w-fit border-terracotta-500 bg-terracotta-500 text-white shadow-warm hover:border-terracotta-600 hover:bg-terracotta-600"
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

          <div className="flex flex-col gap-[var(--space-title-to-content)] lg:col-span-7 lg:pt-2">
            <div
              className="space-y-4 border-t border-warm-grey-200/50 rounded-2xl bg-white/20 px-4 py-5 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0"
              style={{
                paddingTop: "var(--space-heading-to-paragraph)",
              }}
            >
              <h3
                className="font-serif font-light text-charcoal"
                style={{
                  fontSize: "var(--typo-h3)",
                  lineHeight: "var(--leading-h3)",
                  minHeight: "1.2em",
                }}
              >
                {content.approachTitle}
              </h3>

              <p
  className="max-w-[30ch] text-warm-grey-600 sm:max-w-none sm:font-serif sm:italic sm:text-warm-grey-500"
  style={{
    fontSize: "var(--typo-body)",
    lineHeight: "1.8",
  }}
>
  {stripHtml(content.approachText)}
</p>
            </div>

            <div className="hidden space-y-6 sm:block">
              <h3
                className="font-serif text-charcoal"
                style={{
                  fontSize: "var(--typo-h4)",
                  lineHeight: "var(--leading-h4)",
                }}
              >
                {t("about.guidesTitle")}
              </h3>

              <div className="grid gap-4 sm:gap-6">
                {GUIDES.map((item) => (
                  <GuideEntry
                    key={item.titleKey}
                    item={item}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
