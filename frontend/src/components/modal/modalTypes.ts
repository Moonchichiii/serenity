export type LegalPageKey =
  | "legal"
  | "privacy"
  | "cookies"
  | "terms"
  | "accessibility"

export type ModalId =
  | "contact"
  | "corporate"
  | "gift"
  | "booking"
  | "legal"
  | "cmsLogin"

export type ModalPayloadMap = {
  contact: { defaultSubject?: string }
  corporate: {
    defaultEventType?: "corporate" | "team" | "expo" | "private" | "other"
  }
  gift: undefined
  booking: { serviceId?: number } | undefined
  legal: { page?: LegalPageKey }
  cmsLogin: undefined
}

export type ModalState =
  | { id: null; payload: null }
  | { id: ModalId; payload: ModalPayloadMap[ModalId] | null }
