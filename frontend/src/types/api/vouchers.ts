export interface GiftVoucherSubmission {
  purchaserName: string
  purchaserEmail: string
  recipientName: string
  recipientEmail: string
  message?: string
  preferredDate?: string
}

export interface GiftVoucherResponse {
  ok: boolean
  code: string
}
