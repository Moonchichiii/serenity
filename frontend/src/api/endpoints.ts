export const endpoints = {
  cmsHydrated: () => "/api/homepage/hydrated/",

  calendarBusy: () => "/api/calendar/busy/",
  calendarSlots: () => "/api/calendar/slots/",

  bookings: () => "/api/bookings/",
  bookingsVoucher: () => "/api/bookings/voucher/",
  bookingCancel: (code: string) => `/api/bookings/cancel/${code}/`,

  contactSubmit: () => "/api/contact/submit/",

  testimonials: () => "/api/testimonials/",
  testimonialSubmit: () => "/api/testimonials/submit/",
  testimonialReply: (id: number) => `/api/testimonials/${id}/reply/`,
  testimonialStats: () => "/api/testimonials/stats/",

  voucherCreate: () => "/api/vouchers/create/",
} as const
