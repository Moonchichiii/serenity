import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

import { useModal } from "@/components/modal/useModal";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { renderAccentTitle } from "@/lib/accentTitle";

/**
 * GiftSection — "Offrir un moment de calme" (Prototype V2, section 05).
 *
 * Forest canvas with the tilted cream voucher card from the prototype,
 * carrying our real copy (i18n FR/EN) and opening the existing gift
 * modal — the section is a doorway into the flow that already works.
 * Honey accents only (dark-canvas rule); CTA is terracotta (action).
 * Entrance via the shared useGsapReveal (whenVisible, below the fold).
 */
export function GiftSection() {
  const { t } = useTranslation();
  const { open } = useModal();
  const revealRef = useRef<HTMLElement | null>(null);
  useGsapReveal(revealRef, { whenVisible: true, stagger: 0.12 });

  const rows = [
    { label: t("giftSection.from"), value: t("giftSection.sampleFrom") },
    { label: t("giftSection.to"), value: t("giftSection.sampleTo") },
    {
      label: t("giftSection.treatment"),
      value: t("giftSection.sampleTreatment"),
    },
  ];

  return (
    <section
      ref={revealRef}
      id="gift"
      className="relative overflow-hidden bg-sage-deep"
      style={{
        paddingTop: "var(--space-section-y)",
        paddingBottom: "var(--space-section-y)",
      }}
    >
      <div
        className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-[var(--space-grid-gap)]"
        style={{
          paddingLeft: "var(--space-container-x)",
          paddingRight: "var(--space-container-x)",
        }}
      >
        {/* ── Copy ── */}
        <div data-reveal>
          <span className="hero-eyebrow text-honey-300 mb-5">
            {t("giftSection.eyebrow")}
          </span>
          <h2
            className="font-heading text-porcelain [&>em]:text-honey-300"
            style={{
              fontSize: "var(--typo-h1)",
              lineHeight: "var(--leading-h1)",
              marginBottom: "var(--space-heading-to-paragraph)",
            }}
          >
            {renderAccentTitle(t("giftSection.title"))}
          </h2>
          <p
            className="max-w-lg font-light text-sage-100/90"
            style={{
              fontSize: "var(--typo-body-lg)",
              lineHeight: "var(--leading-body-lg)",
            }}
          >
            {t("giftSection.lede")}
          </p>
        </div>

        {/* ── Tilted voucher card ── */}
        <div data-reveal className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md rotate-2 rounded-3xl bg-cream p-8 shadow-elevated transition-transform duration-500 ease-out hover:rotate-0 motion-reduce:transition-none sm:p-10">
            <div className="mb-6 flex items-start justify-between gap-4">
              <h3
                className="font-heading italic text-charcoal"
                style={{
                  fontSize: "var(--typo-h3)",
                  lineHeight: "var(--leading-h3)",
                }}
              >
                {t("giftSection.cardTitle")}
              </h3>
              <span
                className="mt-1 shrink-0 uppercase text-terracotta-500"
                style={{
                  fontSize: "var(--typo-overline)",
                  letterSpacing: "0.18em",
                }}
              >
                {t("giftSection.cardTag")}
              </span>
            </div>

            <dl className="mb-8">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-6 border-b border-dashed border-warm-grey-200 py-3"
                >
                  <dt
                    className="uppercase text-charcoal/50"
                    style={{
                      fontSize: "var(--typo-overline)",
                      letterSpacing: "0.16em",
                    }}
                  >
                    {row.label}
                  </dt>
                  <dd
                    className="text-right font-heading italic text-charcoal"
                    style={{
                      fontSize: "var(--typo-body)",
                      lineHeight: "var(--leading-body)",
                    }}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={() => open("gift")}
              className="btn-accent flex w-full items-center justify-center gap-2"
              aria-haspopup="dialog"
            >
              {t("giftSection.cta")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <p
              className="mt-4 text-center text-charcoal/50"
              style={{
                fontSize: "var(--typo-caption)",
                lineHeight: "var(--leading-caption)",
              }}
            >
              {t("giftSection.secure")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
