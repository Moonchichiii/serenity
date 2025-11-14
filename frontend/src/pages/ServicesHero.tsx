import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { cmsAPI, type WagtailHomePage } from "@/api/cms";
import { CLOUDINARY_CLOUD_NAME, getResponsivePosterUrl } from "@/utils/cloudinary";
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

  // Compute video src from CMS Cloudinary public ID
  useEffect(() => {
    const publicId = page?.services_hero_video_public_id?.trim();
    if (!publicId) {
      setVideoSrc(null);
      return;
    }

    const buildVideoUrl = () => {
      const width =
        typeof window !== "undefined" ? window.innerWidth || 1920 : 1920;
      const base = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload`;
      if (width <= 640) {
        return `${base}/f_mp4,q_auto:low,w_640,h_360,c_fill/${publicId}.mp4`;
      }
      if (width <= 1024) {
        return `${base}/f_mp4,q_auto:eco,w_1024,h_576,c_fill/${publicId}.mp4`;
      }
      return `${base}/f_mp4,q_auto:eco,w_1920,h_1080,c_fill/${publicId}.mp4`;
    };

    const update = () => setVideoSrc(buildVideoUrl());

    update();

    // Optional: update video on resize (throttled)
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
  }, [page?.services_hero_video_public_id]);

  if (!page) return null;

  const title = getString(`services_hero_title_${lang}` as keyof WagtailHomePage);
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
      className="relative flex items-center overflow-hidden min-h-[85vh] lg:minh-[90vh] py-16 sm:py-20"
      aria-labelledby="services-hero-title"
    >
      {/* Only render video element if we actually have a video src */}
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

      {/* If no video, we still want the poster as a CSS background fallback.
          You could optionally add a div here that uses posterUrl as background-image. */}
      {!videoSrc && (
        <div
          className="absolute inset-0 w-full h-full bg-center bg-cover"
          style={{ backgroundImage: `url(${posterUrl ?? tinyFallbackPoster})` }}
          aria-hidden="true"
        />
      )}

      <div
        className="absolute inset-0 bg-gradient-to-br from-charcoal/50 via-charcoal/40 to-charcoal/50"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl mx-auto lg:mx-0 lg:ml-0"
        >
          <div className="px-6 py-6 sm:px-10 sm:py-8 md:px-12 md:py-10 lg:px-14 lg:py-12 rounded-3xl bg-white/95 backdrop-blur-lg border-2 border-white/40 shadow-elevated text-center lg:text-left">
            <h2
              id="services-hero-title"
              className="font-heading font-normal text-charcoal leading-tight tracking-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            >
              {toSentenceCase(title)}
            </h2>

            {hasPrice && (
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-charcoal/80">
                {priceLabel}{" "}
                <span className="font-bold text-sage-700 whitespace-nowrap">
                  {price}
                </span>
              </p>
            )}

            <ul className="mt-5 sm:mt-6 grid gap-2.5 sm:gap-3">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-full bg-sage-100 border-2 border-sage-400 items-center justify-center">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-700 stroke-[2.5]" />
                  </span>
                  <span className="text-sm sm:text-base text-charcoal/90 leading-relaxed pt-0 font-medium">
                    {b}
                  </span>
                </li>
              ))}
            </ul>

            {hasCTA && (
              <div className="mt-6 sm:mt-8">
                <Button
                  onClick={() =>
                    open("corporate", { defaultEventType: "corporate" })
                  }
                  size="lg"
                  className="w-full sm:w-auto bg-sage-600 hover:bg-sage-700 text-white shadow-lg"
                >
                  {toSentenceCase(cta)}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
