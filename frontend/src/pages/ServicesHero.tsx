import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, useMemo } from "react";
import { cmsAPI, type WagtailHomePage } from "@/api/cms";
import {
  getResponsivePosterUrl,
  getOptimizedVideoUrl,
} from "@/utils/cloudinary";
import { Button } from "@/components/ui/Button";
import { useModal } from "@/shared/hooks/useModal";

const FALLBACK_POSTER =
  "https://res.cloudinary.com/dbzlaawqt/image/upload/v1762274193/poster_zbbwz5.webp";

const toSentenceCase = (s?: string) => {
  if (!s) return "";
  const first = s.charAt(0).toLocaleUpperCase();
  const rest = s.slice(1).toLocaleLowerCase();
  return first + rest;
};

export function ServicesHero() {
  const { i18n } = useTranslation();
  const [page, setPage] = useState<WagtailHomePage | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | undefined>(undefined);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { open } = useModal();

  // FIX CSP ERROR: Generate a Blob URL for the captions
  const captionsUrl = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const blob = new Blob(["WEBVTT\n\n"], { type: "text/vtt" });
    return URL.createObjectURL(blob);
  }, []);

  useEffect(() => {
    return () => {
      if (captionsUrl) URL.revokeObjectURL(captionsUrl);
    };
  }, [captionsUrl]);

  const saveData =
    typeof navigator !== "undefined" &&
    // @ts-expect-error connection property not in standard Navigator type
    navigator.connection?.saveData;
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const shouldDisableVideo = !!saveData || !!prefersReducedMotion;

  useEffect(() => {
    cmsAPI
      .getHomePage()
      .then(setPage)
      .catch(() => setPage(null));
  }, []);

  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const getString = (key: keyof WagtailHomePage) =>
    page && typeof page[key] === "string" ? (page[key] as string) : "";

  useEffect(() => {
    const baseUrl = page?.services_hero_poster_image?.url;
    if (!baseUrl) {
      setPosterUrl(FALLBACK_POSTER);
      return;
    }
    const compute = () => {
      const w =
        typeof window !== "undefined"
          ? Math.max(window.innerWidth || 0, 360)
          : 768;
      setPosterUrl(
        getResponsivePosterUrl(baseUrl, w, {
          quality: "eco",
          min: 480,
          max: 1440,
        })
      );
    };
    compute();
    let t: number | undefined;
    const onResize = () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(compute, 150);
    };
    if (typeof window !== "undefined")
      window.addEventListener("resize", onResize);
    return () => {
      if (typeof window !== "undefined")
        window.removeEventListener("resize", onResize);
    };
  }, [page?.services_hero_poster_image?.url]);

  useEffect(() => {
    if (shouldDisableVideo) {
      setVideoSrc(null);
      return;
    }
    const directUrl = page?.services_hero_video_url?.trim();
    const publicId = page?.services_hero_video_public_id?.trim();

    if (directUrl) {
      setVideoSrc(directUrl);
      return;
    }
    if (!publicId) {
      setVideoSrc(null);
      return;
    }

    const buildVideoUrl = () => {
      const width =
        typeof window !== "undefined" ? window.innerWidth || 1920 : 1920;
      if (width <= 640) return getOptimizedVideoUrl(publicId, 640, "eco");
      if (width <= 1024) return getOptimizedVideoUrl(publicId, 1024, "eco");
      return getOptimizedVideoUrl(publicId, 1920, "eco");
    };

    const update = () => setVideoSrc(buildVideoUrl());
    update();
    let t: number | undefined;
    const onResize = () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(update, 200);
    };
    if (typeof window !== "undefined")
      window.addEventListener("resize", onResize);
    return () => {
      if (typeof window !== "undefined")
        window.removeEventListener("resize", onResize);
    };
  }, [
    page?.services_hero_video_url,
    page?.services_hero_video_public_id,
    shouldDisableVideo,
  ]);

  if (!page) return null;

  const title = getString(
    `services_hero_title_${lang}` as keyof WagtailHomePage
  );
  const priceLabel = getString(
    `services_hero_pricing_label_${lang}` as keyof WagtailHomePage
  );
  const price = getString(
    `services_hero_price_${lang}` as keyof WagtailHomePage
  );
  const cta = getString(`services_hero_cta_${lang}` as keyof WagtailHomePage);
  const benefits = [
    getString(`services_hero_benefit_1_${lang}` as keyof WagtailHomePage),
    getString(`services_hero_benefit_2_${lang}` as keyof WagtailHomePage),
    getString(`services_hero_benefit_3_${lang}` as keyof WagtailHomePage),
  ].filter(Boolean);

  const hasPrice = Boolean(priceLabel || price);
  const hasCTA = Boolean(cta);

  return (
    <section
      id="services-hero"
      className="relative flex items-center justify-center overflow-hidden min-h-[85vh] lg:min-h-[85vh] py-12"
      aria-labelledby="services-hero-title"
    >
      {/* --- Background Media --- */}
      {videoSrc && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover object-center"
          poster={posterUrl ?? FALLBACK_POSTER}
          autoPlay={!shouldDisableVideo}
          muted
          playsInline
          loop={!shouldDisableVideo}
          preload="metadata"
        >
          <source src={videoSrc} type="video/mp4" />
          {captionsUrl && (
            <track
              kind="captions"
              src={captionsUrl}
              srcLang="en"
              label="No captions"
              default
            />
          )}
        </video>
      )}

      {!videoSrc && (
        <img
          src={posterUrl ?? FALLBACK_POSTER}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
      )}

      {/* --- Modern Overlay (Softer gradient for cleaner look) --- */}
      <div
        className="absolute inset-0 bg-charcoal/40"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/20"
        aria-hidden="true"
      />

      {/* --- Content Card --- */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-5xl mx-auto"
        >
          <div className="rounded-[2rem] bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl p-6 sm:p-10 lg:p-12 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

              {/* Left Column: Heading, Price, CTA */}
              <div className="flex flex-col gap-6 text-center lg:text-left">
                {/* Intro Tag (Optional visual flair) */}
                <span className="hidden lg:block text-xs font-bold tracking-widest text-sage-600 uppercase mb-[-1rem]">
                  {toSentenceCase(
                    lang === "fr" ? "Offre Entreprise" : "Corporate Offer"
                  )}
                </span>

                <h2
                  id="services-hero-title"
                  className="font-heading font-medium text-charcoal leading-[1.1] tracking-tight text-3xl sm:text-4xl md:text-5xl"
                >
                  {toSentenceCase(title)}
                </h2>

                {hasPrice && (
                  <div className="flex justify-center lg:justify-start">
                    <div className="inline-flex items-center gap-2.5 rounded-full bg-sage-50/80 px-5 py-2.5 border border-sage-100">
                      {priceLabel && (
                        <span className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">
                          {priceLabel}
                        </span>
                      )}
                      {price && (
                        <span className="text-xl sm:text-2xl font-bold text-sage-800 tabular-nums">
                          {price}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {hasCTA && (
                  <div className="pt-2">
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full sm:w-auto rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 px-10 text-base font-semibold"
                      onClick={() =>
                        open("corporate", { defaultEventType: "corporate" })
                      }
                    >
                      {toSentenceCase(cta)}
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column: Benefits List */}
              {benefits.length > 0 && (
                <div className="relative">
                  {/* Decorative Divider for Desktop */}
                  <div className="absolute hidden lg:block left-[-1.5rem] top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-sage-200 to-transparent" />

                  <ul className="space-y-4 sm:space-y-5">
                    {benefits.map((b, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                        className="flex items-start gap-4 group"
                      >
                        <span className="mt-0.5 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-sage-100 group-hover:bg-sage-200 transition-colors">
                          <Check className="w-3.5 h-3.5 text-sage-700 stroke-[3]" />
                        </span>
                        <span className="text-base sm:text-lg text-charcoal/80 leading-snug font-medium group-hover:text-charcoal transition-colors">
                          {b}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
