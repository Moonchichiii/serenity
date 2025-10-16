import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

type Props = {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: Props) {
    const overlayRef = useRef<HTMLDivElement>(null)

    // Close on ESC
    useEffect(() => {
        if (!isOpen) return
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [isOpen, onClose])

    // Prevent background scroll when open
    useEffect(() => {
        if (!isOpen) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [isOpen])

    const overlay = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={overlayRef}
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    aria-modal="true"
                    role="dialog"
                    onMouseDown={(e) => {
                        // Close when clicking outside
                        if (e.target === overlayRef.current) onClose()
                    }}
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                    <motion.div
                        className="relative z-10 w-[92vw] max-w-lg rounded-2xl bg-white p-6 shadow-elevated border-2 border-sage-200/50"
                        initial={{ y: 20, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 10, opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            {title ? (
                                <h3 className="text-xl font-heading font-semibold text-charcoal">{title}</h3>
                            ) : <span aria-hidden />}

                            <button
                                onClick={onClose}
                                className="rounded-lg p-2 text-charcoal/60 hover:text-charcoal hover:bg-sand-100 transition"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return createPortal(overlay, document.body)
}

export default Modal
