import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  scrollable?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Lock background scroll
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const overlay = (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={overlayRef}
          className="
            fixed inset-0 z-[9999]
            h-[100dvh] w-screen overflow-hidden
            flex flex-col items-center justify-end sm:justify-center
            p-0 sm:p-4
          "
          aria-modal="true"
          role="dialog"
          onMouseDown={(e) => {
            if (e.target === overlayRef.current) onClose()
          }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className={cn(
              'relative z-10 bg-white flex flex-col',
              'shadow-elevated border-t-2 sm:border-2 border-sage-200/50',
              'w-full sm:w-[92vw] max-w-lg',
              'max-h-[85dvh] sm:max-h-[85vh]',
              'rounded-t-2xl sm:rounded-2xl',
              className,
            )}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-sage-100 shrink-0 bg-white rounded-t-2xl">
              {title ? (
                <h3 className="text-lg sm:text-xl font-heading font-semibold text-charcoal pr-4 truncate">
                  {title}
                </h3>
              ) : (
                <span aria-hidden />
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-2 -mr-2 text-charcoal/60 hover:text-charcoal hover:bg-sand-100 transition"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
              <div className="p-5 sm:p-6 pb-safe-area-bottom">
                {children}
                <div className="h-6 sm:h-2" aria-hidden="true" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return createPortal(overlay, document.body)
}

export default Modal
