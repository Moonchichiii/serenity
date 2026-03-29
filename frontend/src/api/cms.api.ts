import { apiClient } from "./client"
import { endpoints } from "./endpoints"
import type { HydratedPayload } from "@/types/hydrated"

export const cmsApi = {
  hydrated: async (config?: { signal?: AbortSignal }): Promise<HydratedPayload> => {
    const res = await apiClient.get<HydratedPayload>(endpoints.cmsHydrated(), {
      signal: config?.signal,
    })
    return res.data
  },
}
