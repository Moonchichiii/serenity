import { apiClient } from './client'

export interface BookingRequest {
  service_id: number
  start_datetime: string // ISO format
  end_datetime: string // ISO format
  client_name: string
  client_email: string
  client_phone: string
  client_notes?: string
  preferred_language: 'fr' | 'en'
}

export interface BookingResponse {
  id: number
  service: {
    id: number
    title_fr: string
    title_en: string
  }
  start_datetime: string
  end_datetime: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  client_name: string
  client_email: string
  confirmation_code: string
  ics_file_url?: string
  google_calendar_event_id?: string
}

export interface AvailableSlot {
  datetime: string
  available: boolean
}

export const bookingsAPI = {
  create: (data: BookingRequest) =>
    apiClient.post<BookingResponse>('/api/bookings/', data).then((res) => res.data),

  getAvailability: (serviceId: number, date: string) =>
    apiClient
      .get<AvailableSlot[]>('/api/bookings/availability/', {
        params: { service_id: serviceId, date },
      })
      .then((res) => res.data),

  getByEmail: (email: string) =>
    apiClient
      .get<BookingResponse[]>('/api/bookings/', {
        params: { email },
      })
      .then((res) => res.data),
}
