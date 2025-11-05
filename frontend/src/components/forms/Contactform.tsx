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
      console.error('Contact form error:', error)
      toast.error(t('contact.form.error', 'Error sending message. Please try again.'))
    }
  }

  const inputClass =
    'w-full pl-10 pr-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="name">
          {t('contact.form.name', 'Full Name')}
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
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
          <p className="text-sm text-terracotta-600 mt-1.5">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="email">
          {t('contact.form.email', 'Email')}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
          <input
            id="email"
            type="email"
            autoComplete="email"
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

      <div>
        <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="phone">
          {t('contact.form.phone', 'Phone')}{' '}
          <span className="text-charcoal/80 text-xs">
            {t('contact.form.optional', '(optional)')}
          </span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
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
          <p className="text-sm text-terracotta-600 mt-1.5">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="subject">
          {t('contact.form.subject', 'Subject')}
        </label>
        <input
          id="subject"
          type="text"
          placeholder={t('contact.form.subject.placeholder', 'Appointment request')}
          aria-invalid={!!errors.subject}
          className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors"
          {...register('subject')}
        />
        {errors.subject && (
          <p className="text-sm text-terracotta-600 mt-1.5">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="message">
          {t('contact.form.message', 'Message')}
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder={t(
            'contact.form.message.placeholder',
            'Describe your needs, your preferred date/time, or any questions you may have...'
          )}
          aria-invalid={!!errors.message}
          className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors resize-none"
          {...register('message')}
        />
        {errors.message && (
          <p className="text-sm text-terracotta-600 mt-1.5">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? t('contact.form.sending', 'Sending...')
          : t('contact.form.send', 'Send Message')}
      </Button>

      <p className="text-sm text-charcoal/80 text-center">
        {t(
          'contact.form.notice',
          'I will reply as soon as possible during business hours.'
        )}
      </p>
    </form>
  )
}
