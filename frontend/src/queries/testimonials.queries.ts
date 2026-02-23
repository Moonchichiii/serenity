import { queryOptions } from '@tanstack/react-query'
import { testimonialsApi } from '@/api/testimonials.api'
import { qk } from '@/lib/queryKeys'

export const testimonialsQuery = (minRating: number) =>
  queryOptions({
    queryKey: qk.testimonials(minRating),
    queryFn: () => testimonialsApi.list(minRating),
    staleTime: 5 * 60_000,
    gcTime: 60 * 60_000,
  })

export const testimonialStatsQuery = () =>
  queryOptions({
    queryKey: qk.testimonialStats(),
    queryFn: testimonialsApi.stats,
    staleTime: 5 * 60_000,
    gcTime: 60 * 60_000,
  })
