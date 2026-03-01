import React, { useState } from "react";
import { Clock, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedInstagramIcon from "@/components/ui/AnimatedInstagramIcon";
import AnimatedFacebookIcon from "@/components/ui/AnimatedFacebookIcon";
import { useModal } from "@/components/modal/useModal";
import { useCMSGlobals } from "@/hooks/useCMS";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { open } = useModal();
  const globals = useCMSGlobals();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const brand =
    globals?.site?.brand?.trim() || "La Serenity";
  const contactEmail =
    globals?.site?.email?.trim() || t("footer.email");
  const address =
    globals?.site?.address_full?.trim() || t("footer.addressFull");
  const hours =
    globals?.site?.business_hours?.trim() || t("footer.hoursValue");
  const instagram =
    globals?.site?.instagram_url?.trim() ||
    "https://www.instagram.com/laserenity_marseille/";
  const facebook =
    globals?.site?.facebook_url?.trim() ||
    "https://facebook.com/yourpage";

  const handleNav =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0
      )
        return;
      e.preventDefault();
      const id = href.replace(/^#/, "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", href);
      }
    };

  const navLinkClass =
    "text-warm-grey-300 hover:text-white transition-colors duration-200 text-sm leading-relaxed font-light";

  const legalBtnClass =
    "cursor-pointer text-warm-grey-500 hover:text-warm-grey-300 transition-colors duration-200 text-[11px] uppercase tracking-[0.12em]";

  return (
    <footer id="site-footer" className="relative mt-0 contain-content">
      <div className="relative bg-sage-900 text-white overflow-hidden">
        <div
          className="noise-texture-subtle opacity-[0.05]"
          aria-hidden="true"
        />

        <div className="relative z-10 container mx-auto px-6 lg:px-20">
          {/* ── Main content ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-24 pt-16 pb-12">
            {/* Left — tagline + newsletter */}
            <div className="max-w-sm">
              <p className="text-sm text-warm-grey-300 leading-relaxed font-light">
                {t("footer.tagline")}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) {
                    open("contact", {
                      defaultEmail: email.trim(),
                    });
                    setEmail("");
                  }
                }}
                className="mt-5 flex items-center"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer.emailPlaceholder", {
                    defaultValue: "Enter your email",
                  })}
                  className="h-11 flex-1 rounded-l-full border border-white/10 bg-white/[0.05] px-5 text-sm text-white placeholder-warm-grey-500 outline-none transition-colors duration-200 focus:border-white/20 focus:bg-white/[0.07]"
                />
                <button
                  type="submit"
                  aria-label={t("footer.subscribe", {
                    defaultValue: "Subscribe",
                  })}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta-400 text-white transition-all duration-200 hover:bg-terracotta-500 hover:scale-105 -ml-px"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Right — columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 lg:gap-14">
              {/* Navigation */}
              <div>
                <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                  {t("footer.navigation", {
                    defaultValue: "Navigation",
                  })}
                </h4>
                <ul className="space-y-2.5">
                  <li>
                    <a
                      href="#about"
                      onClick={handleNav("#about")}
                      className={navLinkClass}
                    >
                      {t("nav.about")}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#services"
                      onClick={handleNav("#services")}
                      className={navLinkClass}
                    >
                      {t("nav.services")}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#services-hero"
                      onClick={handleNav("#services-hero")}
                      className={navLinkClass}
                    >
                      {t("nav.corporate")}
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => open("contact")}
                      className={`${navLinkClass} text-left`}
                    >
                      {t("nav.contact")}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                  {t("footer.contactTitle")}
                </h4>
                <div className="space-y-2.5 text-sm font-light text-warm-grey-300">
                  <p className="leading-relaxed">{address}</p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="block hover:text-white transition-colors duration-200"
                  >
                    {contactEmail}
                  </a>
                  <p className="flex items-center gap-1.5 text-warm-grey-400">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{hours}</span>
                  </p>
                </div>
              </div>

              {/* Socials */}
              <div className="col-span-2 sm:col-span-1">
                <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                  {t("footer.socials", {
                    defaultValue: "Socials",
                  })}
                </h4>
                <div className="flex items-center gap-3">
                  <AnimatedInstagramIcon
                    magnetic
                    size={42}
                    href={instagram}
                  />
                  <AnimatedFacebookIcon
                    magnetic
                    size={42}
                    href={facebook}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Watermark ── */}
          <div
            className="w-full overflow-hidden pointer-events-none select-none -mb-[3vw]"
            aria-hidden="true"
          >
            <p className="font-serif text-[18vw] md:text-[15vw] lg:text-[12vw] leading-[0.82] text-center text-white/[0.03] whitespace-nowrap tracking-tight">
              {brand}
            </p>
          </div>

          {/* ── Bottom bar ── */}
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-t border-white/[0.06] py-5 text-[11px] text-warm-grey-500 uppercase tracking-[0.12em]">
            <p>
              © {currentYear} {brand}. {t("footer.allRights")}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <button
                type="button"
                onClick={() =>
                  open("legal", { page: "privacy" })
                }
                className={legalBtnClass}
              >
                {t("footer.privacy")}
              </button>
              <button
                type="button"
                onClick={() =>
                  open("legal", { page: "legal" })
                }
                className={legalBtnClass}
              >
                {t("footer.legalNotice")}
              </button>
              <span className="flex items-center gap-1.5">
                {t("footer.designedBy")}
                <a
                  href="https://www.nordiccodeworks.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warm-grey-400 hover:text-terracotta-300 transition-colors duration-200"
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
