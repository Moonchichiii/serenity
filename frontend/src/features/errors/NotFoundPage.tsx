import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/**
 * 404 — real not-found signalling for the SPA.
 *
 * Cloudflare Pages serves index.html with status 200 for unknown
 * paths, so Google flags them as "Soft 404". A robots noindex meta on
 * this view lets crawlers classify junk URLs correctly.
 */
export function NotFoundPage() {
  const { t } = useTranslation();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    const prev = document.title;
    document.title = "404 — La Serenity";
    return () => {
      document.head.removeChild(meta);
      document.title = prev;
    };
  }, []);

  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-sage-deep px-6 text-center">
      <span className="hero-eyebrow text-honey-300 mb-6">404</span>
      <h1
        className="font-heading text-porcelain"
        style={{
          fontSize: "var(--typo-h2)",
          lineHeight: "var(--leading-h2)",
          marginBottom: "var(--space-heading-to-paragraph)",
        }}
      >
        {t("notFound.title", "Cette page n'existe pas")}
      </h1>
      <p
        className="mb-10 max-w-md font-light text-sage-100/80"
        style={{
          fontSize: "var(--typo-body)",
          lineHeight: "var(--leading-body)",
        }}
      >
        {t(
          "notFound.body",
          "Le lien est peut-être ancien — retrouvez votre équilibre depuis l'accueil.",
        )}
      </p>
      <Link to="/" className="btn-accent">
        {t("notFound.cta", "Retour à l'accueil")}
      </Link>
    </div>
  );
}
