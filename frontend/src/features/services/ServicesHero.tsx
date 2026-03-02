import { useMemo, type FC } from "react";
import {
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "framer-motion";
import { useTranslation } from "react-i18next";

import { useCMSPage } from "@/hooks/useCMS";
import { useModal } from "@/components/modal";
import { getLocalizedText } from "@/lib/localize";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
import type { ResponsiveImage as ResponsiveImageType } from "@/types/api";

// ── Constants ────────────────────────────────────────────────────────
const FADE_UP_TRANSITION: Transition = {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1],
};

const STAGGER_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const FADE_UP_ITEM: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const LINE_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const LINE_STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

type SupportedLang = "fr" | "en";

// ── Types ────────────────────────────────────────────────────────────
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

// ── Title line definitions per language ──────────────────────────────
// Grouping words into balanced visual lines for each language.
// Falls back to natural wrapping if the CMS title doesn't match.
const TITLE_LINES: Record<SupportedLang, RegExp | null> = {
  fr: /^(\S+)\s+(\S+)\s+(.+)$/,
  en: /^(\S+)\s+(\S+)\s+(.+)$/,
};

function splitTitleIntoLines(
  title: string,
  lang: SupportedLang
): string[] {
  const lower = title.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);

  if (words.length <= 3) {
    return words.map(
      (w) => w.charAt(0).toUpperCase() + w.slice(1)
    );
  }

  // Group into balanced lines: first word alone (italic),
  // then pairs/triples for visual balance
  const lines: string[] = [];
  const capitalize = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1);

  // First word is always alone (italic)
  lines.push(capitalize(words[0]));

  // Distribute remaining words into lines of ~2 words
  const rest = words.slice(1);
  const lineCount = Math.ceil(rest.length / 2);

  for (let i = 0; i < rest.length; ) {
    const wordsPerLine =
      i + 3 <= rest.length && rest.length - i === 3 ? 3 : 2;
    const chunk = rest.slice(i, i + Math.min(wordsPerLine, rest.length - i));
    lines.push(chunk.map((w, idx) => (idx === 0 ? capitalize(w) : w)).join(" "));
    i += chunk.length;
  }

  return lines;
}

// ── Utilities ────────────────────────────────────────────────────────
function resolveLang(language: string): SupportedLang {
  return language.startsWith("fr") ? "fr" : "en";
}

function toSentenceCase(s?: string): string {
  if (!s) return "";
  return s.charAt(0).toLocaleUpperCase() + s.slice(1).toLocaleLowerCase();
}

// ── Hooks ────────────────────────────────────────────────────────────
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
      tagline:
        lang === "fr" ? "Bien-être au travail" : "Corporate Wellness",
    };
  }, [page, lang]);
}

// ── Sub-components ───────────────────────────────────────────────────
const ImageBackground: FC<{
  image: ResponsiveImageType | null | undefined;
}> = ({ image }) => (
  <ResponsiveImage
    image={image}
    alt=""
    priority
    className="absolute inset-0 h-full w-full object-cover object-center"
  />
);

const Overlays: FC = () => (
  <>
    <div
      className="absolute inset-0 bg-sage-900/55"
      aria-hidden="true"
    />
    <div
      className="absolute inset-0 bg-gradient-to-t from-sage-900/90 via-sage-900/20 to-sage-900/30"
      aria-hidden="true"
    />
    <div className="noise-texture-subtle" aria-hidden="true" />
  </>
);

const CircleCTA: FC<{
  label: string;
  onClick: () => void;
  reduceMotion: boolean | null;
}> = ({ label, onClick, reduceMotion }) => (
  <motion.button
    onClick={onClick}
    aria-label={label}
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={
      reduceMotion
        ? { duration: 0 }
        : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }
    }
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
    className="group flex h-28 w-28 items-center justify-center rounded-full bg-[#F7FB7D] text-center shadow-elevated transition-all hover:brightness-105 sm:h-32 sm:w-32 lg:h-36 lg:w-36"
  >
    <span className="text-[11px] font-bold uppercase tracking-wider text-sage-900 sm:text-xs">
      {toSentenceCase(label)}
    </span>
  </motion.button>
);

