import React from "react";
import { Clock, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { useModal } from "@/components/modal/useModal";
import { useCMSGlobals } from "@/hooks/useCMS";

type GlyphProps = { size?: number; strokeWidth?: number };

const InstagramGlyph = ({ size = 18, strokeWidth = 1.6 }: GlyphProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookGlyph = ({ size = 18, strokeWidth = 1.6 }: GlyphProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const QuietSocialLink = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-sage-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-honey-300/60 hover:text-honey-300 motion-reduce:transition-none"
  >
    {children}
  </a>
);

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { open } = useModal();
  const globals = useCMSGlobals();
  const currentYear = new Date().getFullYear();

  const brand = globals?.site?.brand?.trim() || "La Serenity";
  const contactEmail =
    globals?.site?.email?.trim() || t("footer.email");
  const address =
    globals?.site?.address_full?.trim() || t("footer.addressFull");
  const hours = t("footer.hoursValue");
  const instagram =
    globals?.site?.instagram_url?.trim() ||
    "https://www.instagram.com/laserenity_marseille/";
  const facebook =
    globals?.site?.facebook_url?.trim() ||
    "https://facebook.com/laserenity_marseille";

  const handleNav =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0
      ) {
        return;
      }

      e.preventDefault();

      const id = href.replace(/^#/, "");
      const el = document.getElementById(id);

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        window.history.pushState(null, "", href);
      }
    };

  /* ── Shared styles ── */
  const headingClass = "mb-4 font-semibold uppercase text-sage-200";
  const linkClass =
    "font-light text-warm-grey-200 transition-colors duration-200 hover:text-white";
  const smallTextStyle = {
    fontSize: "var(--typo-small)",
    lineHeight: "var(--leading-small)",
  } as const;
  const overlineStyle = {
    fontSize: "var(--typo-overline)",
    lineHeight: "var(--leading-overline)",
    letterSpacing: "0.18em",
  } as const;

  return (
    <footer
      id="site-footer"
      className="relative mt-0 contain-content"
    >
      <div className="relative overflow-hidden bg-sage-deep text-white">
        <div
          className="noise-texture-subtle opacity-[0.05]"
          aria-hidden="true"
        />

        <div
          className="relative z-10 container mx-auto"
          style={{
            paddingLeft: "var(--space-container-x)",
            paddingRight: "var(--space-container-x)",
          }}
        >
          {/* ── Main content ── */}
          <div
            style={{
              paddingTop: "var(--space-section-y)",
              paddingBottom: "var(--space-title-to-content)",
            }}
          >
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-24">
              {/* ── Tagline ── */}
              <div className="max-w-sm">
                <p
                  className="font-light text-warm-grey-200"
                  style={smallTextStyle}
                >
                  {t("footer.tagline")}
                </p>
              </div>

              {/* ── Link columns ── */}
              <div className="grid grid-cols-1 gap-10 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:gap-14">
                {/* ── Navigation ── */}
                <div>
                  <h3 className={headingClass} style={overlineStyle}>
                    {t("footer.navigation", {
                      defaultValue: "Navigation",
                    })}
                  </h3>

                  <ul className="space-y-2.5">
                    <li>
                      <a
                        href="#about"
                        onClick={handleNav("#about")}
                        className={linkClass}
                        style={smallTextStyle}
                      >
                        {t("nav.about")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="#services"
                        onClick={handleNav("#services")}
                        className={linkClass}
                        style={smallTextStyle}
                      >
                        {t("nav.services")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="#services-hero"
                        onClick={handleNav("#services-hero")}
                        className={linkClass}
                        style={smallTextStyle}
                      >
                        {t("nav.corporate")}
                      </a>
                    </li>
                    <li>
                      <Link
                        to="/offrir"
                        className={linkClass}
                        style={smallTextStyle}
                      >
                        {t("nav.offrir", "Offrir")}
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => open("contact")}
                        className={`${linkClass} text-left`}
                        style={smallTextStyle}
                      >
                        {t("nav.contact")}
                      </button>
                    </li>
                  </ul>
                </div>

                {/* ── Contact ── */}
                <div>
                  <h3 className={headingClass} style={overlineStyle}>
                    {t("footer.contactTitle")}
                  </h3>

                  <div className="space-y-2.5 font-light text-warm-grey-200">
                    <p style={smallTextStyle}>{address}</p>

                    <a
                      href={`mailto:${contactEmail}`}
                      className="flex items-center gap-1.5 transition-colors duration-200 hover:text-white"
                      style={smallTextStyle}
                    >
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{contactEmail}</span>
                    </a>

                    <p
                      className="flex items-center gap-1.5 text-sage-200"
                      style={smallTextStyle}
                    >
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{hours}</span>
                    </p>
                  </div>
                </div>

                {/* ── Socials ── */}
                <div className="min-[400px]:col-span-2 sm:col-span-1">
                  <h3 className={headingClass} style={overlineStyle}>
                    {t("footer.socials", {
                      defaultValue: "Socials",
                    })}
                  </h3>

                  <div className="flex items-center gap-3">
                    <QuietSocialLink
                      href={instagram}
                      label="Instagram"
                    >
                      <InstagramGlyph
                        size={18}
                        strokeWidth={1.6}
                      />
                    </QuietSocialLink>
                    <QuietSocialLink href={facebook} label="Facebook">
                      <FacebookGlyph size={18} strokeWidth={1.6} />
                    </QuietSocialLink>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Brand watermark (decorative) ── */}
<div
  className="pointer-events-none hidden w-full select-none overflow-hidden md:block"
  role="presentation"
  aria-hidden="true"
>
  <p className="font-serif whitespace-nowrap text-center tracking-tight text-white/10 leading-[0.82] text-[15vw] lg:text-[12vw]">
    {brand}
  </p>
</div>

          {/* ── Bottom bar ── */}
          <div
            className="relative flex flex-col gap-4 border-t border-white/[0.06] py-6 pb-28 uppercase text-warm-grey-200 sm:flex-row sm:items-center sm:justify-between sm:pb-6 lg:pr-44"
            style={{
              fontSize: "var(--typo-overline)",
              lineHeight: "var(--leading-overline)",
              letterSpacing: "0.12em",
            }}
          >
            <p className="shrink-0">
              © {currentYear} {brand}. {t("footer.allRights")}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <button
                type="button"
                onClick={() => open("legal", { page: "privacy" })}
                className="cursor-pointer transition-colors duration-200 hover:text-white"
              >
                {t("footer.privacy")}
              </button>

              <span
                className="hidden text-white/20 sm:inline"
                aria-hidden="true"
              >
                |
              </span>

              <button
                type="button"
                onClick={() => open("legal", { page: "legal" })}
                className="cursor-pointer transition-colors duration-200 hover:text-white"
              >
                {t("footer.legalNotice")}
              </button>
            </div>

            <span className="flex shrink-0 items-center gap-1.5">
              {t("footer.designedBy")}
              <a
                href="https://www.nordiccodeworks.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-100 transition-colors duration-200 hover:text-terracotta-200"
              >
                Nordic Code Works
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
