import { useQueryClient } from '@tanstack/react-query'
import { cmsHydratedQuery } from '@/lib/cmsQuery'
import type { HydratedPayload } from '@/types/hydrated'
import type { WagtailService, WagtailTestimonial, WagtailHomePage, GlobalSettings } from '@/types/api'

function invariant<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message)
  return value
}

/**
 * Root loader guarantees this exists.
 * If missing, it means loader wasn’t wired or route wasn’t hit.
 */
export function useHydratedCMSData(): HydratedPayload {
  const queryClient = useQueryClient()
  const data = queryClient.getQueryData<HydratedPayload>(cmsHydratedQuery().queryKey)
  return invariant(
    data,
    'Hydrated CMS payload missing. Ensure __root loader calls ensureHydratedCMS(queryClient).'
  )
}

export function useCMSPage(): WagtailHomePage {
  return useHydratedCMSData().page
}

export function useCMSServices(): WagtailService[] {
  return useHydratedCMSData().services
}

export function useCMSTestimonials(): WagtailTestimonial[] {
  return useHydratedCMSData().testimonials
}

export function useCMSGlobals(): GlobalSettings {
  return useHydratedCMSData().globals
}
