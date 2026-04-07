import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";

import { useCMSPage } from "@/hooks/useCMS";
import { useModal } from "@/components/modal";
import { getLocalizedText } from "@/lib/localize";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
import type { ResponsiveImage as ResponsiveImageType } from "@/types/api";

type SupportedLang = "fr" | "en";

interface HeroContent {
  title: string;
  priceLabel: string;
  price: string;
  cta: string;
  benefits: string[];
  hasPrice: boolean;
  hasCTA: boolean;
  tagline: string;
}

function splitTitleIntoLines(title: string, _lang: SupportedLang): string[] {
  const lower = title.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);

  if (words.length <= 3) {
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  }

  const lines: string[] = [];
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const firstWord = words[0];
  if (!firstWord) return [];
  lines.push(capitalize(firstWord));

  const rest = words.slice(1);

  for (let i = 0; i < rest.length; ) {
    const wordsPerLine = i + 3 <= rest.length && rest.length - i === 3 ? 3 : 2;
    const chunk = rest.slice(i, i + Math.min(wordsPerLine, rest.length - i));
    lines.push(
      chunk.map((w, idx) => (idx === 0 ? capitalize(w) : w)).join(" "),
    );
    i += chunk.length;
  }

  return lines;
}

function resolveLang(language: string): SupportedLang {
  return language.startsWith("fr") ? "fr" : "en";
}

function toSentenceCase(s?: string): string {
  if (!s) return "";
  return s.charAt(0).toLocaleUpperCase() + s.slice(1).toLocaleLowerCase();
}

function useHeroContent(): HeroContent | null {
  const { i18n } = useTranslation();
  const page = useCMSPage();
  const lang = resolveLang(i18n.language);

  return useMemo(() => {
    if (!page) return null;

    const loc = (field: string) => getLocalizedText(page, field, lang);

    const priceLabel = loc("services_hero_pricing_label");
    const price = loc("services_hero_price");
    const cta = loc("services_hero_cta");

    const benefits = [
      loc("services_hero_benefit_1"),
      loc("services_hero_benefit_2"),
      loc("services_hero_benefit_3"),
    ].filter((b) => b.trim().length > 0);

    return {
      title: loc("services_hero_title"),
      priceLabel,
      price,
      cta,
      benefits,
      hasPrice: Boolean(priceLabel || price),
      hasCTA: Boolean(cta),
      tagline: lang === "fr" ? "Bien-être au travail" : "Corporate Wellness",
    };
  }, [page, lang]);
}

const ImageBackground: FC<{
  image: ResponsiveImageType | null | undefined;
}> = ({ image }) =>
  image?.src ? (
    <ResponsiveImage
      image={image}
      alt=""
      priority={true}
      className="absolute inset-0 h-full w-full object-cover object-center"
      sizes="100vw"
      optimizeWidth={1280}
    />
  ) : (
    <div className="absolute inset-0 bg-sage-deep" aria-hidden="true" />
  );

const Overlays: FC = () => (
  <>
    <div className="absolute inset-0 bg-sage-deep/70" aria-hidden="true" />
    <div
      className="absolute inset-0 bg-gradient-to-t from-sage-deep/90 via-sage-deep/20 to-sage-deep/30"
      aria-hidden="true"
    />
    <div className="noise-texture-subtle" aria-hidden="true" />
  </>
);

const CircleCTA: FC<{
  label: string;
  onClick: () => void;
}> = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="group relative flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-full bg-[#F7FB7D] text-center shadow-elevated transition-transform duration-200 ease-out hover:scale-105 hover:brightness-105 active:scale-95 sm:h-32 sm:w-32 lg:h-36 lg:w-36"
  >
    {/* Rotating orbit rings */}
    <span className="cta-orbit-ring" aria-hidden="true" />
    <span
      className="cta-orbit-ring cta-orbit-ring--outer"
      aria-hidden="true"
    />

    <span
      className="relative z-10 px-2 font-bold uppercase tracking-wider text-sage-deep"
      style={{
        fontSize: "var(--typo-overline)",
        lineHeight: "var(--leading-overline)",
      }}
    >
      {toSentenceCase(label)}
    </span>
    <svg
      className="relative z-10 h-4 w-4 text-sage-deep transition-transform duration-300 ease-out group-hover:translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  </button>
);

