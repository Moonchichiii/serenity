import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  testimonialsQuery,
  testimonialStatsQuery,
} from "@/queries/testimonials.queries";
import {
  replyToTestimonialMutationOptions,
  submitTestimonialMutationOptions,
} from "@/queries/testimonials.mutations";

export function useTestimonials(minRating: number) {
  return useQuery(testimonialsQuery(minRating));
}

export function useTestimonialStats() {
  return useQuery(testimonialStatsQuery());
}

export function useSubmitTestimonial() {
  const qc = useQueryClient();
  return useMutation(submitTestimonialMutationOptions(qc));
}

export function useReplyToTestimonial() {
  const qc = useQueryClient();
  return useMutation(replyToTestimonialMutationOptions(qc));
}
