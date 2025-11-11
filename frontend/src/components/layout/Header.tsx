import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu, X, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useModal } from '@/shared/hooks/useModal'

export function Header() {
  const { t, i18n } = useTranslation()
  const { open } = useModal()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const firstMobileLinkRef = useRef<HTMLAnchorElement | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const mobileMenuId = 'primary-mobile-menu'

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en'
    i18n.changeLanguage(newLang)
  }

  const navItems = useMemo(
    () => [
      { key: 'about', href: '#about' },
      { key: 'services', href: '#services-hero' },
      //{ key: 'booking', href: '#booking' },
    ],
    []
  )

  const handleNav = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()

    // Close mobile menu first
    setIsOpen(false)

    // Small delay to allow menu to close
    setTimeout(() => {
      const id = href.replace(/^#/, '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        history.pushState(null, '', href)
      }
    }, 100)
  }

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isOpen) firstMobileLinkRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        border-b transition-all duration-300
        ${isScrolled
          ? 'glass border-sage-200/30 shadow-soft'
          : 'bg-transparent border-transparent'
        }
      `}
      aria-label="Primary"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className={`
          flex items-center justify-between transition-all duration-300
          ${isScrolled ? 'h-16 lg:h-20' : 'h-20 lg:h-24'}
        `}>
          <a
            href="#home"
            onClick={handleNav('#home')}
            className="flex items-center space-x-2 group"
            aria-label={t('nav.home', { defaultValue: 'Home' })}
          >
            <span className={`
              font-heading font-semibold text-charcoal
              group-hover:text-sage-600 transition-all duration-300
              ${isScrolled ? 'text-2xl lg:text-3xl' : 'text-3xl lg:text-4xl'}
            `}>
              <span className="align-super text-sm mr-1">La</span>
              Serenity
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex items-center space-x-8">
              {navItems.map((item) => (
                <li key={item.key}>
                  <a
                    href={item.href}
                    onClick={handleNav(item.href)}
                    className="warm-underline text-charcoal/80 hover:text-charcoal transition-colors duration-200 font-medium"
                  >
                    {t(`nav.${item.key}`)}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => open('contact')}
              className="warm-underline text-charcoal/80 hover:text-charcoal font-medium"
              aria-haspopup="dialog"
              aria-controls="contact-modal"
            >
              {t('nav.contact')}
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              aria-label={i18n.language === 'en' ? 'Afficher le site en français' : 'Show site in English'}
              className="flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium" lang={i18n.language === 'en' ? 'fr' : 'en'}>
                {i18n.language === 'en' ? 'FR' : 'EN'}
              </span>
            </Button>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center space-x-4 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              aria-label={i18n.language === 'en' ? 'Afficher le site en français' : 'Show site in English'}
            >
              <Globe className="w-4 h-4" aria-hidden="true" />
              <span className="ml-2 text-sm" lang={i18n.language === 'en' ? 'fr' : 'en'}>
                {i18n.language === 'en' ? 'FR' : 'EN'}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls={mobileMenuId}
              aria-label={isOpen ? t('nav.closeMenu', { defaultValue: 'Close menu' }) : t('nav.openMenu', { defaultValue: 'Open menu' })}
            >
              {isOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={mobileMenuId}
            aria-label="Mobile navigation"
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            className="md:hidden border-t border-sage-200/30 bg-porcelain"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              <ul className="space-y-2">
                {navItems.map((item, idx) => (
                  <li key={item.key}>
                    <a
                      ref={idx === 0 ? firstMobileLinkRef : null}
                      href={item.href}
                      onClick={handleNav(item.href)}
                      className="block py-3 px-4 text-charcoal/80 hover:text-charcoal hover:bg-sage-100 rounded-xl transition-all duration-200 border-l-2 border-transparent hover:border-sage-400"
                    >
                      {t(`nav.${item.key}`)}
                    </a>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      open('contact')
                    }}
                    className="block w-full text-left py-3 px-4 text-charcoal/80 hover:text-charcoal hover:bg-sage-100 rounded-xl transition-all duration-200 border-l-2 border-transparent hover:border-sage-400"
                    aria-haspopup="dialog"
                    aria-controls="contact-modal"
                  >
                    {t('nav.contact')}
                  </button>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
