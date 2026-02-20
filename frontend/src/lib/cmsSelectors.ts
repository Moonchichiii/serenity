import { useQueryClient } from '@tanstack/react-query'
import { cmsHydratedQuery } from '@/lib/cmsQuery'
import type { HydratedPayload } from '@/types/hydrated'
import type {
  WagtailHomePage,
  WagtailService,
  WagtailTestimonial,
} from '@/types/api'

/**
 * Cache-read selectors — zero fetching, zero useQuery.
 *
 * The root loader (`__root.tsx`) calls `ensureHydratedCMS(queryClient)`
 * before any route renders, so the cache is guaranteed to be warm.
 * If it isn't, the invariant will surface a loud, actionable error
 * instead of a silent `undefined`.
 */

function invariant<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(
      `[cmsSelectors] "${label}" missing from QueryClient cache. ` +
        'Ensure the __root loader calls ensureHydratedCMS(queryClient) ' +
        'before any child route renders.',
    )
  }
  return value
}

function useHydratedPayload(): HydratedPayload {
  const qc = useQueryClient()
  return invariant(
    qc.getQueryData<HydratedPayload>(cmsHydratedQuery().queryKey),
    'HydratedPayload',
  )
}

export function useCMSPage(): WagtailHomePage {
  return useHydratedPayload().page
}

export function useCMSServices(): WagtailService[] {
  return useHydratedPayload().services
}

export function useCMSTestimonials(): WagtailTestimonial[] {
  return useHydratedPayload().testimonials
}
