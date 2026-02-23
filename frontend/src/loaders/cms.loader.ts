import type { QueryClient } from '@tanstack/react-query'
import { cmsHydratedQuery } from '@/queries/cms.queries'

export async function ensureHydratedCMS(queryClient: QueryClient) {
  await queryClient.ensureQueryData(cmsHydratedQuery())
}
