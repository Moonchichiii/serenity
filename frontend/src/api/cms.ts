import { apiClient } from './client'

// Wagtail Image
export interface WagtailImage {
  title: string
  url: string
  width?: number
  height?: number
}

// Hero slide
export interface WagtailHeroSlide {
  title_en?: string
  title_fr?: string
  subtitle_en?: string
  subtitle_fr?: string
  image: WagtailImage | null
}

// Specialty (image+title)
export interface WagtailSpecialty {
  title_en?: string
  title_fr?: string
  image?: WagtailImage | null
}

// Service
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

// Homepage content
export interface WagtailHomePage {
  // Hero
  hero_title_en: string
  hero_title_fr: string
  hero_subtitle_en: string
  hero_subtitle_fr: string
  hero_image: WagtailImage | null
  hero_slides?: WagtailHeroSlide[]

  // About – Header
  about_title_en: string
  about_title_fr: string
  about_subtitle_en: string
  about_subtitle_fr: string

  // About – Intro
  about_intro_en: string
  about_intro_fr: string
  about_certification_en: string
  about_certification_fr: string

  // About – Approach
  about_approach_title_en: string
  about_approach_title_fr: string
  about_approach_text_en: string
  about_approach_text_fr: string

  // About — Specialties (image + title only)
  about_specialties_title_en: string
  about_specialties_title_fr: string
  specialties?: WagtailSpecialty[]

  // Contact info
  phone: string
  email: string
  address_en: string
  address_fr: string

  // Services Hero
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
  services_hero_poster_image: WagtailImage | null
}

// Testimonial
export interface WagtailTestimonial {
  id: number
  name: string
  rating: number
  text: string
  date: string
  avatar: string
}

// Testimonial submission
export interface TestimonialSubmission {
  name: string
  email?: string
  rating: number
  text: string
}

// Testimonial submission response
export interface TestimonialSubmissionResponse {
  success: boolean
  message: string
  id: string
}

// Testimonial statistics
export interface TestimonialStats {
  average_rating: number
  total_reviews: number
  five_star_count: number
  four_star_count: number
  three_star_count: number
  two_star_count: number
  one_star_count: number
}

// Contact submission
export interface ContactSubmission {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

// Contact submission response
export interface ContactSubmissionResponse {
  success: boolean
  message: string
}

// CMS API client
export const cmsAPI = {
  // Get homepage content
  getHomePage: () =>
    apiClient.get<WagtailHomePage>('/api/homepage/').then(res => res.data),

  // Get all available services
  getServices: () =>
    apiClient.get<WagtailService[]>('/api/services/').then(res => res.data),

  // Get testimonials (optional minRating)
  getTestimonials: (minRating?: number) => {
    const params = typeof minRating === 'number' ? `?min_rating=${minRating}` : ''
    return apiClient
      .get<WagtailTestimonial[]>(`/api/testimonials/${params}`)
      .then(res => res.data)
  },

  // Submit a new testimonial
  submitTestimonial: (data: TestimonialSubmission) =>
    apiClient
      .post<TestimonialSubmissionResponse>('/api/testimonials/submit/', data)
      .then(res => res.data),

  // Get testimonial statistics
  getTestimonialStats: () =>
    apiClient.get<TestimonialStats>('/api/testimonials/stats/').then(res => res.data),

  // Submit contact form
  submitContact: (data: ContactSubmission) =>
    apiClient
      .post<ContactSubmissionResponse>('/api/contact/submit/', data)
      .then(res => res.data),
}

// Helper: get language-specific text from bilingual object
export function getLocalizedText<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  lang: 'en' | 'fr'
): string {
  const key = `${field}_${lang}` as keyof T
  return (obj[key] as string) || ''
}
