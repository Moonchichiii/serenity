import { type FC } from "react";
import { motion, type Variants } from "framer-motion";
import { Clock, Euro } from "lucide-react";

import ResponsiveImage from "@/components/ui/ResponsiveImage";
import type { ResponsiveImage as ResponsiveImageType } from "@/types/api";
import { cn } from "@/lib/utils";

// ── Constants ────────────────────────────────────────────────────────
const MOBILE_IMAGE_SIZES = "(max-width: 640px) 90vw";
const DESKTOP_IMAGE_SIZES = "(max-width: 1280px) 33vw, 400px";

export const CARD_ENTRANCE: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      delay: i * 0.15,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

// ── Types ────────────────────────────────────────────────────────────
export interface ResolvedService {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  price: string;
  image: ResponsiveImageType | null;
  isHighlighted: boolean;
}

// ── Internal sub-components ──────────────────────────────────────────

const PriceBadge: FC<{
  price: string;
  highlighted?: boolean;
  className?: string;
}> = ({ price, highlighted, className }) => (
  <div
    className={cn(
      "absolute inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-bold tracking-wide text-charcoal shadow-elevated",
      highlighted &&
        "bg-terracotta-50/95 ring-2 ring-terracotta-300/50",
      className,
    )}
  >
    <Euro className="h-3.5 w-3.5 text-terracotta-500" />
    {price}
  </div>
);

const CardFooter: FC<{
  durationMinutes: number;
  price: string;
  isHighlighted: boolean;
  popularLabel: string;
  showPopular?: boolean;
}> = ({
  durationMinutes,
  price,
  isHighlighted,
  popularLabel,
  showPopular = false,
}) => (
  <div className="mt-auto flex items-center justify-between border-t border-warm-grey-200/60 pt-5 md:border-white/10 md:pt-4">
    <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-warm-grey-400 md:text-white/50">
      <Clock className="h-4 w-4 text-sage-500 md:text-white/40" />
      <span>{durationMinutes} min</span>
    </div>

    {showPopular && isHighlighted ? (
      <span className="badge-warm text-sm px-4 py-1.5">
        {popularLabel}
      </span>
    ) : (
      !showPopular && (
        <span className="font-serif text-base font-semibold text-charcoal md:text-white/80">
          {price} €
        </span>
      )
    )}
  </div>
);

// ── Mobile card ──────────────────────────────────────────────────────
export const MobileServiceCard: FC<{
  service: ResolvedService;
}> = ({ service }) => (
  <article
    className={cn(
      "flex w-[85vw] shrink-0 snap-center flex-col overflow-hidden rounded-2xl bg-card shadow-elevated",
      service.isHighlighted
        ? "border-2 border-terracotta-200 shadow-warm"
        : "border border-warm-grey-200/40",
    )}
  >
    {service.image?.src && (
      <div className="relative h-60 w-full overflow-hidden bg-sage-800">
        <ResponsiveImage
          image={service.image}
          alt={service.image.title || service.title}
          className="h-full w-full object-cover"
          sizes={MOBILE_IMAGE_SIZES}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent"
          aria-hidden="true"
        />
        <PriceBadge
          price={service.price}
          highlighted={service.isHighlighted}
          className="right-4 top-4"
        />
      </div>
    )}

    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h3 className="mb-3 font-serif text-2xl leading-snug text-charcoal">
          {service.title}
        </h3>
        <p className="line-clamp-4 text-sm leading-relaxed text-warm-grey-500">
          {service.description}
        </p>
      </div>

      <CardFooter
        durationMinutes={service.durationMinutes}
        price={service.price}
        isHighlighted={service.isHighlighted}
        popularLabel=""
      />
    </div>
  </article>
);

// ── Desktop card ─────────────────────────────────────────────────────
export const DesktopServiceCard: FC<{
  service: ResolvedService;
  index: number;
  variants: Variants | undefined;
  popularLabel: string;
}> = ({ service, index, variants, popularLabel }) => (
  <motion.article
    variants={variants}
    custom={index}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    whileHover={{
      y: -4,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    }}
    className={cn(
      "service-card group relative flex flex-col overflow-hidden rounded-2xl cursor-pointer",
      "h-[340px] md:h-[380px] lg:h-[460px]",
      service.isHighlighted
        ? "ring-2 ring-honey-300/30"
        : "ring-1 ring-white/[0.08] hover:ring-white/20",
      "transition-all duration-500 ease-out",
    )}
  >
    {/* ── Background image ── */}
    {service.image?.src && (
      <div className="absolute inset-0 overflow-hidden bg-sage-800">
        <ResponsiveImage
          image={service.image}
          alt={service.image.title || service.title}
          className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:brightness-[0.6]"
          sizes={DESKTOP_IMAGE_SIZES}
        />
      </div>
    )}

    {/* ── Default state: dark gradient + title at bottom ── */}
    <div
      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-0"
      aria-hidden="true"
    />

    {/* ── Hover state: warm tinted overlay ── */}
    <div
      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sage-900/90 via-sage-900/70 to-sage-900/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      aria-hidden="true"
    />

    {/* ── Content ── */}
    <div className="relative z-10 mt-auto flex flex-col p-7 lg:p-8">
      {/* Title — always visible */}
      <h3 className="font-serif text-[1.5rem] leading-snug text-white drop-shadow-md lg:text-[1.75rem] transition-transform duration-500 ease-out group-hover:-translate-y-2">
        {service.title}
      </h3>

      {/* Expandable content — appears on hover */}
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <p className="mt-3 text-[13px] font-light leading-relaxed text-white/70 line-clamp-3">
            {service.description}
          </p>

          {/* Meta row: duration + price */}
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
              <Clock className="h-3.5 w-3.5" />
              <span>{service.durationMinutes} min</span>
            </div>
            <span className="text-sm font-semibold text-white/60">
              {service.price} €
            </span>
          </div>

          {/* Popular badge */}
          {service.isHighlighted && (
            <div className="mt-4">
              <span className="inline-flex items-center rounded-full bg-honey-400/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-honey-300 ring-1 ring-honey-400/30">
                {popularLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.article>
);
