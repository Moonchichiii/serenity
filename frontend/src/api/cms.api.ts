import { apiClient } from "./client"
import { endpoints } from "./endpoints"
import type { HydratedPayload } from "@/types/hydrated"

export const cmsApi = {
  hydrated: async (): Promise<HydratedPayload> => {
    const res = await apiClient.get<HydratedPayload>(endpoints.cmsHydrated())
    return res.data
  },
}
