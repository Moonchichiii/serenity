import { apiClient } from './client'

/**
 * Wagtail Image structure returned by backend
 */
export interface WagtailImage {
  url: string
  title: string
  width?: number
  height?: number
}

/**
 * Hero slide with bilingual content and image
 */
export interface WagtailHeroSlide {
  title_en?: string
  title_fr?: string
  subtitle_en?: string
  subtitle_fr?: string
  image: WagtailImage | null
}

/**
 * Service with bilingual content
 */
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

/**
 * Homepage content - all CMS-managed fields
 * Backend returns bilingual content for all text fields
 */
export interface WagtailHomePage {
  hero_title_fr: string
  hero_title_en: string
  hero_subtitle_fr: string
  hero_subtitle_en: string
  hero_image: WagtailImage | null
  hero_slides?: WagtailHeroSlide[]
  about_title_fr: string
  about_title_en: string
  about_subtitle_fr: string
  about_subtitle_en: string
  about_intro_fr: string
  about_intro_en: string
  about_certification_fr: string
  about_certification_en: string
  about_approach_title_fr: string
  about_approach_title_en: string
  about_approach_text_fr: string
  about_approach_text_en: string
  about_specialties_title_fr: string
  about_specialties_title_en: string
  specialty_1_fr: string
  specialty_1_en: string
  specialty_2_fr: string
  specialty_2_en: string
  specialty_3_fr: string
  specialty_3_en: string
  specialty_4_fr: string
  specialty_4_en: string
  phone: string
  email: string
  address_fr: string
  address_en: string
}

/**
 * Testimonial structure - matches backend output
 * Backend now returns: name, text (language-aware), date, avatar
 */
export interface WagtailTestimonial {
  id: number
  name: string
  rating: number
  text: string  // Backend returns language-specific text based on request
  date: string  // Formatted date string (YYYY-MM-DD)
  avatar: string  // Generated avatar URL
}

/**
 * Testimonial submission structure
 */
export interface TestimonialSubmission {
  name: string
  email?: string
  rating: number
  text: string
}

/**
 * Response from testimonial submission
 */
export interface TestimonialSubmissionResponse {
  success: boolean
  message: string
  id: string
}

/**
 * Testimonial statistics
 */
export interface TestimonialStats {
  average_rating: number
  total_reviews: number
  five_star_count: number
  four_star_count: number
  three_star_count: number
  two_star_count: number
  one_star_count: number
}

/**
 * Contact form submission structure
 */
export interface ContactSubmission {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

/**
 * Response from contact submission
 */
export interface ContactSubmissionResponse {
  success: boolean
  message: string
}

/**
 * CMS API client
 * All endpoints fetch data from Wagtail CMS backend
 */
export const cmsAPI = {
  /**
   * Get homepage content with all bilingual fields
   */
  getHomePage: () =>
    apiClient.get<WagtailHomePage>('/api/homepage/').then(res => res.data),

  /**
   * Get all available services
   */
  getServices: () =>
    apiClient.get<WagtailService[]>('/api/services/').then(res => res.data),

  /**
   * Get testimonials
   * @param featured - Optional: filter for featured testimonials only
   */
  getTestimonials: (featured?: boolean) => {
    const params = featured ? '?featured=true' : ''
    return apiClient
      .get<WagtailTestimonial[]>(`/api/testimonials/${params}`)
      .then(res => res.data)
  },

  /**
   * Submit a new testimonial
   */
  submitTestimonial: (data: TestimonialSubmission) =>
    apiClient
      .post<TestimonialSubmissionResponse>('/api/testimonials/submit/', data)
      .then(res => res.data),

  /**
   * Get testimonial statistics (averages and counts)
   */
  getTestimonialStats: () =>
    apiClient.get<TestimonialStats>('/api/testimonials/stats/').then(res => res.data),

  /**
   * Submit contact form
   */
  submitContact: (data: ContactSubmission) =>
    apiClient
      .post<ContactSubmissionResponse>('/api/contact/submit/', data)
      .then(res => res.data),
}

/**
 * Helper function to get language-specific text from bilingual object
 * @param obj - Object with _en and _fr suffixed properties
 * @param field - Base field name (without language suffix)
 * @param lang - Language code ('en' or 'fr')
 */
export function getLocalizedText<T extends Record<string, any>>(
  obj: T,
  field: string,
  lang: 'en' | 'fr'
): string {
  const key = `${field}_${lang}` as keyof T
  return (obj[key] as string) || ''
}
