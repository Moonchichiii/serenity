import { mutationOptions } from '@tanstack/react-query'
import { testimonialsApi } from '@/api/testimonials.api'
import { normalizeHttpError, type ApiError } from '@/api/httpError'
import { qk } from '@/lib/queryKeys'
import { queryClient } from '@/lib/queryClient'
import type { ReplySubmission, TestimonialSubmission } from '@/types/api'

export const submitTestimonialMutationOptions = () =>
  mutationOptions({
    mutationKey: ['testimonials', 'submit'],
    mutationFn: async (payload: TestimonialSubmission) => {
      try {
        return await testimonialsApi.submit(payload)
      } catch (e) {
        throw normalizeHttpError(e) as ApiError
      }
    },
    onSuccess: () => {
      // New testimonial is pending moderation, but stats
      // may update if auto-approved in the future
      queryClient.invalidateQueries({
        queryKey: qk.testimonialStats(),
      })
    },
  })

export const replyToTestimonialMutationOptions = () =>
  mutationOptions({
    mutationKey: ['testimonials', 'reply'],
    mutationFn: async (vars: { id: number; data: ReplySubmission }) => {
      try {
        return await testimonialsApi.reply(vars.id, vars.data)
      } catch (e) {
        throw normalizeHttpError(e) as ApiError
      }
    },
    onSuccess: () => {
      // Reply is pending, but invalidate list so approved
      // replies show up once moderated
      queryClient.invalidateQueries({
        queryKey: ['testimonials'],
      })
    },
  })
