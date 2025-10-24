import { motion } from 'framer-motion'
import { Phone, Mail, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { cmsAPI } from '@/api/cms'

type ContactFormData = {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}

const schema: yup.ObjectSchema<ContactFormData> = yup
  .object({
    name: yup.string().required('Le nom est requis').min(2, 'Le nom est trop court'),
    email: yup.string().required("L'email est requis").email('Email invalide'),
    phone: yup.string().optional().transform((v) => (v === '' ? undefined : v)),
    subject: yup.string().optional().transform((v) => (v === '' ? undefined : v)),
    message: yup.string().required('Le message est requis').min(10, 'Le message est trop court'),
  })
  .required()

export function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({ resolver: yupResolver(schema) })

  const onSubmit = async (data: ContactFormData) => {
    try {
      await (cmsAPI as any).submitContact({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        subject: data.subject || '',
        message: data.message,
      })
      toast.success('Message envoyé avec succès! ✨')
      reset()
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.")
    }
  }

  const inputClass =
    'w-full pl-10 pr-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors'

  return (
    <div>
      <section className="container mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        />
      </section>

      {/* Contact Form Section */}
      <section className="container mx-auto px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border-2 border-sage-200/30">
            <h2 className="text-2xl font-heading font-bold text-charcoal mb-6">
              Formulaire de contact
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="name">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Jean Dupont"
                    aria-invalid={!!errors.name}
                    className={inputClass}
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-terracotta-600 mt-1.5">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
                  <input
                    id="email"
                    type="email"
                    placeholder="jean.dupont@example.com"
                    aria-invalid={!!errors.email}
                    className={inputClass}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-terracotta-600 mt-1.5">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="phone">
                  Téléphone <span className="text-charcoal/50 text-xs">(optionnel)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+33 6 00 00 00 00"
                    aria-invalid={!!errors.phone}
                    className={inputClass}
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-terracotta-600 mt-1.5">{errors.phone.message}</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="subject">
                  Sujet <span className="text-charcoal/50 text-xs">(optionnel)</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Demande de rendez-vous"
                  aria-invalid={!!errors.subject}
                  className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors"
                  {...register('subject')}
                />
                {errors.subject && (
                  <p className="text-sm text-terracotta-600 mt-1.5">{errors.subject.message}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Décrivez vos besoins, vos préférences de date/heure, ou toute question que vous pourriez avoir..."
                  aria-invalid={!!errors.message}
                  className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors resize-none"
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-sm text-terracotta-600 mt-1.5">{errors.message.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </Button>

              <p className="text-sm text-charcoal/60 text-center">
                Je vous répondrai dans les plus brefs délais pendant les heures ouvrables.
              </p>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Contact
