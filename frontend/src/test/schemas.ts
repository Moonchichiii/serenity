import { z } from "zod";

// ─── CMS ────────────────────────────────────────────────────────
// Response-only (GET, no request body)
export const WagtailImageSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const WagtailServiceSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  duration_minutes: z.number(),
  price: z.string(), // DecimalField serialised as string
  image: WagtailImageSchema.nullable().optional(),
});

export const GlobalSettingsSchema = z.object({
  site_name: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  facebook_url: z.string().optional(),
  instagram_url: z.string().optional(),
});

export const HydratedResponseSchema = z.object({
  page: z.record(z.unknown()), // WagtailHomePage varies by CMS config
  services: z.array(WagtailServiceSchema),
  globals: GlobalSettingsSchema,
});

// ─── Calendar ───────────────────────────────────────────────────
export const BusyDaySchema = z.object({
  date: z.string(), // ISO date
});

export const BusyResponseSchema = z.array(BusyDaySchema);

export const TimeSlotSchema = z.object({
  start: z.string(), // ISO datetime
  end: z.string(),
});

export const SlotsResponseSchema = z.array(TimeSlotSchema);

// ─── Contact ────────────────────────────────────────────────────
export const ContactSubmissionSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export const ContactSubmissionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// ─── Corporate (reuses contact endpoint, stricter subject) ──────
export const CorporateSubmissionSchema = ContactSubmissionSchema.refine(
  (data) => data.subject.startsWith("[CORPORATE]"),
  { message: "Corporate subject must start with [CORPORATE]" }
);

// ─── Vouchers ───────────────────────────────────────────────────
export const GiftVoucherPayloadSchema = z.object({
  purchaser_name: z.string().min(1),
  purchaser_email: z.string().email(),
  recipient_name: z.string().min(1),
  recipient_email: z.string().email(),
  service_id: z.number().nullable(),
  message: z.string(),
  preferred_date: z.string().nullable(),
  start_datetime: z.string().nullable(),
  end_datetime: z.string().nullable(),
});

export const GiftVoucherResponseSchema = z.object({
  code: z.string().min(1),
  booking_confirmation: z.string().optional(),
});

// ─── Testimonials ───────────────────────────────────────────────
export const WagtailReplySchema = z.object({
  id: z.number(),
  name: z.string(),
  text: z.string(),
  date: z.string(),
});

export const WagtailTestimonialSchema = z.object({
  id: z.number(),
  name: z.string(),
  rating: z.number().min(1).max(5),
  text: z.string(),
  date: z.string(),
  avatar: z.string(),
  replies: z.array(WagtailReplySchema),
});

export const TestimonialSubmissionSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  rating: z.number().min(1).max(5),
  text: z.string().min(1),
});

export const TestimonialSubmissionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  id: z.union([z.string(), z.number()]), // ⚠️ verify with backend
});

export const ReplySubmissionSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  text: z.string().min(1),
});

export const ReplyResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const TestimonialStatsSchema = z.object({
  average_rating: z.number(),
  total_reviews: z.number(),
  five_star_count: z.number(),
  four_star_count: z.number(),
  three_star_count: z.number(),
  two_star_count: z.number(),
  one_star_count: z.number(),
});
