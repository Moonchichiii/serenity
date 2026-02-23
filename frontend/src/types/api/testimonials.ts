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