const EditorialTitle: FC<{
  title: string;
  lang: SupportedLang;
  variants: Variants | undefined;
  lineVariants: Variants | undefined;
}> = ({ title, lang, variants, lineVariants }) => {
  const lines = splitTitleIntoLines(title, lang);

  return (
    <motion.h1
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="flex max-w-3xl flex-col gap-0 leading-[0.92]"
    >
      {lines.map((line, i) => (
        <motion.span
          key={i}
          variants={lineVariants}
          className={`block tracking-tight text-white ${
            i === 0
              ? "font-serif italic font-light text-[clamp(3.5rem,8vw,7.5rem)]"
              : "font-serif font-semibold text-[clamp(2.8rem,6.5vw,6.5rem)]"
          }`}
        >
          {line}
        </motion.span>
      ))}
    </motion.h1>
  );
};

const BottomBar: FC<{
  tagline: string;
  priceLabel: string;
  price: string;
  benefits: string[];
  hasPrice: boolean;
  variants: Variants | undefined;
  itemVariants: Variants | undefined;
}> = ({
  tagline,
  priceLabel,
  price,
  benefits,
  hasPrice,
  variants,
  itemVariants,
}) => (
  <motion.div
    variants={variants}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    className="grid w-full grid-cols-1 items-end gap-8 border-t border-white/15 pt-6 sm:grid-cols-[auto_1fr] lg:grid-cols-[200px_1fr_1fr]"
  >
    {/* Left — tagline + price */}
    <motion.div variants={itemVariants} className="flex flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-widest text-terracotta-300">
        {tagline}
      </span>
      {hasPrice && (
        <div className="flex items-baseline gap-2">
          {priceLabel && (
            <span className="text-xs uppercase tracking-wide text-sand-300/70">
              {priceLabel}
            </span>
          )}
          {price && (
            <span className="font-serif text-2xl tracking-tight text-white">
              {price}
            </span>
          )}
        </div>
      )}
    </motion.div>

    {/* Right — benefits in columns */}
    {benefits.slice(0, 2).map((b, i) => (
      <motion.p
        key={i}
        variants={itemVariants}
        className="max-w-xs text-sm leading-relaxed text-sand-200/80"
      >
        {b}
      </motion.p>
    ))}
  </motion.div>
);

// ── Main component ───────────────────────────────────────────────────
export const ServicesHero: FC = () => {
  const { t, i18n } = useTranslation();
  const { open } = useModal();
  const reduceMotion = useReducedMotion();
  const content = useHeroContent();
  const lang = resolveLang(i18n.language);

  const page = useCMSPage();
  const poster = page?.services_hero_poster_image;

  const stagger = reduceMotion ? undefined : STAGGER_CONTAINER;
  const fadeItem = reduceMotion ? undefined : FADE_UP_ITEM;
  const lineStagger = reduceMotion ? undefined : LINE_STAGGER;
  const lineItem = reduceMotion ? undefined : LINE_VARIANTS;

  if (!content) return null;

  return (
    <section
      id="services-hero"
      aria-label={t("services.hero.label", {
        defaultValue: "Services Overview",
      })}
      className="relative flex min-h-screen items-end overflow-hidden"
    >
      {/* Background image from CMS */}
      <ImageBackground image={poster} />
      <Overlays />

      {/* Floating CTA circle — pulled inward */}
      {content.hasCTA && (
        <div className="absolute right-8 top-1/4 z-20 sm:right-16 lg:right-[12%] lg:top-1/3">
          <CircleCTA
            label={content.cta}
            reduceMotion={reduceMotion}
            onClick={() =>
              open("corporate", { defaultEventType: "corporate" })
            }
          />
        </div>
      )}

      {/* Content layer */}
      <div className="relative z-10 w-full px-6 pb-10 pt-40 sm:px-10 lg:px-16 lg:pb-14 lg:pt-52">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 lg:gap-16">
          {/* Title */}
          <EditorialTitle
            title={content.title}
            lang={lang}
            variants={lineStagger}
            lineVariants={lineItem}
          />

          {/* Third benefit as subtitle under the title */}
          {content.benefits.length > 2 && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { ...FADE_UP_TRANSITION, delay: 0.4 }
              }
              className="-mt-4 max-w-md text-base italic text-sand-200/70"
            >
              {content.benefits[2]}
            </motion.p>
          )}

          {/* Bottom bar */}
          <BottomBar
            tagline={content.tagline}
            priceLabel={content.priceLabel}
            price={content.price}
            benefits={content.benefits}
            hasPrice={content.hasPrice}
            variants={stagger}
            itemVariants={fadeItem}
          />
        </div>
      </div>
    </section>
  );
};
