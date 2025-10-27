import Modal from '@/components/ui/Modal'
import { useModal } from '@/shared/hooks/useModal'
import { ContactForm } from '@/components/forms/Contactform'
import { useTranslation } from 'react-i18next'

export default function ContactModal() {
  const { isOpen, close } = useModal()
  const { t } = useTranslation()

  return (
    <Modal
      isOpen={isOpen('contact')}
      onClose={() => close('contact')}
      title={t('contact.form.title', 'Contact')}
    >
      <ContactForm onSuccess={() => close('contact')} />
    </Modal>
  )
}
