import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslation } from 'react-i18next'
import { Gift, Mail, User, Calendar, MessageSquare, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cmsAPI } from '@/api/cms'
import toast from 'react-hot-toast'

// Changed optional (?) to string. Inputs are always strings (empty or filled).
type GiftFormData = {
  purchaserName: string
  purchaserEmail: string
  recipientName: string
  recipientEmail: string
  message: string
  preferredDate: string
}

interface GiftFormProps {
  onSuccess?: () => void
}

export function GiftForm({ onSuccess }: GiftFormProps) {
  const { t } = useTranslation()
  const [successCode, setSuccessCode] = useState<string | null>(null)

  const schema = yup.object({
    purchaserName: yup.string().required(t('gift.validation.required')),
    purchaserEmail: yup.string().email(t('gift.validation.email')).required(t('gift.validation.required')),
    recipientName: yup.string().required(t('gift.validation.required')),
    recipientEmail: yup.string().email(t('gift.validation.email')).required(t('gift.validation.required')),
    // Removed strict .optional() logic; let them be strings (Django handles empty strings fine)
    message: yup.string().default(''),
    preferredDate: yup.string().default(''),
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GiftFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      message: '',
      preferredDate: ''
    }
  })

  const onSubmit = async (data: GiftFormData) => {
    try {
      const res = await cmsAPI.submitVoucher({
        purchaserName: data.purchaserName,
        purchaserEmail: data.purchaserEmail,
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
        // Send empty strings if undefined; Django DRF will handle "" for blank=True fields
        message: data.message || '',
        preferredDate: data.preferredDate || undefined,
      })

      setSuccessCode(res.code)
      toast.success(t('gift.form.successTitle'))
      reset()
    } catch (error) {
      console.error(error)
      toast.error(t('contact.form.error'))
    }
  }

  const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors text-charcoal bg-white"
  const labelClass = "block text-sm font-medium text-charcoal mb-1.5"

  if (successCode) {
    return (
      <div className="text-center py-8 px-4 space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-heading font-bold text-charcoal">
          {t('gift.form.successTitle')}
        </h3>
        <p className="text-charcoal/70 max-w-sm mx-auto">
          {t('gift.form.successMessage')}
        </p>

        <div className="bg-sand-50 border border-sage-200 rounded-xl p-6 max-w-xs mx-auto mt-6">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 font-bold mb-2">
            {t('gift.form.codeLabel')}
          </p>
          <p className="text-3xl font-mono font-bold text-terracotta-500 tracking-wider">
            {successCode}
          </p>
        </div>

        <Button onClick={onSuccess} className="w-full mt-6">
          {t('gift.form.close')}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Section: Purchaser */}
      <div className="bg-sage-50/50 p-4 rounded-2xl space-y-4 border border-sage-100">
        <h4 className="text-sm font-bold uppercase tracking-wider text-charcoal/60 flex items-center gap-2">
          <User className="w-4 h-4" />
          {t('gift.form.purchaserSection')}
        </h4>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t('gift.form.purchaserName')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input type="text" {...register('purchaserName')} className={inputClass} placeholder="Jane Doe" />
            </div>
            {errors.purchaserName && <p className="text-xs text-terracotta-500 mt-1">{errors.purchaserName.message}</p>}
          </div>

          <div>
            <label className={labelClass}>{t('gift.form.purchaserEmail')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input type="email" {...register('purchaserEmail')} className={inputClass} placeholder="jane@example.com" />
            </div>
            {errors.purchaserEmail && <p className="text-xs text-terracotta-500 mt-1">{errors.purchaserEmail.message}</p>}
          </div>
        </div>
      </div>

      {/* Section: Recipient */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-charcoal/60 flex items-center gap-2 px-1">
          <Gift className="w-4 h-4" />
          {t('gift.form.recipientSection')}
        </h4>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t('gift.form.recipientName')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input type="text" {...register('recipientName')} className={inputClass} placeholder="Recipient Name" />
            </div>
            {errors.recipientName && <p className="text-xs text-terracotta-500 mt-1">{errors.recipientName.message}</p>}
          </div>

          <div>
            <label className={labelClass}>{t('gift.form.recipientEmail')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input type="email" {...register('recipientEmail')} className={inputClass} placeholder="recipient@example.com" />
            </div>
            {errors.recipientEmail && <p className="text-xs text-terracotta-500 mt-1">{errors.recipientEmail.message}</p>}
          </div>
        </div>

        <div>
            <label className={labelClass}>{t('gift.form.message')}</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-charcoal/40" />
              <textarea
                {...register('message')}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder={t('gift.form.messagePlaceholder')}
              />
            </div>
        </div>

        <div>
            <label className={labelClass}>{t('gift.form.date')}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input type="date" {...register('preferredDate')} className={inputClass} />
            </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t('gift.form.sending') : t('gift.form.submit')}
      </Button>
    </form>
  )
}
