import type { z } from "zod";
import type {
  HydratedResponseSchema,
  WagtailTestimonialSchema,
  TestimonialStatsSchema,
} from "./schemas";

// ─── CMS ────────────────────────────────────────────────────────
export const cmsHydratedFixture: z.infer<
  typeof HydratedResponseSchema
> = {
  page: {
    id: 1,
    title: "Serenity Wellness",
    hero_title: "Find Your Peace",
    hero_subtitle: "Professional massage therapy",
  },
  services: [
    {
      id: 1,
      title: "Swedish Massage",
      slug: "swedish-massage",
      description: "A classic full-body massage",
      duration_minutes: 60,
      price: "85.00",
      image: {
        url: "https://example.com/swedish.jpg",
        alt: "Swedish massage",
      },
    },
    {
      id: 2,
      title: "Deep Tissue",
      slug: "deep-tissue",
      description: "Targeted deep pressure massage",
      duration_minutes: 90,
      price: "120.00",
      image: null,
    },
  ],
  globals: {
    site_name: "Serenity Wellness",
    phone: "+32 123 456 789",
    email: "info@serenity.example",
    address: "123 Rue de la Paix, Brussels",
    facebook_url: "https://facebook.com/serenity",
    instagram_url: "https://instagram.com/serenity",
  },
};

// ─── Calendar ───────────────────────────────────────────────────
export const busyDaysFixture = [
  { date: "2026-03-05" },
  { date: "2026-03-12" },
  { date: "2026-03-19" },
];

export const freeSlotsFixture = [
  { start: "2026-03-06T09:00:00Z", end: "2026-03-06T10:00:00Z" },
  { start: "2026-03-06T10:30:00Z", end: "2026-03-06T11:30:00Z" },
  { start: "2026-03-06T13:00:00Z", end: "2026-03-06T14:00:00Z" },
];

// ─── Contact ────────────────────────────────────────────────────
export const contactSuccessFixture = {
  success: true,
  message: "Your message has been sent successfully.",
};

// ─── Vouchers ───────────────────────────────────────────────────
export const voucherSuccessFixture = {
  code: "ABCD123456",
  calendar_event_id: "evt_999",
  calendar_event_link: "https://calendar/item",
  calendar_event_status: "confirmed",
};

export const voucherNoBookingFixture = {
  code: "GIFT-XYZ789",
  calendar_event_id: "",
  calendar_event_link: "",
  calendar_event_status: "",
};

// ─── Testimonials ───────────────────────────────────────────────
export const testimonialListFixture: z.infer<
  typeof WagtailTestimonialSchema
>[] = [
  {
    id: 1,
    name: "Alice Dupont",
    rating: 5,
    text: "Absolutely wonderful experience!",
    date: "2026-01-15",
    avatar: "https://example.com/alice.jpg",
    replies: [
      {
        id: 10,
        name: "Serenity Team",
        text: "Thank you, Alice!",
        date: "2026-01-16",
      },
    ],
  },
  {
    id: 2,
    name: "Bob Martin",
    rating: 4,
    text: "Very relaxing, will come back.",
    date: "2026-02-01",
    avatar: "https://example.com/bob.jpg",
    replies: [],
  },
];

export const testimonialStatsFixture: z.infer<
  typeof TestimonialStatsSchema
> = {
  average_rating: 4.5,
  total_reviews: 42,
  five_star_count: 25,
  four_star_count: 12,
  three_star_count: 3,
  two_star_count: 1,
  one_star_count: 1,
};

export const testimonialSubmitSuccessFixture = {
  success: true,
  message: "Thank you for your review!",
  id: "99",
};

export const replySuccessFixture = {
  success: true,
  message: "Reply posted successfully.",
};

// ─── Error fixtures ─────────────────────────────────────────────
export const validationErrorFixture = {
  email: ["Enter a valid email address."],
  name: ["This field is required."],
};

export const detailErrorFixture = {
  detail: "Rate limit exceeded. Please try again later.",
};

export const serverErrorBody = {
  detail: "Internal server error.",
};
