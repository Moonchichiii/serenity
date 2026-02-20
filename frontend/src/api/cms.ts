import { apiClient } from "./client";
import type { HydratedPayload } from "@/types/hydrated";
import type {
  GiftVoucherSubmission,
  GiftVoucherResponse,
  TestimonialSubmission,
  TestimonialSubmissionResponse,
} from "@/types/api";

/**
 * Read-only CMS endpoints.
 * Single entry point for SPA content hydration.
 */
export const cmsAPI = {
  getHydrated: async (): Promise<HydratedPayload> => {
    const res = await apiClient.get<HydratedPayload>(
      "/api/homepage/hydrated/"
    );
    return res.data;
  },
};

/**
 * Localization helper re-exported for convenience.
 */
export function getLocalizedText(
  obj: unknown,
  field: string,
  lang: "en" | "fr"
): string {
  if (!obj || typeof obj !== "object") return "";
  const key = `${field}_${lang}`;
  return ((obj as Record<string, unknown>)[key] as string) || "";
}

/**
 * CMS-related mutations.
 * Explicitly separated from read model.
 */
export const cmsMutations = {
  submitVoucher: async (
    data: GiftVoucherSubmission
  ): Promise<GiftVoucherResponse> => {
    const payload = {
      purchaser_name: data.purchaserName,
      purchaser_email: data.purchaserEmail,
      recipient_name: data.recipientName,
      recipient_email: data.recipientEmail,
      message: data.message ?? "",
      preferred_date: data.preferredDate ?? null,
    };

    const res = await apiClient.post<GiftVoucherResponse>(
      "/api/vouchers/create/",
      payload
    );

    return res.data;
  },

  submitTestimonial: async (
    data: TestimonialSubmission
  ): Promise<TestimonialSubmissionResponse> => {
    const res = await apiClient.post<TestimonialSubmissionResponse>(
      "/api/testimonials/create/",
      data
    );
    return res.data;
  },
};
