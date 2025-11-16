import Modal from '@/components/ui/Modal'
import { useModal } from '@/shared/hooks/useModal'
import { CorporateBookingForm } from '@/components/forms/CorporateBookingForm'
import { useTranslation } from 'react-i18next'

export default function CorporateModal() {
  const { isOpen, close, getPayload } = useModal()
  const { t } = useTranslation()

  const corporatePayload = getPayload('corporate')

  return (
    <Modal
      isOpen={isOpen('corporate')}
      onClose={() => close('corporate')}
      title={t('corp.form.title', 'Corporate / Event Booking')}
      scrollable
      className="
        w-[96vw]
        max-w-3xl md:max-w-4xl
        p-6 sm:p-7 md:p-8
        rounded-3xl
      "
    >
      <CorporateBookingForm
        onSuccess={() => close('corporate')}
        defaultEventType={corporatePayload?.defaultEventType || 'corporate'}
      />
    </Modal>
  )
}
