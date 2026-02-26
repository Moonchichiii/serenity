import { mutationOptions } from '@tanstack/react-query'
import { vouchersApi } from '@/api/vouchers.api'
import { normalizeHttpError, type ApiError } from '@/api/httpError'

// Derive types from the API function
type CreateVoucherFn = typeof vouchersApi.create
type CreateVoucherInput = Parameters<CreateVoucherFn>[0]
type CreateVoucherOutput = Awaited<ReturnType<CreateVoucherFn>>

export const createVoucherMutationOptions = () =>
  mutationOptions<CreateVoucherOutput, ApiError, CreateVoucherInput>({
    mutationKey: ['vouchers', 'create'],
    mutationFn: async (payload) => {
      try {
        return await vouchersApi.create(payload)
      } catch (e) {
        throw normalizeHttpError(e)
      }
    },
  })
