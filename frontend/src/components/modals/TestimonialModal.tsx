import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Send, Star } from 'lucide-react'
import { cmsAPI, type WagtailTestimonial } from '@/api/cms'

interface Props {
  isOpen: boolean
  onClose: () => void
  testimonial: WagtailTestimonial | null
}

export function TestimonialModal({ isOpen, onClose, testimonial }: Props) {
  const [replyText, setReplyText] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  if (!testimonial) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      await cmsAPI.submitReply(testimonial.id, { name, email, text: replyText })
      setStatus('success')
      setReplyText('')
    } catch (err) {
      console.error(err)
      setStatus('idle')
      alert("Error submitting reply")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header / Main Testimonial */}
            <div className="p-6 sm:p-8 border-b border-sage-100 bg-cream-50 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {testimonial.avatar ? (
                    <img
                      src={testimonial.avatar}
                      // FIX: Added alt text
                      alt={`${testimonial.name}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-sage-200 flex items-center justify-center font-bold text-charcoal">
                      {testimonial.name[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-heading font-bold text-lg text-charcoal">{testimonial.name}</h3>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < testimonial.rating ? 'fill-honey-400 text-honey-400' : 'text-charcoal/20'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                {/* FIX: Added aria-label */}
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-charcoal/60" />
                </button>
              </div>

              <p className="text-charcoal/80 text-lg leading-relaxed italic">
                "{testimonial.text}"
              </p>
              <p className="text-xs text-charcoal/50 mt-4 uppercase tracking-wider font-medium">{testimonial.date}</p>
            </div>

            {/* Discussion Area */}
            <div className="flex-1 overflow-y-auto bg-white p-6 sm:p-8">
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-charcoal/50 mb-6">
                <MessageCircle className="w-4 h-4" />
                Discussion
              </h4>

              {/* Existing Replies */}
              <div className="space-y-6 mb-8">
                {testimonial.replies && testimonial.replies.length > 0 ? (
                   testimonial.replies.map((reply) => (
                    <div key={reply.id} className="pl-4 border-l-2 border-sage-200">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-semibold text-charcoal text-sm">{reply.name}</span>
                        <span className="text-xs text-charcoal/40">Earlier</span>
                      </div>
                      <p className="text-charcoal/70 text-sm leading-relaxed">{reply.text}</p>
                    </div>
                   ))
                ) : (
                  <p className="text-charcoal/40 text-sm italic text-center py-4">No replies yet. Be the first to respond!</p>
                )}
              </div>

              {/* Reply Form */}
              <div className="bg-cream-50/50 rounded-2xl p-5 border border-sage-100">
                {status === 'success' ? (
                  <div className="text-center py-4 text-sage-600">
                    <p className="font-medium">Thank you for your reply!</p>
                    <p className="text-sm">It has been sent for moderation.</p>
                    <button onClick={() => setStatus('idle')} className="mt-3 text-xs underline">Write another</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <p className="text-sm font-semibold text-charcoal/80 mb-2">Join the conversation</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="author_name"
                        id="reply_name"
                        autoComplete="name"
                        required
                        placeholder="Your Name"
                        className="bg-white px-4 py-2 rounded-xl border border-sage-200 text-sm focus:outline-none focus:border-sage-400"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                      <input
                        type="email"
                        name="author_email"
                        id="reply_email"
                        autoComplete="email"
                        required
                        placeholder="Email (Private)"
                        className="bg-white px-4 py-2 rounded-xl border border-sage-200 text-sm focus:outline-none focus:border-sage-400"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                    <textarea
                      name="reply_text"
                      id="reply_text"
                      required
                      placeholder="Write your response..."
                      rows={3}
                      className="w-full bg-white px-4 py-2 rounded-xl border border-sage-200 text-sm focus:outline-none focus:border-sage-400 resize-none"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button
                        disabled={status === 'submitting'}
                        type="submit"
                        className="flex items-center gap-2 bg-charcoal text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-charcoal/80 transition-colors disabled:opacity-50"
                      >
                        {status === 'submitting' ? 'Sending...' : 'Post Reply'}
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
