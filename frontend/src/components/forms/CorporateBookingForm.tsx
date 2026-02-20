import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  MapPin,
  Mail,
  Phone,
  User,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cmsAPI } from '@/api/cms'
import {
  createCorporateBookingSchema,
  corporateEventTypes,
  type CorporateBookingFormValues,
  type CorporateEventType,
} from '@/types/forms/corporateBooking'

interface CorporateBookingFormProps {
  onSuccess?: () => void
  defaultEventType?: CorporateEventType
}

export function CorporateBookingForm({
  onSuccess,
  defaultEventType = 'corporate',
}: CorporateBookingFormProps) {
  const { t } = useTranslation()
  const [showMore, setShowMore] = useState(false)

  const schema = useMemo(() => createCorporateBookingSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CorporateBookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventType: defaultEventType,
    },
  })

  const input =
    'w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors'
  const inputPlain =
    'w-full px-4 py-2.5 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors'

  const onSubmit = async (data: CorporateBookingFormValues) => {
    const subject = `${t('corp.subjectPrefix', 'Corporate/Event Booking')} • ${
      data.company
    } • ${data.eventType}`

    const lines = [
      `Contact: ${data.name} (${data.email}${
        data.phone ? `, ${data.phone}` : ''
      })`,
      `Company: ${data.company}`,
      `Event type: ${data.eventType}`,
      data.attendees ? `Attendees: ${data.attendees}` : null,
      data.date
        ? `Date: ${data.date}${data.endDate ? ` → ${data.endDate}` : ''}`
        : null,
      data.duration ? `Duration/Hours: ${data.duration}` : null,
      data.onSiteAddress ? `Location: ${data.onSiteAddress}` : null,
      data.services ? `Requested services: ${data.services}` : null,
      data.budget ? `Budget: ${data.budget}` : null,
      '',
      'Notes:',
      data.notes || '-',
    ]
      .filter(Boolean)
      .join('\n')

    try {
      await cmsAPI.submitContact({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        subject,
        message: lines,
      })
      toast.success(
        t('corp.form.success', 'Request sent! I will get back to you shortly. ✨'),
      )
      reset()
      onSuccess?.()
    } catch (err) {
      console.error('Corporate booking error:', err)
      toast.error(
        t('corp.form.error', 'Could not send your request. Please try again.'),
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 sm:space-y-5"
      noValidate
    >
      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="name">
            {t('corp.form.name', 'Full name')}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
            <input
              id="name"
              type="text"
              className={input}
              placeholder="Jane Doe"
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-terracotta-600 mt-1.5">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="email">
            {t('corp.form.email', 'Email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
            <input
              id="email"
              type="email"
              className={input}
              placeholder="jane@company.com"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-terracotta-600 mt-1.5">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="phone">
          {t('corp.form.phone', 'Phone')}{' '}
          <span className="text-xs text-charcoal/80">
            {t('corp.form.optional', '(optional)')}
          </span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
          <input
            id="phone"
            type="tel"
            className={input}
            placeholder="+33 6 00 00 00 00"
            {...register('phone')}
          />
        </div>
        {errors.phone && (
          <p className="text-sm text-terracotta-600 mt-1.5">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="company">
          {t('corp.form.company', 'Company/Organization')}
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
          <input
            id="company"
            type="text"
            className={input}
            placeholder="Acme SAS"
            {...register('company')}
          />
        </div>
        {errors.company && (
          <p className="text-sm text-terracotta-600 mt-1.5">
            {errors.company.message}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="eventType">
            {t('corp.form.eventType', 'Event type')}
          </label>
          <select id="eventType" className={inputPlain} {...register('eventType')}>
            {corporateEventTypes.map((v) => (
              <option key={v} value={v}>
                {v === 'corporate' && t('corp.form.eventType.corporate', 'Corporate wellness')}
                {v === 'team' && t('corp.form.eventType.team', 'Team day / offsite')}
                {v === 'expo' && t('corp.form.eventType.expo', 'Fair / expo / booth')}
                {v === 'private' && t('corp.form.eventType.private', 'Private event')}
                {v === 'other' && t('corp.form.eventType.other', 'Other')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="attendees">
            {t('corp.form.attendees', 'Estimated attendees')}
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
            <input
              id="attendees"
              type="number"
              className={input}
              placeholder="25"
              {...register('attendees')}
            />
          </div>
          {errors.attendees && (
            <p className="text-sm text-terracotta-600 mt-1.5">
              {errors.attendees.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="date">
            {t('corp.form.date', 'Date')}
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
            <input id="date" type="date" className={input} {...register('date')} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="endDate">
            {t('corp.form.endDate', 'End date (optional)')}
          </label>
          <input id="endDate" type="date" className={inputPlain} {...register('endDate')} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="onSiteAddress">
          {t('corp.form.location', 'Location / address')}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
          <input
            id="onSiteAddress"
            type="text"
            className={input}
            placeholder={t('corp.form.location.placeholder', 'Company address or venue')}
            {...register('onSiteAddress')}
          />
        </div>
      </div>

      <div className="border border-sage-200 rounded-xl bg-sage-50/40">
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-charcoal"
        >
          <span>{t('corp.form.moreDetailsLabel', 'Additional details (optional)')}</span>
          {showMore ? (
            <ChevronUp className="w-4 h-4 text-charcoal/60" />
          ) : (
            <ChevronDown className="w-4 h-4 text-charcoal/60" />
          )}
        </button>

        {showMore && (
          <div className="px-4 pb-4 pt-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="duration">
                {t('corp.form.duration', 'Hours / duration')}
              </label>
              <input
                id="duration"
                type="text"
                className={inputPlain}
                placeholder="09:00–17:00 or 3h"
                {...register('duration')}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="services">
                  {t('corp.form.services', 'Requested services')}
                </label>
                <input
                  id="services"
                  type="text"
                  className={inputPlain}
                  placeholder={t(
                    'corp.form.services.placeholder',
                    'Chair massage, 10-min rotations, 2 practitioners…',
                  )}
                  {...register('services')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="budget">
                  {t('corp.form.budget', 'Budget (optional)')}
                </label>
                <input
                  id="budget"
                  type="text"
                  className={inputPlain}
                  placeholder="€500–€1500"
                  {...register('budget')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2" htmlFor="notes">
                {t('corp.form.notes', 'Additional notes')}
              </label>
              <textarea
                id="notes"
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-sage-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-colors resize-none"
                placeholder={t(
                  'corp.form.notes.placeholder',
                  'Ambiance / space available, parking, access badges, etc.',
                )}
                {...register('notes')}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
        <p className="text-xs text-charcoal/80 leading-relaxed">
          <span className="font-semibold text-charcoal">
            {t('corp.form.gdpr.title', 'Privacy notice')}:
          </span>{' '}
          {t(
            'corp.form.gdpr.text',
            'This form emails your request directly. We do not store your data; it is used only to reply to you.',
          )}
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t('corp.form.sending', 'Sending...') : t('corp.form.send', 'Request quote')}
      </Button>

      <p className="text-sm text-charcoal/80 text-center">
        {t('corp.form.notice', 'We reply within one business day for corporate requests.')}
      </p>
    </form>
  )
}
