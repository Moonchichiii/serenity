import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu, X, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en'
    i18n.changeLanguage(newLang)
  }

  const navItems = [
    { key: 'about', href: '#about' },
    { key: 'services', href: '#services' },
    { key: 'booking', href: '#booking' },
    { key: 'contact', href: '#contact' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-sage-200/30 shadow-soft">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#home" className="flex items-center space-x-2 group">
            <span className="text-2xl lg:text-3xl font-heading font-semibold text-charcoal group-hover:text-terracotta-500 transition-colors duration-300">
              Serenity
            </span>
          </a>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="warm-underline text-charcoal/80 hover:text-charcoal transition-colors duration-200 font-medium"
              >
                {t(`nav.${item.key}`)}
              </a>
            ))}

            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{i18n.language === 'en' ? 'FR' : 'EN'}</span>
            </Button>
          </div>

          <div className="flex items-center space-x-4 md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleLanguage}>
              <Globe className="w-4 h-4" />
              <span className="ml-2 text-sm">{i18n.language === 'en' ? 'FR' : 'EN'}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-sage-200/30 bg-porcelain"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 px-4 text-charcoal/80 hover:text-charcoal hover:bg-terracotta-100 rounded-xl transition-all duration-200 border-l-2 border-transparent hover:border-terracotta-400"
                >
                  {t(`nav.${item.key}`)}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}