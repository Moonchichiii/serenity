import type { TFunction } from "i18next";
import { z } from "zod";

export const createGiftSchema = (t: TFunction) =>
  z.object({
    senderName: z
      .string()
      .min(1, t("gift.validation.required", "Required field")),

    senderEmail: z
      .string()
      .min(1, t("gift.validation.required", "Required field"))
      .email(t("gift.validation.email", "Invalid email address")),

    recipientName: z
      .string()
      .min(1, t("gift.validation.required", "Required field")),

    recipientEmail: z
      .string()
      .min(1, t("gift.validation.required", "Required field"))
      .email(t("gift.validation.email", "Invalid email address")),

    message: z
      .union([z.string(), z.literal("")])
      .transform((v) => v.trim())
      .transform((v) => (v === "" ? undefined : v))
      .optional(),

    // Booking fields (optional — only if the user picks a slot)
    serviceId: z.number().optional(),
    selectedDate: z.string().optional(),
    selectedTime: z.string().optional(),
  });

export type GiftFormValues = z.infer<
  ReturnType<typeof createGiftSchema>
>;
