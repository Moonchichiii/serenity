import { apiClient } from "./client"
import { endpoints } from "./endpoints"

export type BookingRequest = {
  service_id: number
  start_datetime: string
  end_datetime: string
  client_name: string
  client_email: string
  client_phone: string
  client_notes?: string
  preferred_language: "fr" | "en"
}

export type VoucherBookingRequest = BookingRequest & { voucher_code: string }

export type BookingResponse = {
  id: number
  service: { id: number; title_fr: string; title_en: string }
  start_datetime: string
  end_datetime: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  source: "online" | "voucher"
  client_name: string
  client_email: string
  confirmation_code: string
  voucher_code: string
}

export const bookingsApi = {
  create: async (data: BookingRequest): Promise<BookingResponse> => {
    const res = await apiClient.post<BookingResponse>(endpoints.bookings(), data)
    return res.data
  },

  createVoucher: async (data: VoucherBookingRequest): Promise<BookingResponse> => {
    const res = await apiClient.post<BookingResponse>(endpoints.bookingsVoucher(), data)
    return res.data
  },

  byEmail: async (email: string): Promise<BookingResponse[]> => {
    const res = await apiClient.get<BookingResponse[]>(endpoints.bookings(), { params: { email } })
    return res.data
  },

  cancel: async (confirmationCode: string): Promise<{ detail: string }> => {
    const res = await apiClient.delete<{ detail: string }>(endpoints.bookingCancel(confirmationCode))
    return res.data
  },
}
