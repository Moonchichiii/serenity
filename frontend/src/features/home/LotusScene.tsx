import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useModal } from "@/components/modal/useModal";
import { useCMSServices } from "@/hooks/useCMS";
import { loadGsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/reducedMotion";

/**
 * LotusScene — the hero's living brand mark ("Le Lotus", Drop 20).
 *
 * The favicon lotus rebuilt as five SVG petals that BLOOM on load
 * (staggered from the center out), then breathe forever. Warm light
 * pools pulse beneath (pure CSS); a vapeur line rises from the core.
 * On pointer devices a honey warmth-glow follows the cursor and the
 * petals lean 1–2° toward it.
 *
 * Motion rules (prompt 01): default CSS state is the FULLY BLOOMED
 * lotus — if gsap never loads, nothing is hidden. gsap is lazy,
 * transform/opacity only, wrapped in gsap.context + matchMedia, and
 * reduced-motion gets the still, open flower.
 */

const PETALS: Array<{
  d: string;
  opacity: number;
  origin: string;
  lean: number;
}> = [
  {
    d: "M 185 232 C 118 226, 74 200, 60 165 C 96 169, 152 193, 193 227 Z",
    opacity: 0.32,
    origin: "96% 90%",
    lean: 1,
  },
  {
    d: "M 215 232 C 282 226, 326 200, 340 165 C 304 169, 248 193, 207 227 Z",
    opacity: 0.32,
    origin: "4% 90%",
    lean: 1,
  },
  {
    d: "M 190 225 C 143 204, 118 155, 124 120 C 154 126, 190 163, 198 218 Z",
    opacity: 0.58,
    origin: "90% 95%",
    lean: 0.7,
  },
  {
    d: "M 210 225 C 257 204, 282 155, 276 120 C 246 126, 210 163, 202 218 Z",
    opacity: 0.58,
    origin: "10% 95%",
    lean: 0.7,
  },
  {
    d: "M 200 96 C 172 132, 168 195, 200 236 C 232 195, 228 132, 200 96 Z",
    opacity: 0.92,
    origin: "50% 100%",
    lean: 0.5,
  },
];

export function LotusScene() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    void loadGsap().then((gsap) => {
      if (cancelled || !rootRef.current) return;
      ctx = gsap.context(() => {
        const petals = gsap.utils.toArray<SVGPathElement>("[data-petal]");
        const vapeur =
          rootRef.current?.querySelector<SVGPathElement>("[data-vapeur]");

        // Bloom: collapse + unfold, center petal last index → play out-in.
        const tl = gsap.timeline({ defaults: { ease: "back.out(1.4)" } });
        tl.set(petals, { scale: 0.2, opacity: 0, rotation: 0 })
          .to(petals[4] ?? petals, { scale: 1, opacity: PETALS[4]?.opacity ?? 0.9, duration: 0.9 })
          .to(
            [petals[2], petals[3]],
            { scale: 1, opacity: PETALS[2]?.opacity ?? 0.58, duration: 0.8, stagger: 0.12 },
            "-=0.55",
          )
          .to(
            [petals[0], petals[1]],
            { scale: 1, opacity: PETALS[0]?.opacity ?? 0.32, duration: 0.8, stagger: 0.12 },
            "-=0.5",
          );

        if (vapeur) {
          const len = vapeur.getTotalLength();
          gsap.set(vapeur, { strokeDasharray: len, strokeDashoffset: len });
          tl.to(vapeur, { strokeDashoffset: 0, duration: 1.6, ease: "power1.out" }, "-=0.3");
        }

        // Eternal breathing on the whole flower.
        tl.to(
          "[data-lotus]",
          {
            scale: 1.015,
            duration: 4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          },
          ">-0.2",
        );

        // Pointer warmth + petal lean — pointer devices on md+ only.
        const mm = gsap.matchMedia();
        mm.add("(min-width: 768px) and (hover: hover)", () => {
          const glow =
            rootRef.current?.querySelector<HTMLDivElement>("[data-warmth]");
          if (!glow || !rootRef.current) return;
          const xTo = gsap.quickTo(glow, "x", { duration: 0.9, ease: "power3" });
          const yTo = gsap.quickTo(glow, "y", { duration: 0.9, ease: "power3" });
          gsap.set(glow, { xPercent: -50, yPercent: -50, opacity: 0 });
          const leanTos = petals.map((p) =>
            gsap.quickTo(p, "rotation", { duration: 1.1, ease: "power2" }),
          );
          const onMove = (e: PointerEvent) => {
            const rect = rootRef.current?.getBoundingClientRect();
            if (!rect) return;
            xTo(e.clientX - rect.left);
            yTo(e.clientY - rect.top);
            gsap.to(glow, { opacity: 1, duration: 0.4, overwrite: "auto" });
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            leanTos.forEach((to, i) => {
              to(nx * 2 * (PETALS[i]?.lean ?? 0.7));
            });
          };
          const onLeave = () => {
            gsap.to(glow, { opacity: 0, duration: 0.6 });
            leanTos.forEach((to) => to(0));
          };
          const el = rootRef.current;
          el.addEventListener("pointermove", onMove);
          el.addEventListener("pointerleave", onLeave);
          return () => {
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerleave", onLeave);
          };
        });
      }, rootRef);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-auto absolute inset-y-0 right-0 hidden w-1/2 items-center justify-center overflow-hidden md:flex"
    >
      <div
        data-warmth
        className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(circle, rgba(231,226,107,0.16), transparent 68%)",
        }}
      />
      <div className="pool-pulse absolute h-64 w-[26rem] rounded-full bg-honey-300/10 blur-none" />
      <div className="pool-pulse-alt absolute h-44 w-72 translate-y-10 rounded-full bg-terracotta-500/10" />
      <svg
        data-lotus
        viewBox="0 0 400 300"
        className="relative w-[min(34rem,90%)] will-change-transform"
        role="presentation"
      >
        {PETALS.map((petal) => (
          <path
            key={petal.d}
            data-petal
            d={petal.d}
            fill="#eb9c86"
            opacity={petal.opacity}
            style={{
              transformBox: "fill-box",
              transformOrigin: petal.origin,
            }}
          />
        ))}
        <circle
          cx="200"
          cy="231"
          r="4"
          fill="var(--color-honey-300, #e7e26b)"
          className="core-glow"
        />
        <path
          data-vapeur
          d="M 200 92 C 195 72, 208 62, 202 42 C 197 26, 208 18, 204 4"
          fill="none"
          stroke="#f5f0e7"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

/** Compact lotus behind the heading on small screens (CSS bloom only). */
export function LotusSceneMobile() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-24 w-64 -translate-x-1/2 opacity-40 md:hidden"
    >
      <svg viewBox="0 0 400 300" role="presentation" className="lotus-css-bloom">
        {PETALS.map((petal, i) => (
          <path
            key={petal.d}
            d={petal.d}
            fill="#eb9c86"
            opacity={petal.opacity}
            style={{
              transformBox: "fill-box",
              transformOrigin: petal.origin,
              animationDelay: `${0.15 + (4 - i) * 0.1}s`,
            }}
            className="lotus-petal-css"
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * HeroSoinsChips — the product row. First three CMS treatments cycle
 * softly; a click opens the booking modal with that treatment
 * preselected (Drop 16 payload).
 */
export function HeroSoinsChips() {
  const { i18n } = useTranslation();
  const { open } = useModal();
  const services = (useCMSServices() ?? []).slice(0, 3);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";

  useEffect(() => {
    if (paused || services.length < 2) return;
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % services.length),
      5000,
    );
    return () => window.clearInterval(id);
  }, [paused, services.length]);

  if (services.length === 0) return null;

  return (
    <div
      data-reveal
      className="no-scrollbar -mx-1 mt-8 flex gap-3 overflow-x-auto px-1 pb-1"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {services.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => open("booking", { serviceId: s.id })}
          className={`shrink-0 rounded-full border px-5 py-2 transition-all duration-500 ${
            i === active
              ? "border-honey-300 text-honey-300"
              : "border-white/25 bg-white/5 text-porcelain/70 hover:border-white/50 hover:text-porcelain"
          }`}
          style={{
            fontSize: "var(--typo-small)",
            lineHeight: "var(--leading-small)",
          }}
        >
          {lang === "fr" ? s.title_fr : s.title_en} · {s.duration_minutes} min
          · {s.price} €
        </button>
      ))}
    </div>
  );
}
