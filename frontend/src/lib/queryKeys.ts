export const qk = {
  cmsHydrated: () => ['cms', 'hydrated'] as const,

  calendarBusy: (year: number, month: number) =>
    ['calendar', 'busy', year, month] as const,

  calendarSlots: (dateIso: string) =>
    ['calendar', 'slots', dateIso] as const,

  testimonials: (minRating: number) =>
    ['testimonials', 'list', minRating] as const,

  testimonialStats: () =>
    ['testimonials', 'stats'] as const,
} as const
