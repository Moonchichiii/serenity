import { apiClient } from "./client"
import { endpoints } from "./endpoints"
import type {
  WagtailTestimonial,
  TestimonialSubmission,
  TestimonialSubmissionResponse,
  ReplySubmission,
  TestimonialStats,
} from "@/types/api"

export const testimonialsApi = {
  list: async (min_rating = 0): Promise<WagtailTestimonial[]> => {
    const res = await apiClient.get<WagtailTestimonial[]>(endpoints.testimonials(), {
      params: { min_rating },
    })
    return res.data
  },

  stats: async (): Promise<TestimonialStats> => {
    const res = await apiClient.get<TestimonialStats>(endpoints.testimonialStats())
    return res.data
  },

  submit: async (data: TestimonialSubmission): Promise<TestimonialSubmissionResponse> => {
    const res = await apiClient.post<TestimonialSubmissionResponse>(endpoints.testimonialSubmit(), data)
    return res.data
  },

  reply: async (id: number, data: ReplySubmission): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string }>(endpoints.testimonialReply(id), data)
    return res.data
  },
}


/* Tiny optional cleanups (worth doing for consistency)
1) Stick to one quote style + spacing

You’re mixing " and ' and sometimes long lines. Not “wrong”, but if you want extremely tight, pick one (I’d use single quotes everywhere).

2) vouchers.api.ts: normalize payload mapping style

This is already fine. If you want it slightly cleaner:

Use data.preferredDate ?? null

Use data.message ?? ''

preferred_date: data.preferredDate ?? null,
message: data.message ?? '',
3) testimonials.api.ts: naming consistency for params

You use min_rating (snake) to match backend query param — good. Internally you could use minRating and map to min_rating, but either is fine. If you want consistency with TS style:

list: async (minRating = 0) => {
  params: { min_rating: minRating }
}

Not required, just polish. */
