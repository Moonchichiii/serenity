import { CorporateInquiryForm } from "@/components/forms/CorporateInquiryForm"
import { useModal } from "@/components/modal/useModal"

export default function CorporateModalScreen() {
  const { close, getPayload } = useModal()
  const payload = getPayload("corporate")

  return (
    <CorporateInquiryForm
      onSuccess={close}
      defaultEventType={payload?.defaultEventType || "corporate"}
    />
  )
}
