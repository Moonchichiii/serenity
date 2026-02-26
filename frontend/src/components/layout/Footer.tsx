import React from "react";
import { Mail, MapPin, Clock } from "lucide-react";
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

  // CMS-first, i18n fallback
  const brand =
    globals?.site?.brand?.trim() || "La Serenity";
  const email =
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

  const linkBtnClass =
    "cursor-pointer text-white/60 hover:text-white transition-colors" +
    " duration-300 focus-visible:outline-none focus-visible:ring-2" +
    " focus-visible:ring-white/40 rounded-md text-left text-[15px]" +
    " leading-snug py-1.5";

  return (
    <footer id="site-footer" className="relative mt-0 contain-content">
      <div className="bg-[#1a2921] text-white pt-24 pb-36 md:pb-14">
        <div className="container mx-auto px-6 lg:px-16">
          {/* ── Brand hero row ── */}
          <div
            className="flex flex-col md:flex-row md:items-end
              md:justify-between gap-8 pb-16
              border-b border-white/[0.08]"
          >
            <div>
              <h3
                className="font-serif text-5xl md:text-6xl text-white
                  tracking-wide leading-tight"
              >
                {brand}
              </h3>
              <p
                className="mt-5 text-[15px] text-white/50 leading-relaxed
                  max-w-md font-light"
              >
                {t("footer.tagline")}
              </p>
            </div>

            <div className="flex items-center gap-5">
              <AnimatedInstagramIcon
                magnetic
                size={48}
                href={instagram}
              />
              <AnimatedFacebookIcon
                magnetic
                size={48}
                href={facebook}
              />
            </div>
          </div>

          {/* ── Info grid ── */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
              gap-12 lg:gap-16 pt-16 pb-16
              border-b border-white/[0.08]"
          >
            {/* Contact */}
            <div>
              <h4
                className="text-xs font-bold uppercase tracking-[0.2em]
                  text-white/40 mb-7"
              >
                {t("footer.contactTitle")}
              </h4>

              <div className="space-y-5">
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-4 text-white/70
                    hover:text-white transition-colors group text-[15px]"
                >
                  <div
                    className="p-2.5 rounded-xl bg-white/[0.06]
                      group-hover:bg-white/[0.12] transition-colors"
                  >
                    <Mail className="w-[18px] h-[18px]" />
                  </div>
                  <span className="font-light">{email}</span>
                </a>

                <div
                  className="flex items-start gap-4 text-white/70
                    text-[15px]"
                >
                  <div className="p-2.5 rounded-xl bg-white/[0.06]">
                    <MapPin className="w-[18px] h-[18px]" />
                  </div>
                  <span className="font-light leading-relaxed pt-1">
                    {address}
                  </span>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h4
                className="text-xs font-bold uppercase tracking-[0.2em]
                  text-white/40 mb-7"
              >
                {t("footer.hours")}
              </h4>

              <div className="flex items-start gap-4 text-[15px]">
                <div className="p-2.5 rounded-xl bg-white/[0.06]">
                  <Clock className="w-[18px] h-[18px] text-white/70" />
                </div>
                <span className="block text-white font-medium text-base pt-1">
                  {hours}
                </span>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4
                className="text-xs font-bold uppercase tracking-[0.2em]
                  text-white/40 mb-7"
              >
                {t("footer.info")}
              </h4>

              <ul className="flex flex-col gap-1.5">
                <li>
                  <button
                    type="button"
                    onClick={() => open("legal", { page: "legal" })}
                    className={linkBtnClass}
                  >
                    {t("footer.legalNotice")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      open("legal", { page: "privacy" })
                    }
                    className={linkBtnClass}
                  >
                    {t("footer.privacy")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => open("legal", { page: "terms" })}
                    className={linkBtnClass}
                  >
                    {t("footer.cgv")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      open("legal", { page: "cookies" })
                    }
                    className={linkBtnClass}
                  >
                    {t("footer.cookies")}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div
            className="pt-8 flex flex-col md:flex-row justify-between
              items-start md:items-center gap-4 text-[11px]
              text-white/40 uppercase tracking-[0.15em] font-medium"
          >
            <p>
              © {currentYear} {brand}. {t("footer.allRights")}
            </p>

            <p className="flex items-center gap-1.5">
              <span>{t("footer.designedBy")}</span>
              <a
                href="https://www.nordiccodeworks.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Nordic Code Works"
              >
                Nordic Code Works
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
