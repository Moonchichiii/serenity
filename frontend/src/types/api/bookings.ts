export type BookingRequest = {
  service_id: number
  start_datetime: string
  end_datetime: string
  client_name: string
  client_email: string
  client_phone: string
  client_notes?: string
  preferred_language: 'fr' | 'en'
}

export type VoucherBookingRequest = BookingRequest & { voucher_code: string }

export type BookingResponse = {
  id: number
  service: { id: number; title_fr: string; title_en: string }
  start_datetime: string
  end_datetime: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  source: 'online' | 'voucher'
  client_name: string
  client_email: string
  confirmation_code: string
  voucher_code: string
}
