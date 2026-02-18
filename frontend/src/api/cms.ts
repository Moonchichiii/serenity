import { apiClient } from './client'
import type {
  WagtailHomePage,
  WagtailService,
  WagtailTestimonial,
  TestimonialSubmission,
  TestimonialSubmissionResponse,
  ReplySubmission,
  TestimonialStats,
  ContactSubmission,
  ContactSubmissionResponse,
  GlobalSettings,
  GiftVoucherSubmission,
  GiftVoucherResponse
} from '@/types/api'

export const cmsAPI = {
  getHomePage: (): Promise<WagtailHomePage> =>
    apiClient.get<WagtailHomePage>('/api/homepage/').then((res) => res.data),

  getServices: (): Promise<WagtailService[]> =>
    apiClient.get<WagtailService[]>('/api/services/').then((res) => res.data),

  getTestimonials: (minRating?: number): Promise<WagtailTestimonial[]> => {
    const params = typeof minRating === 'number' ? `?min_rating=${minRating}` : ''
    return apiClient
      .get<WagtailTestimonial[]>(`/api/testimonials/${params}`)
      .then((res) => res.data)
  },

  submitTestimonial: (data: TestimonialSubmission): Promise<TestimonialSubmissionResponse> =>
    apiClient
      .post<TestimonialSubmissionResponse>('/api/testimonials/submit/', data)
      .then((res) => res.data),

  submitReply: (id: number, data: ReplySubmission): Promise<{ success: boolean; message: string }> =>
    apiClient
      .post<{ success: boolean; message: string }>(`/api/testimonials/${id}/reply/`, data)
      .then((res) => res.data),

  getTestimonialStats: (): Promise<TestimonialStats> =>
    apiClient.get<TestimonialStats>('/api/testimonials/stats/').then((res) => res.data),

  submitContact: (data: ContactSubmission): Promise<ContactSubmissionResponse> =>
    apiClient
      .post<ContactSubmissionResponse>('/api/contact/submit/', data)
      .then((res) => res.data),

  getGlobals: (): Promise<GlobalSettings> =>
    apiClient.get<GlobalSettings>('/api/globals/').then((res) => res.data),

  submitVoucher: (data: GiftVoucherSubmission): Promise<GiftVoucherResponse> => {
    const payload = {
      purchaser_name: data.purchaserName,
      purchaser_email: data.purchaserEmail,
      recipient_name: data.recipientName,
      recipient_email: data.recipientEmail,
      message: data.message || '',
      preferred_date: data.preferredDate ? data.preferredDate : null,
    }

    return apiClient
      .post<GiftVoucherResponse>('/api/vouchers/create/', payload)
      .then((res) => res.data)
  },
}

export function getLocalizedText(
  obj: unknown,
  field: string,
  lang: 'en' | 'fr'
): string {
  if (!obj || typeof obj !== 'object') return ''

  const key = `${field}_${lang}`

  // We tell TS: "Trust us, this is an object we can read keys from"
  // casting to Record<string, unknown> allows dynamic key access
  return ((obj as Record<string, unknown>)[key] as string) || ''
}
