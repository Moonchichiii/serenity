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
  page: z.record(z.string(), z.unknown()),
  services: z.array(WagtailServiceSchema),
  globals: GlobalSettingsSchema,
});

// ─── Calendar ───────────────────────────────────────────────────
export const BusyDaySchema = z.object({
  date: z.string(), // ISO date
});

export const BusyResponseSchema = z.object({
  busy: z.array(z.string()),
});

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
export const CorporateSubmissionSchema =
  ContactSubmissionSchema.refine(
    (data) => data.subject.startsWith("[CORPORATE]"),
    { message: "Corporate subject must start with [CORPORATE]" },
  );

// ─── Vouchers ───────────────────────────────────────────────────
export const GiftVoucherPayloadSchema = z
  .object({
    sender_name: z.string().min(1),
    sender_email: z.string().email(),
    recipient_name: z.string().min(1),
    recipient_email: z.string().email(),
    message: z.string(),

    service_id: z.number().optional(),
    start_datetime: z.string().optional(),
    end_datetime: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    const any = !!(
      val.service_id ||
      val.start_datetime ||
      val.end_datetime
    );
    const all = !!(
      val.service_id &&
      val.start_datetime &&
      val.end_datetime
    );
    if (any && !all) {
      ctx.addIssue({
        code: "custom",
        message:
          "service_id/start_datetime/end_datetime must be provided together",
        path: ["service_id"],
      });
    }
  });

export const GiftVoucherResponseSchema = z.object({
  code: z.string().min(1),

  calendar_event_id: z.string(),
  calendar_event_link: z.string(),
  calendar_event_status: z.string(),
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


// ─── Checkout / Payments ────────────────────────────────────────
export const CheckoutRequestSchema = z.object({
  sender_name: z.string().min(1),
  sender_email: z.string().email(),
  recipient_name: z.string().min(1),
  recipient_email: z.string().email(),
  message: z.string().optional(),
  amount: z.union([z.string(), z.number()]),
  preferred_language: z.enum(["fr", "en"]),
  service_id: z.number().optional(),
  start_datetime: z.string().optional(),
  end_datetime: z.string().optional(),
});

export const CheckoutResponseSchema = z.object({
  url: z.string(),
  session_id: z.string(),
});
