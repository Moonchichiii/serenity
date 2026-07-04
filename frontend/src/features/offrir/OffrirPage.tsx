import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { GiftForm } from "@/components/forms/GiftForm";
import { renderAccentTitle } from "@/lib/accentTitle";

/**
 * /offrir — the prototype's OFFRIR nav destination.
 *
 * A dedicated gift-voucher landing page: forest hero copy on the left
 * (same i18n as the home GiftSection), the full GiftForm inline in a
 * cream card on the right. The home section + honey badge keep their
 * instant modal; this route is the linkable, indexable home for gifts.
 */
export function OffrirPage() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const prev = document.title;
    document.title = i18n.language.startsWith("fr")
      ? "Offrir un bon cadeau — La Serenity, Marseille"
      : "Give a gift card — La Serenity, Marseille";
    return () => {
      document.title = prev;
    };
  }, [i18n.language]);

  return (
    <div className="bg-sage-deep">
      <section
        className="mx-auto grid min-h-[100svh] max-w-7xl items-start gap-14 pb-24 pt-36 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-[var(--space-grid-gap)] lg:pt-44"
        style={{
          paddingLeft: "var(--space-container-x)",
          paddingRight: "var(--space-container-x)",
        }}
      >
        {/* ── Copy ── */}
        <div className="lg:sticky lg:top-36">
          <span className="hero-eyebrow text-honey-300 mb-5">
            {t("giftSection.eyebrow")}
          </span>
          <h1
            className="font-heading text-porcelain [&>em]:text-honey-300"
            style={{
              fontSize: "var(--typo-h1)",
              lineHeight: "var(--leading-h1)",
              marginBottom: "var(--space-heading-to-paragraph)",
            }}
          >
            {renderAccentTitle(t("giftSection.title"))}
          </h1>
          <p
            className="max-w-lg font-light text-sage-100/90"
            style={{
              fontSize: "var(--typo-body-lg)",
              lineHeight: "var(--leading-body-lg)",
            }}
          >
            {t("giftSection.lede")}
          </p>

          <dl className="mt-10 max-w-md space-y-4 border-t border-white/10 pt-8">
            {[
              [t("giftSection.from"), t("giftSection.sampleFrom")],
              [t("giftSection.to"), t("giftSection.sampleTo")],
              [t("giftSection.treatment"), t("giftSection.sampleTreatment")],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-6"
              >
                <dt
                  className="uppercase text-sage-200/70"
                  style={{
                    fontSize: "var(--typo-overline)",
                    letterSpacing: "0.16em",
                  }}
                >
                  {label}
                </dt>
                <dd className="font-heading italic text-porcelain">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Form card ── */}
        <div className="rounded-3xl bg-porcelain p-6 shadow-elevated sm:p-8">
          <h2
            className="mb-6 font-heading text-charcoal"
            style={{
              fontSize: "var(--typo-h3)",
              lineHeight: "var(--leading-h3)",
            }}
          >
            {t("gift.title", "Gift Voucher")}
          </h2>
          <GiftForm />
        </div>
      </section>
    </div>
  );
}
