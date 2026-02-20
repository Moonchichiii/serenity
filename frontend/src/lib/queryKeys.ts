export const qk = {
  cmsHydrated: () => ['cms', 'hydrated'] as const,
  calendarBusy: (year: number, month: number) => ['calendar', 'busy', year, month] as const,
  calendarSlots: (dateIso: string) => ['calendar', 'slots', dateIso] as const,
  bookingsByEmail: (email: string) => ['bookings', 'byEmail', email] as const,
}
