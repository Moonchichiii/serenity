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
