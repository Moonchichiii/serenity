import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Globe, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useModal } from "@/components/modal/useModal";

/**
 * Header — V2 (Fas 7 §1).
 *
 * Changes vs V1:
 *  - framer-motion removed entirely: the language dropdown enters with a
 *    CSS keyframe (.dropdown-pop) and the mobile panel expands with the
 *    grid-template-rows 0fr→1fr technique — height:auto animation in pure
 *    CSS, reduced-motion handled in the stylesheet.
 *  - LanguagePicker extracted: V1 shared ONE ref between the desktop and
 *    mobile dropdowns, so outside-click detection watched the wrong node.
 *    Each instance now owns its ref/state. (~80 duplicated lines removed.)
 *  - Nav links: .nav-underline sweep — honey over the dark hero,
 *    terracotta once the header goes light (driven by [data-scrolled]).
 *
 * Unchanged by design: scroll state, all nav items and handlers, contact
 * modal trigger, focus management, Escape handling, every i18n key, and
 * the checkmark language switcher (Celine's Priority 1 from Nov 2025).
 */

function LanguagePicker({ toneClass }: { toneClass: string }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const changeLanguage = (lang: string) => {
    void i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("mousedown", onOutside);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const current = i18n.language.startsWith("fr") ? "fr" : "en";

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={current === "en" ? "Choisir la langue" : "Choose language"}
        aria-expanded={isOpen}
        className={`flex items-center gap-2 ${toneClass}`}
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span
          className="font-medium"
          lang={current}
          style={{
            fontSize: "var(--typo-caption)",
            lineHeight: "var(--leading-caption)",
          }}
        >
          {current === "fr" ? "FR" : "EN"}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </Button>

      {isOpen && (
        <div
          className="dropdown-pop absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border-2 border-sage-200/30 bg-white shadow-xl"
          role="menu"
        >
          {(
            [
              { code: "fr", label: "Français" },
              { code: "en", label: "English" },
            ] as const
          ).map(({ code, label }) => (
            <button
              key={code}
              type="button"
              role="menuitem"
              onClick={() => changeLanguage(code)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-charcoal/80 transition-colors duration-200 hover:bg-sage-100"
              style={{
                fontSize: "var(--typo-small)",
                lineHeight: "var(--leading-small)",
              }}
            >
              <span>{label}</span>
              {current === code && (
                <Check className="w-4 h-4 text-sage-600" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { t } = useTranslation();
  const { open } = useModal();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const firstMobileLinkRef = useRef<HTMLAnchorElement | null>(null);
  const mobileMenuId = "primary-mobile-menu";

  const navItems = useMemo(
    () => [
      { key: "about", href: "#about" },
      { key: "services", href: "#services" },
      { key: "corporate", href: "#services-hero" },
    ],
    [],
  );

  const handleNav =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
        return;
      e.preventDefault();

      setIsOpen(false);

      setTimeout(() => {
        const id = href.replace(/^#/, "");
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          history.pushState(null, "", href);
        }
      }, 100);
    };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) firstMobileLinkRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const linkColor = isScrolled
    ? "text-charcoal/80 hover:text-charcoal"
    : "text-white/90 hover:text-white";

  const logoColor = isScrolled
    ? "text-charcoal group-hover:text-sage-600"
    : "text-white group-hover:text-white/80";

  const iconColor = isScrolled
    ? "text-charcoal-light hover:bg-warm-grey-100 hover:text-charcoal"
    : "text-white/90 hover:bg-white/10 hover:text-white";

  return (
    <nav
      data-scrolled={isScrolled}
      className={`site-nav fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-sage-200/30 shadow-sm"
          : "bg-transparent border-transparent"
      }`}
      aria-label="Primary"
    >
      <div
        className="container mx-auto"
        style={{
          paddingLeft: "var(--space-container-x)",
          paddingRight: "var(--space-container-x)",
        }}
      >
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? "h-16 lg:h-20" : "h-20 lg:h-24"
          }`}
        >
          {/* ── Logo ── */}
          <a
            href="#home"
            onClick={handleNav("#home")}
            className="group flex items-center space-x-2"
            aria-label={t("nav.home")}
          >
            <span
              className={`font-heading font-semibold transition-all duration-300 ${logoColor}`}
              style={{
                fontSize: isScrolled ? "var(--typo-h3)" : "var(--typo-h2)",
                lineHeight: isScrolled
                  ? "var(--leading-h3)"
                  : "var(--leading-h2)",
              }}
            >
              <span
                className="mr-1 align-super italic"
                style={{ fontSize: "var(--typo-caption)" }}
              >
                La
              </span>
              Serenity
            </span>
          </a>

          {/* ── Desktop nav ── */}
          <div className="hidden items-center space-x-8 md:flex">
            <ul className="flex items-center space-x-8">
              {navItems.map((item) => (
                <li key={item.key}>
                  <a
                    href={item.href}
                    onClick={handleNav(item.href)}
                    className={`nav-underline font-medium transition-colors duration-200 ${linkColor}`}
                    style={{
                      fontSize: "var(--typo-small)",
                      lineHeight: "var(--leading-small)",
                    }}
                  >
                    {t(`nav.${item.key}`)}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => open("contact")}
              className={`nav-underline font-medium transition-colors duration-200 ${linkColor}`}
              style={{
                fontSize: "var(--typo-small)",
                lineHeight: "var(--leading-small)",
              }}
              aria-haspopup="dialog"
              aria-controls="contact-modal"
            >
              {t("nav.contact")}
            </button>

            <LanguagePicker toneClass={iconColor} />
          </div>

          {/* ── Mobile controls ── */}
          <div className="flex items-center space-x-4 md:hidden">
            <LanguagePicker toneClass={iconColor} />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen((v) => !v)}
              aria-expanded={isOpen}
              aria-controls={mobileMenuId}
              aria-label={isOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              className={iconColor}
            >
              {isOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu panel — grid-rows expand, always mounted ── */}
      <div
        id={mobileMenuId}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`mobile-panel md:hidden ${
          isOpen
            ? "is-open border-t border-sage-200/30 bg-white/98 backdrop-blur-md"
            : ""
        }`}
      >
        <div className="mobile-panel-inner">
          <div
            className="container mx-auto space-y-2 py-4"
            style={{
              paddingLeft: "var(--space-container-x)",
              paddingRight: "var(--space-container-x)",
            }}
          >
            <ul className="space-y-2">
              {navItems.map((item, idx) => (
                <li key={item.key}>
                  <a
                    ref={idx === 0 ? firstMobileLinkRef : null}
                    href={item.href}
                    onClick={handleNav(item.href)}
                    className="block rounded-xl border-l-2 border-transparent px-4 py-3 text-charcoal/80 transition-all duration-200 hover:border-terracotta-400 hover:bg-sage-50 hover:text-charcoal"
                    style={{
                      fontSize: "var(--typo-body)",
                      lineHeight: "var(--leading-body)",
                    }}
                  >
                    {t(`nav.${item.key}`)}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    open("contact");
                  }}
                  className="block w-full rounded-xl border-l-2 border-transparent px-4 py-3 text-left text-charcoal/80 transition-all duration-200 hover:border-terracotta-400 hover:bg-sage-50 hover:text-charcoal"
                  style={{
                    fontSize: "var(--typo-body)",
                    lineHeight: "var(--leading-body)",
                  }}
                  aria-haspopup="dialog"
                  aria-controls="contact-modal"
                >
                  {t("nav.contact")}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
