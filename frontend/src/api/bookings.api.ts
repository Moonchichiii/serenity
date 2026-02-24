import { apiClient } from "./client"
import { endpoints } from "./endpoints"
import type {
  BookingRequest,
  VoucherBookingRequest,
  BookingResponse,
} from '@/types/api'

export type { BookingRequest, VoucherBookingRequest, BookingResponse }
export const bookingsApi = {
  create: async (data: BookingRequest): Promise<BookingResponse> => {
    const res = await apiClient.post<BookingResponse>(
      endpoints.bookings(),
      data,
    )
    return res.data
  },

  createVoucher: async (
    data: VoucherBookingRequest,
  ): Promise<BookingResponse> => {
    const res = await apiClient.post<BookingResponse>(
      endpoints.bookingsVoucher(),
      data,
    )
    return res.data
  },

  byEmail: async (email: string): Promise<BookingResponse[]> => {
    const res = await apiClient.get<BookingResponse[]>(endpoints.bookings(), {
      params: { email },
    })
    return res.data
  },

  cancel: async (confirmationCode: string): Promise<{ detail: string }> => {
    const res = await apiClient.delete<{ detail: string }>(
      endpoints.bookingCancel(confirmationCode),
    )
    return res.data
  },
}
