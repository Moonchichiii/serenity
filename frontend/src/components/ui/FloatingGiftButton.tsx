import { TicketPercent } from 'lucide-react'
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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => open('gift')}
      className="fixed z-40 bottom-6 right-6 sm:bottom-10 sm:right-10 group"
      aria-label={t('gift.trigger', { defaultValue: 'Buy a Gift Voucher' })}
    >
      {/* Pulse effect - refined color */}
      <div className="absolute inset-0 bg-terracotta-300 rounded-full animate-pulse-warm opacity-40"></div>

      {/* Button */}
      <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-terracotta-400 to-terracotta-500 text-white rounded-full shadow-warm border border-white/30 backdrop-blur-sm transition-all group-hover:shadow-elevated">
        <TicketPercent className="w-7 h-7" strokeWidth={1.5} />
      </div>

      {/* Tooltip */}
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-charcoal/90 text-white text-xs font-medium tracking-wide rounded-xl opacity-0 -translate-x-2 pointer-events-none transition-all group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap hidden sm:block backdrop-blur-md shadow-lg">
        {t('gift.trigger', { defaultValue: 'Offer a Gift' })}
      </span>
    </motion.button>
  )
}
