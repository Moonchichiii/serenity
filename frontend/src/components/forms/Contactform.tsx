import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button } from '@/components/ui/Button'
import { Mail, Phone, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { cmsAPI } from '@/api/cms'

type ContactFormData = {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

interface ContactFormProps {
  onSuccess?: () => void
  defaultSubject?: string
}

export function ContactForm({ onSuccess, defaultSubject }: ContactFormProps) {
  const { t } = useTranslation()

  const schema: yup.ObjectSchema<ContactFormData> = yup
    .object({
      name: yup
        .string()
        .required(t('contact.form.validation.nameRequired', 'Name is required'))
        .min(2, t('contact.form.validation.nameTooShort', 'Name is too short')),
      email: yup
        .string()
        .required(t('contact.form.validation.emailRequired', 'Email is required'))
        .email(t('contact.form.validation.emailInvalid', 'Invalid email')),
      phone: yup
        .string()
        .optional()
        .transform((v) => (v === '' ? undefined : v)),
      subject: yup
        .string()
        .required(t('contact.form.validation.subjectRequired', 'Subject is required')),
      message: yup
        .string()
        .required(t('contact.form.validation.messageRequired', 'Message is required'))
        .min(10, t('contact.form.validation.messageTooShort', 'Message is too short')),
    })
    .required()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      subject: defaultSubject || '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      await cmsAPI.submitContact({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        subject: data.subject,
        message: data.message,
      })

      toast.success(t('contact.form.success', 'Message sent successfully! ✨'))
      reset()
      onSuccess?.()
    } catch (error) {
      console.error('Contact form submission error:', error)
      toast.error(t('contact.form.error', 'Error sending message. Please try again.'))
    }
  }

  // Optimized Input Class: text-base prevents iOS zoom, py-2.5 is better for mobile vertical space
  const inputClass = 'w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors text-base text-charcoal appearance-none'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

      {/* Group Name & Email on larger screens to save vertical space */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5" htmlFor="name">
            {t('contact.form.name', 'Full Name')}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
            <input
              id="name"
              type="text"
              placeholder="Jean Dupont"
              autoComplete="name"
              aria-invalid={!!errors.name}
              className={inputClass}
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-terracotta-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5" htmlFor="email">
            {t('contact.form.email', 'Email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="jean@example.com"
              aria-invalid={!!errors.email}
              className={inputClass}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-terracotta-600 mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Phone Field */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1.5" htmlFor="phone">
          {t('contact.form.phone', 'Phone')}{' '}
          <span className="text-charcoal/80 text-xs">
            {t('contact.form.optional', '(optional)')}
          </span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+33 6 00 00 00 00"
            aria-invalid={!!errors.phone}
            className={inputClass}
            {...register('phone')}
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-terracotta-600 mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Subject Field */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1.5" htmlFor="subject">
          {t('contact.form.subject', 'Subject')}
        </label>
        <input
          id="subject"
          type="text"
          placeholder={t('contact.form.subject.placeholder', 'Appointment request')}
          aria-invalid={!!errors.subject}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors text-base text-charcoal"
          {...register('subject')}
        />
        {errors.subject && (
          <p className="text-xs text-terracotta-600 mt-1">{errors.subject.message}</p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1.5" htmlFor="message">
          {t('contact.form.message', 'Message')}
        </label>
        <textarea
          id="message"
          rows={4}
          placeholder={t(
            'contact.form.message.placeholder',
            'Describe your needs...'
          )}
          aria-invalid={!!errors.message}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors resize-none text-base text-charcoal"
          {...register('message')}
        />
        {errors.message && (
          <p className="text-xs text-terracotta-600 mt-1">{errors.message.message}</p>
        )}
      </div>

      {/* GDPR Privacy Notice - Compact */}
      <div className="bg-sage-50 rounded-lg p-3 border border-sage-200">
        <p className="text-[10px] sm:text-xs text-charcoal/80 leading-relaxed">
          <span className="font-semibold text-charcoal">
            {t('contact.form.gdpr.title', 'Privacy Notice')}:
          </span>{' '}
          {t(
            'contact.form.gdpr.text',
            'We do not store your data; it is used only to respond to your inquiry.'
          )}
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? t('contact.form.sending', 'Sending...')
          : t('contact.form.send', 'Send Message')}
      </Button>
    </form>
  )
}
