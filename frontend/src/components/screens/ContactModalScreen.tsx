import { useTranslation } from 'react-i18next'
import { ContactForm } from '@/components/forms/Contactform'
import { useModal } from '@/components/modal/useModal'

export default function ContactModalScreen() {
  const { t } = useTranslation()
  const { close, getPayload } = useModal()

  const payload = getPayload('contact')

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-heading font-semibold text-charcoal">
        {t('contact.form.title', 'Contact')}
      </h2>

      <ContactForm
        onSuccess={close}
        defaultSubject={payload?.defaultSubject}
      />
    </div>
  )
}
