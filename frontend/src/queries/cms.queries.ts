import { cmsApi } from "@/api/cms.api"
import { qk } from "@/lib/queryKeys"

export const cmsHydratedQuery = () => ({
  queryKey: qk.cmsHydrated(),
  queryFn: ({ signal }: { signal: AbortSignal }) =>
    cmsApi.hydrated({ signal }),
  staleTime: 5 * 60_000,
  gcTime: 60 * 60_000,
})
