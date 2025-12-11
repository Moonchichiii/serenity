import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslation } from 'react-i18next'
import { Gift, Mail, User, Calendar, MessageSquare, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cmsAPI, type GlobalSettings } from '@/api/cms'
import toast from 'react-hot-toast'

// Inputs are always strings (empty or filled).
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
  settings?: GlobalSettings['gift'] | null
}

export function GiftForm({ onSuccess, settings }: GiftFormProps) {
  const { t, i18n } = useTranslation()
  const [successCode, setSuccessCode] = useState<string | null>(null)

  const lang: 'en' | 'fr' = i18n.language.startsWith('fr') ? 'fr' : 'en'

  const schema = yup.object({
    purchaserName: yup.string().required(t('gift.validation.required')),
    purchaserEmail: yup
      .string()
      .email(t('gift.validation.email'))
      .required(t('gift.validation.required')),
    recipientName: yup.string().required(t('gift.validation.required')),
    recipientEmail: yup
      .string()
      .email(t('gift.validation.email'))
      .required(t('gift.validation.required')),
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
      preferredDate: '',
    },
  })

  // Helper: pick CMS override (per language) or fall back to i18n
  const fromCms = (
    enValue: string | undefined,
    frValue: string | undefined,
    i18nKey: string,
    defaultValue?: string
  ) => {
    const cmsValue = lang === 'fr' ? frValue : enValue
    if (cmsValue && cmsValue.trim().length > 0) return cmsValue
    return defaultValue !== undefined ? t(i18nKey, defaultValue) : t(i18nKey)
  }

  const messagePlaceholder = fromCms(
    settings?.form_message_placeholder_en,
    settings?.form_message_placeholder_fr,
    'gift.form.messagePlaceholder'
  )

  const submitLabel = fromCms(
    settings?.form_submit_label_en,
    settings?.form_submit_label_fr,
    'gift.form.submit'
  )

  const sendingLabel = fromCms(
    settings?.form_sending_label_en,
    settings?.form_sending_label_fr,
    'gift.form.sending'
  )

  const successTitleText = fromCms(
    settings?.form_success_title_en,
    settings?.form_success_title_fr,
    'gift.form.successTitle'
  )

  const successMessageText = fromCms(
    settings?.form_success_message_en,
    settings?.form_success_message_fr,
    'gift.form.successMessage'
  )

  const codeLabelText = fromCms(
    settings?.form_code_label_en,
    settings?.form_code_label_fr,
    'gift.form.codeLabel'
  )

  const onSubmit = async (data: GiftFormData) => {
    try {
      // IMPORTANT: use camelCase here – cmsAPI.submitVoucher converts to snake_case
      const res = await cmsAPI.submitVoucher({
        purchaserName: data.purchaserName,
        purchaserEmail: data.purchaserEmail,
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
        message: data.message || '',
        preferredDate: data.preferredDate || undefined,
      })

      setSuccessCode(res.code)
      toast.success(successTitleText)
      reset()
    } catch (error) {
      console.error(error)
      toast.error(t('contact.form.error'))
    }
  }

  const inputClass =
    'w-full pl-10 pr-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors text-base text-charcoal bg-white'
  const labelClass = 'block text-sm font-medium text-charcoal mb-1.5'

  if (successCode) {
    return (
      <div className="text-center py-8 px-4 space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-heading font-bold text-charcoal">
          {successTitleText}
        </h3>
        <p className="text-charcoal/70 max-w-sm mx-auto">
          {successMessageText}
        </p>

        <div className="bg-sand-50 border border-sage-200 rounded-xl p-6 max-w-xs mx-auto mt-6">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 font-bold mb-2">
            {codeLabelText}
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
    // Slightly tighter for mobile
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
      {/* Section: Purchaser */}
      <div className="bg-sage-50/50 p-4 rounded-2xl space-y-3 border border-sage-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/60 flex items-center gap-2">
          <User className="w-3.5 h-3.5" />
          {t('gift.form.purchaserSection')}
        </h4>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className={labelClass}>{t('gift.form.purchaserName')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input
                type="text"
                {...register('purchaserName')}
                className={inputClass}
                placeholder="Jane Doe"
              />
            </div>
            {errors.purchaserName && (
              <p className="text-xs text-terracotta-500 mt-1">
                {errors.purchaserName.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>{t('gift.form.purchaserEmail')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input
                type="email"
                {...register('purchaserEmail')}
                className={inputClass}
                placeholder="jane@example.com"
              />
            </div>
            {errors.purchaserEmail && (
              <p className="text-xs text-terracotta-500 mt-1">
                {errors.purchaserEmail.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section: Recipient */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/60 flex items-center gap-2 px-1">
          <Gift className="w-3.5 h-3.5" />
          {t('gift.form.recipientSection')}
        </h4>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className={labelClass}>{t('gift.form.recipientName')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input
                type="text"
                {...register('recipientName')}
                className={inputClass}
                placeholder="Recipient Name"
              />
            </div>
            {errors.recipientName && (
              <p className="text-xs text-terracotta-500 mt-1">
                {errors.recipientName.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>{t('gift.form.recipientEmail')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
              <input
                type="email"
                {...register('recipientEmail')}
                className={inputClass}
                placeholder="recipient@example.com"
              />
            </div>
            {errors.recipientEmail && (
              <p className="text-xs text-terracotta-500 mt-1">
                {errors.recipientEmail.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>{t('gift.form.message')}</label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-charcoal/40" />
            <textarea
              {...register('message')}
              rows={3}
              className={`${inputClass} resize-none py-3`}
              placeholder={messagePlaceholder}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>{t('gift.form.date')}</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
            <input
              type="date"
              {...register('preferredDate')}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
        {isSubmitting ? sendingLabel : submitLabel}
      </Button>
    </form>
  )
}
