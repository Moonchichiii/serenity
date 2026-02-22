export const qk = {
  cmsHydrated: () => ["cms", "hydrated"] as const,

  calendarBusy: (year: number, month: number) => ["calendar", "busy", year, month] as const,
  calendarSlots: (date: string) => ["calendar", "slots", date] as const,

  bookingsByEmail: (email: string) => ["bookings", "byEmail", email] as const,

  testimonials: (minRating: number) => ["testimonials", "list", minRating] as const,
  testimonialStats: () => ["testimonials", "stats"] as const,
}
