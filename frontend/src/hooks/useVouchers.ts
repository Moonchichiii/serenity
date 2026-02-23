import { useMutation } from '@tanstack/react-query'
import { createVoucherMutationOptions } from '@/queries/vouchers.mutations'

export function useCreateVoucher() {
  return useMutation(createVoucherMutationOptions())
}
