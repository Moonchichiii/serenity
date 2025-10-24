// src/components/ReviewSheet.tsx
import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cmsAPI } from '@/api/cms'

interface ReviewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReviewSheet({ open, onOpenChange }: ReviewSheetProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Clear previous messages
    setSuccessMessage('')
    setErrorMessage('')

    // Validation
    if (rating === 0 || !name.trim() || !text.trim()) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (text.trim().length < 10) {
      setErrorMessage('Votre avis doit contenir au moins 10 caractères')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await cmsAPI.submitTestimonial({
        name: name.trim(),
        email: email.trim(),
        rating,
        text: text.trim(),
      })

      setSuccessMessage(response.message || 'Merci ! Votre avis sera publié après validation.')

      // Reset form
      setTimeout(() => {
        setRating(0)
        setName('')
        setEmail('')
        setText('')
        setSuccessMessage('')
        onOpenChange(false)

        // Notify banner to refresh (only if 4-5 stars)
        if (rating >= 4) {
          window.dispatchEvent(new CustomEvent('testimonialSubmitted'))
        }
      }, 2000)

    } catch (error: any) {
      console.error('Testimonial submission error:', error)

      const errorMsg = error.response?.data?.errors?.text
        || error.response?.data?.errors?.name
        || error.response?.data?.message
        || "Une erreur s'est produite lors de l'envoi"

      setErrorMessage(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Sheet Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-charcoal">
                    Laissez un avis
                  </h2>
                  <p className="text-sm text-charcoal/60 mt-1">
                    Partagez votre expérience avec nos services
                  </p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="text-charcoal/60 hover:text-charcoal transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Success Message */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-sage-100 border border-sage-300 rounded-lg"
                >
                  <p className="text-sage-800 text-sm">{successMessage}</p>
                </motion.div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg"
                >
                  <p className="text-red-800 text-sm">{errorMessage}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Stars */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Votre note <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-1" role="radiogroup" aria-label="Note sur 5 étoiles">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={star === rating}
                        aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sage-500 rounded"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoveredRating || rating)
                              ? 'fill-honey-500 text-honey-500'
                              : 'text-gray-300'
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
                    Votre nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marie Dupont"
                    maxLength={100}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-sage-200 rounded-xl focus:outline-none focus:border-sage-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Email Field (Optional) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                    Email (optionnel)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marie@example.com"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-sage-200 rounded-xl focus:outline-none focus:border-sage-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-charcoal/60 mt-1">
                    Pour vous recontacter si besoin
                  </p>
                </div>

                {/* Review Text */}
                <div>
                  <label htmlFor="review" className="block text-sm font-medium text-charcoal mb-2">
                    Votre avis <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="review"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Parlez-nous de votre expérience..."
                    rows={5}
                    maxLength={500}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-sage-200 rounded-xl focus:outline-none focus:border-sage-500 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-charcoal/60 mt-1">
                    {text.length}/500 caractères
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sage-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Soumettre l\'avis'}
                </button>

                <p className="text-xs text-center text-charcoal/60">
                  Votre avis sera publié après validation par notre équipe
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
