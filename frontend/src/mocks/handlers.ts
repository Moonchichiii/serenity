import { http, HttpResponse, type HttpHandler } from "msw";
import {
  ContactSubmissionSchema,
  GiftVoucherPayloadSchema,
  TestimonialSubmissionSchema,
  ReplySubmissionSchema,
} from "../test/schemas";
import {
  cmsHydratedFixture,
  busyDaysFixture,
  freeSlotsFixture,
  contactSuccessFixture,
  voucherSuccessFixture,
  testimonialListFixture,
  testimonialStatsFixture,
  testimonialSubmitSuccessFixture,
  replySuccessFixture,
} from "../test/fixtures";

// ─── Global request tracker (tests read this) ──────────────────
export const requestLog: {
  method: string;
  url: string;
  body?: unknown;
}[] = [];

export function resetRequestLog() {
  requestLog.length = 0;
}

function log(method: string, url: string, body?: unknown) {
  requestLog.push({ method, url, body });
}

/**
 * Throws in the MSW handler if the request body doesn't match
 * the Zod schema — surfaces contract violations immediately.
 */
function assertSchema<T>(
  schema: {
    safeParse: (data: unknown) => {
      success: boolean;
      error?: unknown;
    };
  },
  data: unknown,
  endpoint: string
): asserts data is T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(
      `[MSW] Schema violation at ${endpoint}:`,
      result.error
    );
    throw new Error(`Schema violation at ${endpoint}`);
  }
}

// ─── Base URL (empty = relative, works for both Vitest & Playwright) ─
const BASE = "";

export const handlers: HttpHandler[] = [
  // ── Flow 1: CMS Hydrated ─────────────────────────────────────
  http.get(`${BASE}/api/homepage/hydrated/`, ({ request }) => {
    log("GET", request.url);
    return HttpResponse.json(cmsHydratedFixture);
  }),

  // ── Flow 2: Calendar Busy Days ────────────────────────────────
  http.get(`${BASE}/api/calendar/busy/`, ({ request }) => {
    log("GET", request.url);
    const url = new URL(request.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");

    if (!start || !end) {
      return HttpResponse.json(
        { detail: "start and end params required" },
        { status: 400 }
      );
    }

    return HttpResponse.json(busyDaysFixture);
  }),

  // ── Flow 3: Calendar Free Slots ───────────────────────────────
  http.get(`${BASE}/api/calendar/slots/`, ({ request }) => {
    log("GET", request.url);
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    // serviceId may be null for non-booking vouchers — allow it
    const serviceId = url.searchParams.get("service_id");

    if (!date) {
      return HttpResponse.json(
        { detail: "date param required" },
        { status: 400 }
      );
    }

    return HttpResponse.json(freeSlotsFixture);
  }),

  // ── Flow 4 & 5: Contact / Corporate Submit ───────────────────
  http.post(`${BASE}/api/contact/submit/`, async ({ request }) => {
    const body = await request.json();
    log("POST", request.url, body);
    assertSchema(ContactSubmissionSchema, body, "/api/contact/submit/");
    return HttpResponse.json(contactSuccessFixture);
  }),

  // ── Flow 6: Gift Voucher Purchase ─────────────────────────────
  http.post(`${BASE}/api/vouchers/create/`, async ({ request }) => {
    const body = await request.json();
    log("POST", request.url, body);
    assertSchema(
      GiftVoucherPayloadSchema,
      body,
      "/api/vouchers/create/"
    );
    return HttpResponse.json(voucherSuccessFixture);
  }),

  // ── Flow 7: Testimonials List ─────────────────────────────────
  http.get(`${BASE}/api/testimonials/`, ({ request }) => {
    log("GET", request.url);
    const url = new URL(request.url);
    const minRating = url.searchParams.get("min_rating");
    // Filter fixture if min_rating provided (mimics backend)
    const rating = minRating ? parseInt(minRating, 10) : 0;
    const filtered = testimonialListFixture.filter(
      (t) => t.rating >= rating
    );
    return HttpResponse.json(filtered);
  }),

  // ── Flow 8: Testimonial Stats ─────────────────────────────────
  http.get(`${BASE}/api/testimonials/stats/`, ({ request }) => {
    log("GET", request.url);
    return HttpResponse.json(testimonialStatsFixture);
  }),

  // ── Flow 9: Review Submit ─────────────────────────────────────
  http.post(
    `${BASE}/api/testimonials/submit/`,
    async ({ request }) => {
      const body = await request.json();
      log("POST", request.url, body);
      assertSchema(
        TestimonialSubmissionSchema,
        body,
        "/api/testimonials/submit/"
      );
      return HttpResponse.json(testimonialSubmitSuccessFixture);
    }
  ),

  // ── Flow 10: Testimonial Reply ────────────────────────────────
  http.post(
    `${BASE}/api/testimonials/:id/reply/`,
    async ({ request, params }) => {
      const id = params.id;
      if (!id || isNaN(Number(id))) {
        return HttpResponse.json(
          { detail: "Invalid testimonial ID" },
          { status: 400 }
        );
      }

      const body = await request.json();
      log("POST", request.url, body);
      assertSchema(
        ReplySubmissionSchema,
        body,
        `/api/testimonials/${id}/reply/`
      );
      return HttpResponse.json(replySuccessFixture);
    }
  ),
];

// ─── Error Override Factories ───────────────────────────────────
// Use these with `server.use(...)` in individual tests to simulate
// error paths without touching the happy-path defaults.

export const errorOverrides = {
  contactValidationError: () =>
    http.post(`${BASE}/api/contact/submit/`, () =>
      HttpResponse.json(
        {
          email: ["Enter a valid email address."],
          name: ["This field is required."],
        },
        { status: 400 }
      )
    ),

  contactServerError: () =>
    http.post(`${BASE}/api/contact/submit/`, () =>
      HttpResponse.json(
        { detail: "Internal server error." },
        { status: 500 }
      )
    ),

  voucherRateLimit: () =>
    http.post(`${BASE}/api/vouchers/create/`, () =>
      HttpResponse.json(
        { detail: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    ),

  reviewValidationError: () =>
    http.post(`${BASE}/api/testimonials/submit/`, () =>
      HttpResponse.json(
        { text: ["This field is required."] },
        { status: 400 }
      )
    ),

  replyServerError: () =>
    http.post(`${BASE}/api/testimonials/:id/reply/`, () =>
      HttpResponse.json(
        { detail: "Something went wrong." },
        { status: 500 }
      )
    ),

  cmsNetworkError: () =>
    http.get(`${BASE}/api/homepage/hydrated/`, () =>
      HttpResponse.error()
    ),
};
