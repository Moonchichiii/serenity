import { useMutation } from "@tanstack/react-query"
import { vouchersApi } from "@/api/vouchers.api"
import type { GiftVoucherSubmission, GiftVoucherResponse } from "@/types/api"

export function useCreateVoucher() {
  return useMutation<GiftVoucherResponse, unknown, GiftVoucherSubmission>({
    mutationFn: vouchersApi.create,
  })
}
