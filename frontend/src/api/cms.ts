import { apiClient } from './client'
import type { HydratedPayload } from '@/types/hydrated'
import type {
  GiftVoucherSubmission,
  GiftVoucherResponse,
} from '@/types/api'

/**
 * Read-only CMS endpoints.
 * Single entry point for SPA content hydration.
 */
export const cmsAPI = {
  getHydrated: async (): Promise<HydratedPayload> => {
    const res = await apiClient.get<HydratedPayload>(
      '/api/homepage/hydrated/'
    )
    return res.data
  },
}

/**
 * CMS-related mutations.
 * Explicitly separated from read model.
 */
export const cmsMutations = {
  submitVoucher: async (
    data: GiftVoucherSubmission
  ): Promise<GiftVoucherResponse> => {
    const payload = {
      purchaser_name: data.purchaserName,
      purchaser_email: data.purchaserEmail,
      recipient_name: data.recipientName,
      recipient_email: data.recipientEmail,
      message: data.message ?? '',
      preferred_date: data.preferredDate ?? null,
    }

    const res = await apiClient.post<GiftVoucherResponse>(
      '/api/vouchers/create/',
      payload
    )

    return res.data
  },
}
