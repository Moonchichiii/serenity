import type { QueryClient } from '@tanstack/react-query'
import { cmsAPI } from '@/api/cms'
import type { HydratedPayload } from '@/types/hydrated'

export const cmsHydratedQuery = () => ({
  queryKey: ['cms', 'hydrated'] as const,
  queryFn: cmsAPI.getHydrated,
})

export async function ensureHydratedCMS(
  queryClient: QueryClient
): Promise<HydratedPayload> {
  return queryClient.ensureQueryData(cmsHydratedQuery())
}
