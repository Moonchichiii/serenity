import { describe, expect, it } from "vitest";
import { endpoints } from "@/api/endpoints";

describe("endpoints", () => {
  it("cmsHydrated returns correct path", () => {
    expect(endpoints.cmsHydrated()).toBe("/api/homepage/hydrated/");
  });

  it("contactSubmit returns correct path", () => {
    expect(endpoints.contactSubmit()).toBe("/api/contact/submit/");
  });

  it("testimonials returns correct path", () => {
    expect(endpoints.testimonials()).toBe("/api/testimonials/");
  });

  it("testimonialSubmit returns correct path", () => {
    expect(endpoints.testimonialSubmit()).toBe(
      "/api/testimonials/submit/"
    );
  });

  it("testimonialReply interpolates ID", () => {
    expect(endpoints.testimonialReply(42)).toBe(
      "/api/testimonials/42/reply/"
    );
  });

  it("testimonialStats returns correct path", () => {
    expect(endpoints.testimonialStats()).toBe(
      "/api/testimonials/stats/"
    );
  });

  it("calendarBusy returns correct path", () => {
    expect(endpoints.calendarBusy()).toBe("/api/calendar/busy/");
  });

  it("calendarSlots returns correct path", () => {
    expect(endpoints.calendarSlots()).toBe("/api/calendar/slots/");
  });

  it("paymentsCheckout returns correct path", () => {
    expect(endpoints.paymentsCheckout()).toBe(
      "/api/payments/checkout/"
    );
  });

  it("paymentsStatus returns correct path", () => {
    expect(endpoints.paymentsStatus()).toBe("/api/payments/status/");
  });
});
