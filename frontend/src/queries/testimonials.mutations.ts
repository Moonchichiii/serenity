import { mutationOptions } from '@tanstack/react-query'
import { testimonialsApi } from '@/api/testimonials.api'
import { normalizeHttpError, type ApiError } from '@/api/httpError'
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
  })
