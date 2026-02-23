import { useQuery } from '@tanstack/react-query'
import { busyDaysQuery, slotsQuery } from '@/queries/calendar.queries'

export function useBusyDays(year: number, month: number) {
  return useQuery(busyDaysQuery(year, month))
}

export function useSlots(dateIso: string) {
  return useQuery(slotsQuery(dateIso))
}
