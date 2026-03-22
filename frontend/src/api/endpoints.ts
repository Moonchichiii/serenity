export const endpoints = {
  cmsHydrated: () => "/api/homepage/hydrated/",
  contactSubmit: () => "/api/contact/submit/",
  testimonials: () => "/api/testimonials/",
  testimonialSubmit: () => "/api/testimonials/submit/",
  testimonialReply: (id: number) => `/api/testimonials/${id}/reply/`,
  testimonialStats: () => "/api/testimonials/stats/",
  calendarBusy: () => "/api/calendar/busy/",
  calendarSlots: () => "/api/calendar/slots/",
  paymentsCheckout: () => "/api/payments/checkout/",
  paymentsStatus: () => "/api/payments/status/",
} as const;
