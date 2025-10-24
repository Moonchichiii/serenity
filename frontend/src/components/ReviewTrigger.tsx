// src/components/ReviewTrigger.tsx
import { useState, useEffect } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ReviewSheet } from './ReviewSheet'

interface ReviewTriggerProps {
  targetSectionId: string
}

export function ReviewTrigger({ targetSectionId }: ReviewTriggerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const targetElement = document.getElementById(targetSectionId)
    if (!targetElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          setIsVisible(entry.isIntersecting)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(targetElement)
    return () => observer.disconnect()
  }, [targetSectionId])

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-40"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="flex flex-col items-center gap-1 bg-sage-600 text-white py-4 px-6 rounded-full shadow-lg hover:bg-sage-700 hover:scale-105 transition-all duration-300"
              aria-label="Laisser un avis"
            >
              <MessageSquarePlus className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs whitespace-nowrap font-medium">Laisser un avis</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <ReviewSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
