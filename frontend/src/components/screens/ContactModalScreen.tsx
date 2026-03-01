import { ContactForm } from "@/components/forms/Contactform"
import { useModal } from "@/components/modal/useModal"

export default function ContactModalScreen() {
  const { close, getPayload } = useModal()
  const payload = getPayload("contact")

  return (
    <ContactForm
      onSuccess={close}
      defaultSubject={payload?.defaultSubject}
    />
  )
}
