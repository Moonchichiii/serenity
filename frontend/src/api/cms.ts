import { apiClient } from './client'

export interface WagtailImage {
  title: string
  url: string
  width?: number
  height?: number
}

export interface WagtailHeroSlide {
  title_en?: string
  title_fr?: string
  subtitle_en?: string
  subtitle_fr?: string
  image: WagtailImage | null
}

export interface WagtailSpecialty {
  title_en?: string
  title_fr?: string
  image?: WagtailImage | null
}

export interface WagtailService {
  id: number
  title_fr: string
  title_en: string
  description_fr: string
  description_en: string
  duration_minutes: number
  price: string
  image: WagtailImage | null
  is_available: boolean
}

export interface WagtailHomePage {
  // Hero section
  hero_title_en: string
  hero_title_fr: string
  hero_subtitle_en: string
  hero_subtitle_fr: string
  hero_image: WagtailImage | null
  hero_slides?: WagtailHeroSlide[]

  // About section headers
  about_title_en: string
  about_title_fr: string
  about_subtitle_en: string
  about_subtitle_fr: string

  // About introduction
  about_intro_en: string
  about_intro_fr: string
  about_certification_en: string
  about_certification_fr: string

  // About approach
  about_approach_title_en: string
  about_approach_title_fr: string
  about_approach_text_en: string
  about_approach_text_fr: string

  // About specialties
  about_specialties_title_en: string
  about_specialties_title_fr: string
  specialties?: WagtailSpecialty[]

  // Contact information
  phone: string
  email: string
  address_en: string
  address_fr: string

  // Services hero section
  services_hero_title_en: string
  services_hero_title_fr: string
  services_hero_pricing_label_en: string
  services_hero_pricing_label_fr: string
  services_hero_price_en: string
  services_hero_price_fr: string
  services_hero_cta_en: string
  services_hero_cta_fr: string
  services_hero_benefit_1_en: string
  services_hero_benefit_1_fr: string
  services_hero_benefit_2_en: string
  services_hero_benefit_2_fr: string
  services_hero_benefit_3_en: string
  services_hero_benefit_3_fr: string
  services_hero_video_public_id: string | null
  services_hero_video_url?: string | null
  services_hero_poster_image: WagtailImage | null
}

// --- NEW REPLY INTERFACES ---
export interface WagtailReply {
  id: number
  name: string
  text: string
  created_at: string
}

export interface ReplySubmission {
  name: string
  email: string
  text: string
}
// -----------------------------

export interface WagtailTestimonial {
  id: number
  name: string
  rating: number
  text: string
  date: string
  avatar: string
  // Added replies property
  replies: WagtailReply[]
}

export interface TestimonialSubmission {
  name: string
  email?: string
  rating: number
  text: string
}

export interface TestimonialSubmissionResponse {
  success: boolean
  message: string
  id: string
}

export interface TestimonialStats {
  average_rating: number
  total_reviews: number
  five_star_count: number
  four_star_count: number
  three_star_count: number
  two_star_count: number
  one_star_count: number
}

export interface ContactSubmission {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export interface ContactSubmissionResponse {
  success: boolean
  message: string
}

export const cmsAPI = {
  getHomePage: (): Promise<WagtailHomePage> =>
    apiClient.get<WagtailHomePage>('/api/homepage/').then((res) => res.data),

  getServices: (): Promise<WagtailService[]> =>
    apiClient.get<WagtailService[]>('/api/services/').then((res) => res.data),

  getTestimonials: (minRating?: number): Promise<WagtailTestimonial[]> => {
    const params =
      typeof minRating === 'number' ? `?min_rating=${minRating}` : ''
    return apiClient
      .get<WagtailTestimonial[]>(`/api/testimonials/${params}`)
      .then((res) => res.data)
  },

  submitTestimonial: (
    data: TestimonialSubmission
  ): Promise<TestimonialSubmissionResponse> =>
    apiClient
      .post<TestimonialSubmissionResponse>('/api/testimonials/submit/', data)
      .then((res) => res.data),

  // --- NEW REPLY METHOD ---
  submitReply: (
    id: number,
    data: ReplySubmission
  ): Promise<{ success: boolean; message: string }> =>
    apiClient
      .post<{ success: boolean; message: string }>(
        `/api/testimonials/${id}/reply/`,
        data
      )
      .then((res) => res.data),
  // ------------------------

  getTestimonialStats: (): Promise<TestimonialStats> =>
    apiClient
      .get<TestimonialStats>('/api/testimonials/stats/')
      .then((res) => res.data),

  submitContact: (
    data: ContactSubmission
  ): Promise<ContactSubmissionResponse> =>
    apiClient
      .post<ContactSubmissionResponse>('/api/contact/submit/', data)
      .then((res) => res.data),
}

// Extract localized text from bilingual content objects
export function getLocalizedText<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  lang: 'en' | 'fr'
): string {
  const key = `${field}_${lang}` as keyof T
  return (obj[key] as string) || ''
}
