import { apiClient } from './client'

// Image from backend (matches your serializer)
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
  // other sections
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
  id: number
  client_name: string
  text_fr: string
  text_en: string
  rating: number
  created_at: string
}

export const cmsAPI = {
  getHomePage: () =>
    apiClient.get<WagtailHomePage>('/api/homepage/').then(res => res.data),
  getServices: () =>
    apiClient.get<WagtailService[]>('/api/services/').then(res => res.data),
  getTestimonials: (featured?: boolean) =>
    apiClient
      .get<WagtailTestimonial[]>('/api/testimonials/', {
        params: featured ? { featured: true } : {},
      })
      .then(res => res.data),
}
