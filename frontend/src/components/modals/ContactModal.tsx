import Modal from '@/components/ui/Modal'
import { useModal } from '@/hooks/useModal'
import { ContactForm } from '@/components/forms/Contactform'
import { useTranslation } from 'react-i18next'

export default function ContactModal() {
  const { isOpen, close, getPayload } = useModal()
  const { t } = useTranslation()

  const contactPayload = getPayload('contact')

  return (
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
  )
}
