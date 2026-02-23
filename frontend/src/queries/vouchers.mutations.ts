import { mutationOptions } from '@tanstack/react-query'
import { vouchersApi } from '@/api/vouchers.api'
import { normalizeHttpError, type ApiError } from '@/api/httpError'
import type { GiftVoucherSubmission, GiftVoucherResponse } from '@/types/api'

export const createVoucherMutationOptions = () =>
  mutationOptions<GiftVoucherResponse, ApiError, GiftVoucherSubmission>({
    mutationKey: ['vouchers', 'create'],
    mutationFn: async (payload) => {
      try {
        return await vouchersApi.create(payload)
      } catch (e) {
        throw normalizeHttpError(e)
      }
    },
  })
