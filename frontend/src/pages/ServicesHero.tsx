import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { cmsAPI, type WagtailHomePage } from "@/api/cms";
import {
  CLOUDINARY_CLOUD_NAME,
  getResponsivePosterUrl,
} from "@/utils/cloudinary";
import tinyFallbackPoster from "@/assets/poster.webp";
import { Button } from "@/components/ui/Button";
import { useModal } from "@/shared/hooks/useModal";

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

  // Data saver / reduced motion
  const saveData =
    typeof navigator !== "undefined" &&
    // @ts-expect-error connection property not in standard Navigator type
    navigator.connection?.saveData;
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const shouldDisableVideo = !!saveData || !!prefersReducedMotion;

  // Fetch homepage once
  useEffect(() => {
    cmsAPI
      .getHomePage()
      .then(setPage)
      .catch(() => setPage(null));
  }, []);

  // Derive language + strings safely
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const getString = (key: keyof WagtailHomePage) =>
    page && typeof page[key] === "string" ? (page[key] as string) : "";

  // Compute poster URL responsive from Wagtail image
  useEffect(() => {
    const baseUrl = page?.services_hero_poster_image?.url;
    if (!baseUrl) {
      setPosterUrl(tinyFallbackPoster);
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
    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", onResize);
      }
      if (t) window.clearTimeout(t);
    };
  }, [page?.services_hero_poster_image?.url]);

  /**
   * Video source:
   * 1) Prefer direct URL from CMS: services_hero_video_url
   * 2) Fall back to building a Cloudinary URL from services_hero_video_public_id
   */
  useEffect(() => {
    if (shouldDisableVideo) {
      setVideoSrc(null);
      return;
    }

    const directUrl = page?.services_hero_video_url?.trim();
    const publicId = page?.services_hero_video_public_id?.trim();

    // 1) Direct URL set in CMS (e.g. Cloudinary or other host)
    if (directUrl) {
      setVideoSrc(directUrl);
      return;
    }

    // 2) Legacy public ID logic
    if (!publicId) {
      setVideoSrc(null);
      return;
    }

    const buildVideoUrl = () => {
      const width =
        typeof window !== "undefined" ? window.innerWidth || 1920 : 1920;
      const base = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload`;

      // Safety: remove existing .mp4 extension if present to avoid .mp4.mp4
      const cleanId = publicId.replace(/\.mp4$/i, "");

      if (width <= 640) {
        return `${base}/f_mp4,q_auto:low,w_640,h_360,c_fill/${cleanId}.mp4`;
      }
      if (width <= 1024) {
        return `${base}/f_mp4,q_auto:eco,w_1024,h_576,c_fill/${cleanId}.mp4`;
      }
      return `${base}/f_mp4,q_auto:eco,w_1920,h_1080,c_fill/${cleanId}.mp4`;
    };

    const update = () => setVideoSrc(buildVideoUrl());

    update();

    let t: number | undefined;
    const onResize = () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(update, 200);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", onResize);
      }
      if (t) window.clearTimeout(t);
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
  const cta = getString(
    `services_hero_cta_${lang}` as keyof WagtailHomePage
  );
  const benefits = [
    getString(
      `services_hero_benefit_1_${lang}` as keyof WagtailHomePage
    ),
    getString(
      `services_hero_benefit_2_${lang}` as keyof WagtailHomePage
    ),
    getString(
      `services_hero_benefit_3_${lang}` as keyof WagtailHomePage
    ),
  ].filter(Boolean);

  const hasPrice = Boolean(priceLabel || price);
  const hasCTA = Boolean(cta);

  return (
    <section
      id="services-hero"
      className="relative flex items-center overflow-hidden min-h-[85vh] lg:min-h-[90vh] py-16 sm:py-20"
      aria-labelledby="services-hero-title"
    >
      {/* Video / poster background */}
      {videoSrc && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover object-center"
          poster={posterUrl ?? tinyFallbackPoster}
          autoPlay={!shouldDisableVideo}
          muted
          playsInline
          loop={!shouldDisableVideo}
          preload="metadata"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {!videoSrc && (
        <img
          src={posterUrl ?? tinyFallbackPoster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
      )}

      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-charcoal/55 via-charcoal/45 to-charcoal/60"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-5xl mx-auto"
        >
          <div className="rounded-3xl bg-white/95 backdrop-blur-lg border border-white/50 shadow-elevated px-6 py-7 sm:px-10 sm:py-9 md:px-12 md:py-11 lg:px-14 lg:py-12">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 sm:gap-8 lg:gap-12">
              {/* Left block: title + price + CTA */}
              <div className="flex-1 space-y-4 sm:space-y-5 text-center lg:text-left">
                <h2
                  id="services-hero-title"
                  className="font-heading font-normal text-charcoal leading-tight tracking-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                >
                  {toSentenceCase(title)}
                </h2>

                {hasPrice && (
                  <div className="flex justify-center lg:justify-start">
                    <div className="inline-flex items-baseline gap-2 rounded-2xl bg-porcelain px-5 py-3 border border-sage-200/70 shadow-soft">
                      {priceLabel && (
                        <span className="text-sm sm:text-base font-semibold text-charcoal/75">
                          {priceLabel}
                        </span>
                      )}
                      {price && (
                        <span className="text-xl sm:text-2xl font-bold text-sage-700 whitespace-nowrap">
                          {price}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {hasCTA && (
                  <div className="pt-1">
                    <Button
                      variant="default"
                      size="md"
                      className="w-full sm:w-auto rounded-full shadow-elevated px-7 sm:px-8 text-sm sm:text-base"
                      onClick={() =>
                        open("corporate", { defaultEventType: "corporate" })
                      }
                    >
                      {toSentenceCase(cta)}
                    </Button>
                  </div>
                )}
              </div>

              {/* Right block: benefits list */}
              {benefits.length > 0 && (
                <div className="flex-1">
                  <ul className="grid gap-3 sm:gap-3.5">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex w-7 h-7 shrink-0 rounded-full bg-sage-100 border-2 border-sage-400 items-center justify-center">
                          <Check className="w-4 h-4 text-sage-700 stroke-[2.5]" />
                        </span>
                        <span className="text-sm sm:text-base text-charcoal/90 leading-relaxed font-medium">
                          {b}
                        </span>
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
