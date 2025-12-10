import { Gift } from 'lucide-react'
import { motion } from 'framer-motion'
import { useModal } from '@/shared/hooks/useModal'
import { useTranslation } from 'react-i18next'

export function FloatingGiftButton() {
  const { open } = useModal()
  const { t } = useTranslation()

  return (
    <motion.button
      initial={{ scale: 0, rotate: 180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => open('gift')}
      className="fixed z-40 bottom-6 right-6 sm:bottom-8 sm:right-8 group"
      aria-label={t('gift.title', { defaultValue: 'Offer a Gift' })}
    >
      {/* Pulse effect */}
      <div className="absolute inset-0 bg-terracotta-400 rounded-full animate-pulse-warm opacity-50"></div>

      {/* Button */}
      <div className="relative flex items-center justify-center w-14 h-14 bg-terracotta-500 text-white rounded-full shadow-elevated border-2 border-white/20 transition-colors group-hover:bg-terracotta-600">
        <Gift className="w-7 h-7" strokeWidth={1.5} />
      </div>

      {/* Tooltip (Desktop only) */}
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-charcoal text-white text-xs font-medium rounded-lg opacity-0 -translate-x-2 pointer-events-none transition-all group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap hidden sm:block">
        {t('gift.title', { defaultValue: 'Offer a Gift' })}
      </span>
    </motion.button>
  )
}
