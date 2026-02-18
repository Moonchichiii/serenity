import { useMemo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ Hooks & Types
import { useHomePage } from "@/hooks/useCMS";
import { useModal } from "@/shared/hooks/useModal";
import { getLocalizedText } from "@/api/cms";

// Utils & Components
import { getResponsivePosterUrl, getOptimizedVideoUrl } from "@/utils/cloudinary";
import { Button } from "@/components/ui/Button";

// Assets
const FALLBACK_POSTER =
  "https://res.cloudinary.com/dbzlaawqt/image/upload/v1762274193/poster_zbbwz5.webp";

const toSentenceCase = (s?: string) => {
  if (!s) return "";
  const first = s.charAt(0).toLocaleUpperCase();
  const rest = s.slice(1).toLocaleLowerCase();
  return first + rest;
};

// Define connection type locally to satisfy TS/ESLint
type NetworkInformation = {
  saveData?: boolean;
};

export function ServicesHero() {
  const { t, i18n } = useTranslation();
  const { open } = useModal();

  // React Query Hook
  const { data: page } = useHomePage();

  const [posterUrl, setPosterUrl] = useState<string | undefined>(undefined);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
  // ✅ FIXED: Safe access to non-standard 'connection' property
  const saveData = typeof navigator !== "undefined" &&
    (navigator as unknown as { connection?: NetworkInformation }).connection?.saveData;

  const prefersReducedMotion = typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const shouldDisableVideo = !!saveData || !!prefersReducedMotion;

  const lang = i18n.language.startsWith("fr") ? "fr" : "en";

  // --- Logic: Image & Video Optimization ---
  useEffect(() => {
    const baseUrl = page?.services_hero_poster_image?.url;
    if (!baseUrl) {
      setPosterUrl(FALLBACK_POSTER);
      return;
    }
    const compute = () => {
      const w = typeof window !== "undefined" ? Math.max(window.innerWidth || 0, 360) : 768;
      setPosterUrl(
        getResponsivePosterUrl(baseUrl, w, { quality: "eco", min: 480, max: 1440 })
      );
    };
    compute();
    const onResize = () => compute();
    if (typeof window !== "undefined") window.addEventListener("resize", onResize);
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("resize", onResize);
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
      const width = typeof window !== "undefined" ? window.innerWidth || 1920 : 1920;
      if (width <= 640) return getOptimizedVideoUrl(publicId, 640, "eco");
      if (width <= 1024) return getOptimizedVideoUrl(publicId, 1024, "eco");
      return getOptimizedVideoUrl(publicId, 1920, "eco");
    };

    const update = () => setVideoSrc(buildVideoUrl());
    update();
    const onResize = () => update();
    if (typeof window !== "undefined") window.addEventListener("resize", onResize);
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("resize", onResize);
    };
  }, [page?.services_hero_video_url, page?.services_hero_video_public_id, shouldDisableVideo]);

  if (!page) return null;

  // --- Content Extraction ---
  const title = getLocalizedText(page, 'services_hero_title', lang);
  const priceLabel = getLocalizedText(page, 'services_hero_pricing_label', lang);
  const price = getLocalizedText(page, 'services_hero_price', lang);
  const cta = getLocalizedText(page, 'services_hero_cta', lang);

  const benefits = [
    getLocalizedText(page, 'services_hero_benefit_1', lang),
    getLocalizedText(page, 'services_hero_benefit_2', lang),
    getLocalizedText(page, 'services_hero_benefit_3', lang),
  ].filter(b => b.trim().length > 0);

  const hasPrice = Boolean(priceLabel || price);
  const hasCTA = Boolean(cta);

  return (
    <section
      id="services-hero"
      aria-label={t('services.hero.label', { defaultValue: 'Services Overview' })}
      className="relative flex items-center justify-center overflow-hidden min-h-[85vh] lg:min-h-[85vh] py-12"
    >
      {/* 1. BACKGROUND */}
      {videoSrc ? (
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
          {captionsUrl && <track kind="captions" src={captionsUrl} default />}
        </video>
      ) : (
        <img
          src={posterUrl ?? FALLBACK_POSTER}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      )}

      {/* 2. OVERLAY */}
      <div className="absolute inset-0 bg-stone-900/40 backdrop-contrast-[.90]" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />

      {/* 3. CONTENT */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <span className="hidden lg:block text-xs font-bold tracking-[0.2em] text-sage-200 uppercase mb-[-0.5rem] drop-shadow-md">
                {lang === "fr" ? "Bien-être au travail" : "Corporate Wellness"}
              </span>

              <h2 className="font-serif font-medium text-white leading-[1.15] text-4xl sm:text-5xl md:text-6xl drop-shadow-lg">
                {toSentenceCase(title)}
              </h2>

              {hasPrice && (
                <div className="flex justify-center lg:justify-start">
                  <div className="inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md px-6 py-2 border border-white/20 shadow-lg">
                    {priceLabel && (
                      <span className="text-xs sm:text-sm font-bold text-stone-200 uppercase tracking-wide">
                        {priceLabel}
                      </span>
                    )}
                    {price && (
                      <span className="text-xl sm:text-2xl font-serif text-white tracking-tight">
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
                    aria-label={cta || "Contact Corporate"}
                    className="w-full sm:w-auto h-14 rounded-full shadow-lg hover:shadow-white/20 border border-white/10 transition-all px-10 text-base font-semibold tracking-wide"
                    onClick={() => open("corporate", { defaultEventType: "corporate" })}
                  >
                    {toSentenceCase(cta)}
                  </Button>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            {benefits.length > 0 && (
              <div className="relative pl-0 lg:pl-10">
                <div className="absolute hidden lg:block left-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
                <ul className="space-y-6">
                  {benefits.map((b, i) => (
                    <li key={i}>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                        className="flex items-start gap-4 group"
                      >
                        <div className="mt-1 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white group-hover:bg-white/20 transition-colors">
                          <Check className="w-5 h-5" />
                        </div>
                        <span className="text-lg sm:text-xl text-stone-100 leading-snug font-medium drop-shadow-md">
                          {b}
                        </span>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
