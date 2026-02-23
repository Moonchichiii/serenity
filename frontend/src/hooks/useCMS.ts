import { useQuery } from '@tanstack/react-query'
import { cmsHydratedQuery } from '@/queries/cms.queries'

export function useHydratedCMS() {
  return useQuery(cmsHydratedQuery())
}
