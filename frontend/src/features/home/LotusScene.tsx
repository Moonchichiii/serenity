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

const VIEWBOX = "0 0 233.61 200";
const CORAL = "#e19f93";

const PETALS: Array<{
  d: string;
  opacity: number;
  origin: string;
  lean: number;
}> = [
  {
    d: "M100.024,175.355c-22.095,0-42.418-8.204-57.222-23.002c-6.206-6.212-11.194-13.3-14.923-21.015 c-2.625-5.436-8.7-8.479-13.992-5.579c-2.995,1.641-5.901,3.479-8.7,5.513c-4.887,3.544-6.695,11.57-3.795,16.874 c10.126,18.521,26.785,32.317,47.568,36.983c15.233,3.431,30.55,1.462,44.376-4.708c5.513-2.464,8.98-5.096,8.163-5.084 C101.002,175.349,100.513,175.355,100.024,175.355z",
    opacity: 0.8,
    origin: "94% 74%",
    lean: 1,
  },
  {
    d: "M228.425,131.272c-2.81-2.029-5.71-3.867-8.706-5.507c-5.305-2.9-11.361,0.137-13.986,5.573 c-3.729,7.727-8.718,14.816-14.929,21.015c-14.798,14.804-35.115,23.002-57.222,23.002c-0.489,0-0.979-0.006-1.48-0.024 c-0.817-0.024,2.649,2.613,8.169,5.084c13.819,6.17,29.136,8.139,44.376,4.708c20.783-4.672,37.436-18.467,47.574-36.977 C235.12,142.841,233.306,134.81,228.425,131.272z",
    opacity: 0.8,
    origin: "6% 74%",
    lean: 1,
  },
  {
    d: "M94.248,166.894c6.027,0.43,7.083-3.019,2.906-7.375c-14.595-15.239-22.71-34.572-22.71-55.188 c0-3.425,0.227-6.814,0.668-10.15c0.74-5.573-2.44-12.107-8.246-13.772c-8.479-2.434-17.441-3.359-26.505-2.792 c-6.027,0.376-11.844,6.2-12.226,12.226c-1.331,21.063,5.37,41.625,20.431,56.685C60.989,158.952,77.153,165.671,94.248,166.894z",
    opacity: 0.92,
    origin: "88% 90%",
    lean: 0.7,
  },
  {
    d: "M159.341,104.337c0,20.616-8.109,39.96-22.728,55.205c-4.171,4.356-3.109,7.787,2.912,7.345 c17.035-1.265,33.134-7.966,45.509-20.347c15.06-15.06,21.761-35.628,20.431-56.691c-0.382-6.027-6.212-11.85-12.238-12.226 c-8.992-0.561-17.889,0.346-26.314,2.739c-5.818,1.653-8.998,8.193-8.252,13.783C159.114,97.499,159.341,100.9,159.341,104.337z",
    opacity: 0.92,
    origin: "12% 90%",
    lean: 0.7,
  },
  {
    d: "M125.544,49.8c-4.529-3.992-12.769-3.992-17.298,0c-15.836,13.951-25.64,33.224-25.64,54.531 c0,21.302,9.804,40.587,25.64,54.537c4.529,3.986,12.769,3.986,17.298,0c15.836-13.951,25.64-33.229,25.64-54.537 C151.184,83.029,141.38,63.75,125.544,49.8z",
    opacity: 1,
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
          .to(petals[4] ?? petals, { scale: 1, opacity: PETALS[4]?.opacity ?? 1, duration: 0.9 })
          .to(
            [petals[2], petals[3]],
            { scale: 1, opacity: PETALS[2]?.opacity ?? 0.92, duration: 0.8, stagger: 0.12 },
            "-=0.55",
          )
          .to(
            [petals[0], petals[1]],
            { scale: 1, opacity: PETALS[0]?.opacity ?? 0.8, duration: 0.8, stagger: 0.12 },
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
      <div
        className="pool-pulse absolute h-[24rem] w-[34rem]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(231,226,107,0.17), transparent 72%)",
        }}
      />
      <div
        className="pool-pulse-alt absolute h-64 w-96 translate-y-16"
        style={{
          background:
            "radial-gradient(closest-side, rgba(201,75,44,0.14), transparent 70%)",
        }}
      />
      <svg
        data-lotus
        viewBox={VIEWBOX}
        className="relative w-[min(40rem,88%)] translate-y-4 will-change-transform"
        role="presentation"
      >
        {PETALS.map((petal) => (
          <path
            key={petal.d}
            data-petal
            d={petal.d}
            fill={CORAL}
            opacity={petal.opacity}
            style={{
              transformBox: "fill-box",
              transformOrigin: petal.origin,
            }}
          />
        ))}
        <circle
          cx="116.8"
          cy="163"
          r="2.8"
          fill="var(--color-honey-300, #e7e26b)"
          className="core-glow"
        />
        <path
          data-vapeur
          d="M 116.8 44 C 112 30, 123 22, 117 8"
          fill="none"
          stroke="#f5f0e7"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

/** Crisp brand mark above the eyebrow on small screens (CSS bloom). */
export function LotusMark() {
  return (
    <div aria-hidden="true" className="mb-8 w-32 md:hidden" data-reveal>
      <svg viewBox={VIEWBOX} role="presentation">
        {PETALS.map((petal, i) => (
          <path
            key={petal.d}
            d={petal.d}
            fill={CORAL}
            opacity={Math.min(petal.opacity + 0.15, 1)}
            style={{
              transformBox: "fill-box",
              transformOrigin: petal.origin,
              animationDelay: `${0.2 + (4 - i) * 0.1}s`,
            }}
            className="lotus-petal-css"
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * HeroSoinsTicker — one treatment at a time, editorial style.
 *
 * The pill stack competed with the real CTAs; this is a single elegant
 * rotating line (crossfade every 5 s, paused on hover/focus) with three
 * dots. The whole line is a button that opens the booking modal with
 * that treatment preselected. Long titles wrap without layout shift.
 */
export function HeroSoinsChips() {
  const { t, i18n } = useTranslation();
  const { open } = useModal();
  const services = (useCMSServices() ?? []).slice(0, 3);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const fmtPrice = (p: string | number) => {
    const n = Number(p);
    return Number.isFinite(n) ? `${n % 1 === 0 ? n : n.toFixed(2)}` : String(p);
  };

  useEffect(() => {
    if (paused || services.length < 2) return;
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % services.length),
      5000,
    );
    return () => window.clearInterval(id);
  }, [paused, services.length]);

  const current = services[active];
  if (!current) return null;

  return (
    <div
      data-reveal
      className="mt-9"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <button
        type="button"
        onClick={() => open("booking", { serviceId: current.id })}
        className="group flex min-h-[3.5rem] items-start gap-4 text-left sm:min-h-[2rem] sm:items-baseline"
        aria-label={t("booking.title", "Book a session")}
      >
        <span
          aria-hidden="true"
          className="mt-3 h-px w-8 shrink-0 bg-honey-300 transition-all duration-300 group-hover:w-12 sm:mt-0 sm:self-center"
        />
        <span
          key={current.id}
          className="soin-line-in text-porcelain/90 transition-colors group-hover:text-porcelain"
          style={{
            fontSize: "var(--typo-body)",
            lineHeight: "var(--leading-body)",
          }}
        >
          {lang === "fr" ? current.title_fr : current.title_en}
          <span className="text-porcelain/50"> · {current.duration_minutes} min · </span>
          <span className="text-honey-300">{fmtPrice(current.price)} €</span>
          <span
            aria-hidden="true"
            className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </button>

      <div className="mt-3 flex gap-2 pl-12" role="tablist" aria-label="Soins">
        {services.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={lang === "fr" ? s.title_fr : s.title_en}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active
                ? "w-6 bg-honey-300"
                : "w-1.5 bg-white/25 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
