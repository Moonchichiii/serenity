import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { cmsHydratedQuery } from "@/queries/cms.queries";

// Raw query — for loaders, prefetching, or components that
// need loading/error states explicitly
export function useHydratedCMS() {
  return useQuery(cmsHydratedQuery());
}

// Slice selectors — loader-guaranteed, never undefined
export function useCMSPage() {
  const { data } = useSuspenseQuery({
    ...cmsHydratedQuery(),
    select: (d) => d.page,
  });
  return data;
}

export function useCMSServices() {
  const { data } = useSuspenseQuery({
    ...cmsHydratedQuery(),
    select: (d) => d.services,
  });
  return data;
}


export function useCMSGlobals() {
  const { data } = useSuspenseQuery({
    ...cmsHydratedQuery(),
    select: (d) => d.globals,
  });
  return data;
}