const EditorialTitle: FC<{
  title: string;
  lang: SupportedLang;
}> = ({ title, lang }) => {
  const lines = splitTitleIntoLines(title, lang);

  return (
    <h1
      className="flex max-w-3xl flex-col gap-0"
      style={{ lineHeight: "var(--leading-services-display)" }}
    >
      {lines.map((line, i) => (
        <span
          key={`${line}-${i}`}
          className={`block tracking-tight text-white ${
            i === 0
              ? "font-serif font-light italic"
              : "font-serif font-semibold"
          }`}
          style={{
            fontSize:
              i === 0
                ? "var(--typo-services-display)"
                : "var(--typo-services-display-sub)",
          }}
        >
          {line}
        </span>
      ))}
    </h1>
  );
};

const BottomBar: FC<{
  tagline: string;
  priceLabel: string;
  price: string;
  benefits: string[];
  hasPrice: boolean;
}> = ({ tagline, priceLabel, price, benefits, hasPrice }) => (
  <div className="grid w-full grid-cols-1 items-end gap-[var(--space-card-gap)] border-t border-white/15 pt-6 sm:grid-cols-[auto_1fr] lg:grid-cols-[200px_1fr_1fr]">
    <div className="flex flex-col gap-1">
      <span
        className="text-terracotta-300 font-bold uppercase tracking-widest"
        style={{
          fontSize: "var(--typo-overline)",
          lineHeight: "var(--leading-overline)",
        }}
      >
        {tagline}
      </span>

      {hasPrice && (
        <div className="flex items-baseline gap-2">
          {priceLabel && (
            <span
              className="uppercase tracking-wide text-sand-300/90"
              style={{
                fontSize: "var(--typo-overline)",
                lineHeight: "var(--leading-overline)",
              }}
            >
              {priceLabel}
            </span>
          )}
          {price && (
            <span
              className="font-serif tracking-tight text-white"
              style={{
                fontSize: "var(--typo-h3)",
                lineHeight: "var(--leading-h3)",
              }}
            >
              {price}
            </span>
          )}
        </div>
      )}
    </div>

    {benefits.slice(0, 2).map((b, i) => (
      <p
        key={`${b}-${i}`}
        className="max-w-xs text-sand-200/80"
        style={{
          fontSize: "var(--typo-body)",
          lineHeight: "var(--leading-body)",
        }}
      >
        {b}
      </p>
    ))}
  </div>
);

export const ServicesHero: FC = () => {
  const { t, i18n } = useTranslation();
  const { open } = useModal();
  const content = useHeroContent();
  const lang = resolveLang(i18n.language);

  const page = useCMSPage();
  const poster = page?.services_hero_poster_image;

  if (!content) return null;

  return (
    <section
      id="services-hero"
      aria-label={t("services.hero.label", {
        defaultValue: "Services Overview",
      })}
      className="relative flex min-h-screen items-end overflow-hidden"
    >
      <ImageBackground image={poster} />
      <Overlays />

      {content.hasCTA && (
        <div className="absolute right-8 top-1/4 z-20 sm:right-16 lg:right-[12%] lg:top-1/3">
          <CircleCTA
            label={content.cta}
            onClick={() =>
              open("corporate", {
                defaultEventType: "corporate",
              })
            }
          />
        </div>
      )}

      <div className="relative z-10 w-full px-[var(--space-container-x)] pb-10 pt-40 lg:pb-14 lg:pt-52">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-[var(--space-grid-gap)]">
          <EditorialTitle title={content.title} lang={lang} />

          {content.benefits.length > 2 && (
            <p
              className="-mt-4 max-w-md italic text-sand-200/90"
              style={{
                fontSize: "var(--typo-pull-quote)",
                lineHeight: "var(--leading-pull-quote)",
              }}
            >
              {content.benefits[2]}
            </p>
          )}

          <BottomBar
            tagline={content.tagline}
            priceLabel={content.priceLabel}
            price={content.price}
            benefits={content.benefits}
            hasPrice={content.hasPrice}
          />
        </div>
      </div>
    </section>
  );
};
