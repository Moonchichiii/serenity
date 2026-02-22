import { apiClient } from "./client"
import { endpoints } from "./endpoints"
import type { GiftVoucherSubmission, GiftVoucherResponse } from "@/types/api"

type VoucherCreatePayload = {
  purchaser_name: string
  purchaser_email: string
  recipient_name: string
  recipient_email: string
  message: string
  preferred_date: string | null
}

export const vouchersApi = {
  create: async (data: GiftVoucherSubmission): Promise<GiftVoucherResponse> => {
    const payload: VoucherCreatePayload = {
      purchaser_name: data.purchaserName,
      purchaser_email: data.purchaserEmail,
      recipient_name: data.recipientName,
      recipient_email: data.recipientEmail,
      message: data.message ?? "",
      preferred_date: data.preferredDate ? data.preferredDate : null,
    }

    const res = await apiClient.post<GiftVoucherResponse>(
      endpoints.voucherCreate(),
      payload,
    )
    return res.data
  },
}
