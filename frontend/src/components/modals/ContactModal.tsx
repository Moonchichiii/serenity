import Modal from '@/components/ui/Modal'
import { useModal } from '@/shared/hooks/useModal'
import { ContactForm } from '@/components/forms/Contactform'
import { CorporateBookingForm } from '@/components/forms/CorporateBookingForm'
import { useTranslation } from 'react-i18next'

export default function ContactModal() {
  const { isOpen, close, getPayload } = useModal()
  const { t } = useTranslation()

  const contactPayload = getPayload('contact')
  const corporatePayload = getPayload('corporate')

  return (
    <>
      <Modal
        isOpen={isOpen('contact')}
        onClose={() => close('contact')}
        title={t('contact.form.title', 'Contact')}
      >
        <ContactForm
          onSuccess={() => close('contact')}
          defaultSubject={contactPayload?.defaultSubject}
        />
      </Modal>

      <Modal
        isOpen={isOpen('corporate')}
        onClose={() => close('corporate')}
        title={t('corp.form.title', 'Corporate / Event Booking')}
      >
        <CorporateBookingForm
          onSuccess={() => close('corporate')}
          defaultEventType={corporatePayload?.defaultEventType || 'corporate'}
        />
      </Modal>
    </>
  )
}
