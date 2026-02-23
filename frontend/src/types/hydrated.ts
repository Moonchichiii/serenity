import type {
  WagtailHomePage,
  WagtailService,
  WagtailTestimonial,
  GlobalSettings,
} from '@/types/api'

export interface HydratedPayload {
  page: WagtailHomePage
  services: WagtailService[]
  testimonials: WagtailTestimonial[]
  globals: GlobalSettings
}
