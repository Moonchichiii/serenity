import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TicketPercent } from 'lucide-react'
import { useModal } from '@/hooks/useModal'
import { useTranslation } from 'react-i18next'
import { cmsAPI } from '@/api/cms'
import ResponsiveImage from '@/components/ui/ResponsiveImage'
import type { ResponsiveImage as ResponsiveImageType } from '@/types/api'

export function FloatingGiftButton() {
  const { open } = useModal()
  const { t } = useTranslation()

  const [enabled, setEnabled] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [icon, setIcon] = useState<ResponsiveImageType | null>(null)

  useEffect(() => {
    cmsAPI
      .getGlobals()
      .then((data) => {
        setEnabled(data.gift.is_enabled)
        setIcon(data.gift.floating_icon ?? null)
        setLoaded(true)
      })
      .catch(() => {
        setEnabled(true)
        setLoaded(true)
      })
  }, [])

  if (!loaded || !enabled) return null

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => open('gift')}
        className="fixed z-40 bottom-6 right-6 sm:bottom-10 sm:right-10 group"
        aria-label={t('gift.trigger', 'Offer a Gift')}
        title={t('gift.trigger', 'Offer a Gift')}
      >
        <span className="sr-only">{t('gift.trigger', 'Offer a Gift')}</span>
        <div className="absolute inset-0 bg-terracotta-400 rounded-full animate-pulse-warm opacity-30" />

        <div className="relative flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 bg-white/90 backdrop-blur-sm rounded-full shadow-elevated border-2 border-white/50 transition-all group-hover:border-terracotta-200 overflow-hidden p-1.5">
          {icon?.src ? (
            <ResponsiveImage
              image={icon}
              alt=""
              aria-hidden="true"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-sm"
              sizes="56px"
            />
          ) : (
            <TicketPercent className="w-8 h-8 text-terracotta-500" strokeWidth={1.5} />
          )}
        </div>

        <span
          className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-charcoal/90 text-white text-xs font-medium tracking-wide rounded-xl opacity-0 -translate-x-2 pointer-events-none transition-all group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap hidden sm:block backdrop-blur-md shadow-lg"
          aria-hidden="true"
        >
          {t('gift.trigger')}
        </span>
      </motion.button>
    </AnimatePresence>
  )
}
