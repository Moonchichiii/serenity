import { apiClient } from './client'

export interface WagtailImage {
  url: string
  title: string
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
  hero_title_fr: string
  hero_title_en: string
  hero_subtitle_fr: string
  hero_subtitle_en: string
  hero_image: WagtailImage | null
  hero_slides?: WagtailHeroSlide[]
  about_title_fr: string
  about_title_en: string
  about_text_fr?: string
  about_text_en?: string
  phone: string
  email: string
  address_fr: string
  address_en: string
}

export interface WagtailTestimonial {
  id: string
  name: string
  rating: number
  text: string
  date: string
  avatar: string
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
}

export const cmsAPI = {
  getHomePage: () =>
    apiClient.get<WagtailHomePage>('/api/homepage/').then(res => res.data),

  getServices: () =>
    apiClient.get<WagtailService[]>('/api/services/').then(res => res.data),

  getTestimonials: () =>
    apiClient.get<WagtailTestimonial[]>('/api/testimonials/').then(res => res.data),

  submitTestimonial: (data: TestimonialSubmission) =>
    apiClient.post<TestimonialSubmissionResponse>('/api/testimonials/submit/', data).then(res => res.data),

  getTestimonialStats: () =>
    apiClient.get<TestimonialStats>('/api/testimonials/stats/').then(res => res.data),
}
