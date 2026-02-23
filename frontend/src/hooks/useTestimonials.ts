import { useMutation, useQuery } from '@tanstack/react-query'
import { testimonialsQuery, testimonialStatsQuery } from '@/queries/testimonials.queries'
import { replyToTestimonialMutationOptions, submitTestimonialMutationOptions } from '@/queries/testimonials.mutations'

export function useTestimonials(minRating: number) {
  return useQuery(testimonialsQuery(minRating))
}

export function useTestimonialStats() {
  return useQuery(testimonialStatsQuery())
}

export function useSubmitTestimonial() {
  return useMutation(submitTestimonialMutationOptions())
}

export function useReplyToTestimonial() {
  return useMutation(replyToTestimonialMutationOptions())
}
