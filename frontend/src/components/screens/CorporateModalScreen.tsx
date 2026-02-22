import { useTranslation } from 'react-i18next'
import { CorporateBookingForm } from '@/components/forms/CorporateBookingForm'
import { useModal } from '@/components/modal/useModal'

export default function CorporateModalScreen() {
  const { t } = useTranslation()
  const { close, getPayload } = useModal()

  const payload = getPayload('corporate')

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-heading font-semibold text-charcoal">
        {t('corp.form.title', 'Corporate / Event Booking')}
      </h2>

      <CorporateBookingForm
        onSuccess={close}
        defaultEventType={payload?.defaultEventType || 'corporate'}
      />
    </div>
  )
}
