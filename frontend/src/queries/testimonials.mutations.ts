import { mutationOptions } from '@tanstack/react-query'
import { testimonialsApi } from '@/api/testimonials.api'
import { normalizeHttpError, type ApiError } from '@/api/httpError'
import { qk } from '@/lib/queryKeys'
import { queryClient } from '@/lib/queryClient'

// Derive types from API functions (eliminates drift)
type SubmitFn = typeof testimonialsApi.submit
type SubmitInput = Parameters<SubmitFn>[0]
type SubmitOutput = Awaited<ReturnType<SubmitFn>>

type ReplyFn = typeof testimonialsApi.reply
type ReplyId = Parameters<ReplyFn>[0]
type ReplyInput = Parameters<ReplyFn>[1]
type ReplyOutput = Awaited<ReturnType<ReplyFn>>

export const submitTestimonialMutationOptions = () =>
  mutationOptions<SubmitOutput, ApiError, SubmitInput>({
    mutationKey: ['testimonials', 'submit'],
    mutationFn: async (payload) => {
      try {
        return await testimonialsApi.submit(payload)
      } catch (e) {
        throw normalizeHttpError(e)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.testimonialStats() })
    },
  })

export const replyToTestimonialMutationOptions = () =>
  mutationOptions<ReplyOutput, ApiError, { id: ReplyId; data: ReplyInput }>({
    mutationKey: ['testimonials', 'reply'],
    mutationFn: async (vars) => {
      try {
        return await testimonialsApi.reply(vars.id, vars.data)
      } catch (e) {
        throw normalizeHttpError(e)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
  })
