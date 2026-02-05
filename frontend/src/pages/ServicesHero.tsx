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

// --- Assets ---
// Fallback if CMS image fails
const FALLBACK_POSTER =
  "https://res.cloudinary.com/dbzlaawqt/image/upload/v1762274193/poster_zbbwz5.webp";

// --- Utils ---
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

  // --- Logic: CSP / Captions ---
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

  // --- Logic: Performance / Data Saver ---
  const saveData =
    typeof navigator !== "undefined" &&
    // @ts-expect-error connection property not in standard Navigator type
    navigator.connection?.saveData;
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const shouldDisableVideo = !!saveData || !!prefersReducedMotion;

  // --- Fetch Data ---
  useEffect(() => {
    cmsAPI.getHomePage().then(setPage).catch(() => setPage(null));
  }, []);

  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const getString = (key: keyof WagtailHomePage) =>
    page && typeof page[key] === "string" ? (page[key] as string) : "";

  // --- Logic: Image & Video Optimization ---
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
    const onResize = () => compute();
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
    const onResize = () => update();
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

  // --- Content Extraction ---
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
      {/* 1. BACKGROUND VIDEO/IMAGE */}
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

      {/* 2. OVERLAY: Subtle Darkening for Contrast */}
      <div
        className="absolute inset-0 bg-stone-900/20 backdrop-contrast-[.95]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/10 to-transparent"
        aria-hidden="true"
      />

      {/* 3. THE CONTENT CARD */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-5xl mx-auto"
        >
          {/* Card Container */}
          <div className="rounded-[2.5rem] bg-white/90 backdrop-blur-2xl border border-white/60 shadow-2xl p-8 sm:p-12 lg:p-14 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

              {/* --- LEFT COLUMN: Pitch --- */}
              <div className="flex flex-col gap-6 text-center lg:text-left">
                {/* Eyebrow */}
                <span className="hidden lg:block text-xs font-bold tracking-[0.2em] text-sage-600 uppercase mb-[-0.5rem] opacity-90">
                  {lang === "fr" ? "Bien-être au travail" : "Corporate Wellness"}
                </span>

                {/* Title */}
                <h2
                  id="services-hero-title"
                  className="font-serif font-medium text-stone-900 leading-[1.1] text-3xl sm:text-4xl md:text-5xl"
                >
                  {toSentenceCase(title)}
                </h2>

                {/* Price Pill */}
                {hasPrice && (
                  <div className="flex justify-center lg:justify-start">
                    <div className="inline-flex items-center gap-3 rounded-full bg-stone-50 px-5 py-2.5 border border-stone-200/60 shadow-inner">
                      {priceLabel && (
                        <span className="text-xs sm:text-sm font-bold text-stone-400 uppercase tracking-wide">
                          {priceLabel}
                        </span>
                      )}
                      {price && (
                        <span className="text-xl sm:text-2xl font-serif text-stone-800 tracking-tight">
                          {price}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                {hasCTA && (
                  <div className="pt-2">
                    <Button
                      variant="default" // Keeps your Sage Green consistency
                      size="lg"
                      // Overrides to make it pill-shaped (rounded-full) + elevated shadow
                      className="w-full sm:w-auto min-h-[56px] rounded-full shadow-warm hover:shadow-elevated transition-all px-10 text-base font-medium"
                      onClick={() =>
                        open("corporate", { defaultEventType: "corporate" })
                      }
                    >
                      {toSentenceCase(cta)}
                    </Button>
                  </div>
                )}
              </div>

              {/* --- RIGHT COLUMN: Benefits --- */}
              {benefits.length > 0 && (
                <div className="relative pl-0 lg:pl-6">
                  {/* Vertical Divider (Desktop Only) */}
                  <div className="absolute hidden lg:block left-0 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-stone-300/50 to-transparent" />

                  <ul className="space-y-6">
                    {benefits.map((b, i) => (
                      <li key={i}>
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                          className="flex items-start gap-4 group"
                        >
                          {/* Check Icon */}
                          <div className="mt-1 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-sage-50 text-sage-600">
                            <Check className="w-4 h-4" />
                          </div>
                          {/* Text */}
                          <span className="text-base sm:text-lg text-stone-600 leading-snug font-medium group-hover:text-stone-900 transition-colors">
                            {b}
                          </span>
                        </motion.div>
                      </li>
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
