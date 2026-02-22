import { apiClient } from "./client"
import { endpoints } from "./endpoints"

export type VoucherCreateInput = {
  purchaser_name: string
  purchaser_email: string
  recipient_name: string
  recipient_email: string
  message?: string
  preferred_date?: string | null
}

export type VoucherCreateResponse = { code: string }

export const vouchersApi = {
  create: async (data: VoucherCreateInput): Promise<VoucherCreateResponse> => {
    const res = await apiClient.post<VoucherCreateResponse>(endpoints.voucherCreate(), data)
    return res.data
  },
}
