import { calendarApi } from "@/api/calendar.api"
import { qk } from "./keys"

export const busyDaysQuery = (year: number, month: number) => ({
  queryKey: qk.calendarBusy(year, month),
  queryFn: () => calendarApi.busy(year, month),
  staleTime: 5 * 60_000,
  gcTime: 60 * 60_000,
})

export const slotsQuery = (date: string) => ({
  queryKey: qk.calendarSlots(date),
  queryFn: () => calendarApi.slots(date),
  staleTime: 60_000,
  gcTime: 30 * 60_000,
})
