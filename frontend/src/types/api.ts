export interface ResponsiveImage {
  title: string
  width?: number | null
  height?: number | null
  src: string | null
  srcset?: string | null
  sizes?: string | null
}

export interface WagtailHeroSlide {
  title_en?: string
  title_fr?: string
  subtitle_en?: string
  subtitle_fr?: string
  image: ResponsiveImage | null
}

export interface WagtailSpecialty {
  title_en?: string
  title_fr?: string
  image?: ResponsiveImage | null
}

export interface WagtailService {
  id: number
  title_fr: string
  title_en: string
  description_fr: string
  description_en: string
  duration_minutes: number
  price: string
  image: ResponsiveImage | null
  is_available: boolean
}

export interface WagtailHomePage {
  hero_title_en: string
  hero_title_fr: string
  hero_subtitle_en: string
  hero_subtitle_fr: string

  hero_image: ResponsiveImage | null
  hero_slides?: WagtailHeroSlide[]

  about_title_en: string
  about_title_fr: string
  about_subtitle_en: string
  about_subtitle_fr: string
  about_intro_en: string
  about_intro_fr: string
  about_certification_en: string
  about_certification_fr: string
  about_approach_title_en: string
  about_approach_title_fr: string
  about_approach_text_en: string
  about_approach_text_fr: string
  about_specialties_title_en: string
  about_specialties_title_fr: string
  specialties?: WagtailSpecialty[]

  phone: string
  email: string
  address_en: string
  address_fr: string

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

  services_hero_poster_image: ResponsiveImage | null
}

// Testimonials etc unchanged
export interface WagtailReply {
  id: number
  name: string
  text: string
  date: string
}

export interface ReplySubmission {
  name: string
  email: string
  text: string
}

export interface WagtailTestimonial {
  id: number
  name: string
  rating: number
  text: string
  date: string
  avatar: string
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

// ✅ Make globals use the same image type
export interface GlobalSettings {
  gift: {
    is_enabled: boolean
    floating_icon: ResponsiveImage | null
    // If you also have voucher_image, add it here:
    // voucher_image: ResponsiveImage | null

    modal_title_en: string
    modal_title_fr: string
    modal_text_en: string
    modal_text_fr: string
    form_message_placeholder_en: string
    form_message_placeholder_fr: string
    form_submit_label_en: string
    form_submit_label_fr: string
    form_sending_label_en: string
    form_sending_label_fr: string
    form_success_title_en: string
    form_success_title_fr: string
    form_success_message_en: string
    form_success_message_fr: string
    form_code_label_en: string
    form_code_label_fr: string
  }
}

export interface GiftVoucherSubmission {
  purchaserName: string
  purchaserEmail: string
  recipientName: string
  recipientEmail: string
  message?: string
  preferredDate?: string
}

export interface GiftVoucherResponse {
  ok: boolean
  code: string
}
