import React from "react";
import { Clock, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

import AnimatedFacebookIcon from "@/components/ui/AnimatedFacebookIcon";
import AnimatedInstagramIcon from "@/components/ui/AnimatedInstagramIcon";
import { useModal } from "@/components/modal/useModal";
import { useCMSGlobals } from "@/hooks/useCMS";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { open } = useModal();
  const globals = useCMSGlobals();
  const currentYear = new Date().getFullYear();

  const brand = globals?.site?.brand?.trim() || "La Serenity";
  const contactEmail = globals?.site?.email?.trim() || t("footer.email");
  const address = globals?.site?.address_full?.trim() || t("footer.addressFull");
  const hours = t("footer.hoursValue");
  const instagram =
    globals?.site?.instagram_url?.trim() ||
    "https://www.instagram.com/laserenity_marseille/";
  const facebook =
    globals?.site?.facebook_url?.trim() || "https://facebook.com/laserenity_marseille";

  const handleNav =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      e.preventDefault();

      const id = href.replace(/^#/, "");
      const el = document.getElementById(id);

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", href);
      }
    };

  const headingClass = "mb-5 font-semibold uppercase text-white/30";
  const linkClass =
    "font-light text-warm-grey-300 transition-colors duration-200 hover:text-white";
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
    <footer id="site-footer" className="relative mt-0 contain-content">
      <div className="relative overflow-hidden bg-sage-deep text-white">
        <div className="noise-texture-subtle opacity-[0.05]" aria-hidden="true" />

        <div
          className="relative z-10 container mx-auto"
          style={{
            paddingLeft: "var(--space-container-x)",
            paddingRight: "var(--space-container-x)",
          }}
        >
          <div
            style={{
              paddingTop: "var(--space-section-y)",
              paddingBottom: "var(--space-title-to-content)",
            }}
          >
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-24">
              <div className="max-w-sm">
                <p
                  className="font-light text-warm-grey-300"
                  style={smallTextStyle}
                >
                  {t("footer.tagline")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:gap-14">
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

                <div>
                  <h3 className={headingClass} style={overlineStyle}>
                    {t("footer.contactTitle")}
                  </h3>

                  <div className="space-y-2.5 font-light text-warm-grey-300">
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

                <div className="col-span-2 sm:col-span-1">
                  <h3 className={headingClass} style={overlineStyle}>
                    {t("footer.socials", {
                      defaultValue: "Socials",
                    })}
                  </h3>

                  <div className="flex items-center gap-4">
                    <AnimatedInstagramIcon size={52} href={instagram} />
                    <AnimatedFacebookIcon size={52} href={facebook} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="pointer-events-none w-full select-none overflow-hidden -mb-[1vw]"
            aria-hidden="true"
          >
            <p className="font-serif whitespace-nowrap text-center tracking-tight text-white/15 leading-[0.82] text-[18vw] md:text-[15vw] lg:text-[12vw]">
              {brand}
            </p>
          </div>

          <div
            className="relative mt-4 flex flex-col items-start justify-between gap-3 border-t border-white/6 py-6 uppercase text-warm-grey-500 md:flex-row md:items-center"
            style={{
              fontSize: "var(--typo-overline)",
              lineHeight: "var(--leading-overline)",
              letterSpacing: "0.12em",
            }}
          >
            <p>
              © {currentYear} {brand}. {t("footer.allRights")}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-5">
              <button
                type="button"
                onClick={() => open("legal", { page: "privacy" })}
                className="cursor-pointer transition-colors duration-200 hover:text-warm-grey-300"
              >
                {t("footer.privacy")}
              </button>

              <button
                type="button"
                onClick={() => open("legal", { page: "legal" })}
                className="cursor-pointer transition-colors duration-200 hover:text-warm-grey-300"
              >
                {t("footer.legalNotice")}
              </button>

              <span className="flex items-center gap-1.5">
                {t("footer.designedBy")}
                <a
                  href="https://www.nordiccodeworks.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sage-200 transition-colors duration-200 hover:text-terracotta-300"
                >
                  Nordic Code Works
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
