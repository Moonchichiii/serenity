import { useQuery } from '@tanstack/react-query'
import { cmsAPI } from '@/api/cms'
import type { HydratedPayload } from '@/types/hydrated'

export function useHydratedCMS() {
  return useQuery<HydratedPayload>({
    queryKey: ['cms', 'hydrated'],
    queryFn: cmsAPI.getHydrated,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })
}
