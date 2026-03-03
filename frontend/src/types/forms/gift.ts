import type { TFunction } from "i18next";
import { z } from "zod";

export const createGiftSchema = (t: TFunction) =>
  z.object({
    senderName: z.string().min(1, {
      message: t("gift.validation.required", "Required field"),
    }),

    senderEmail: z.string().min(1, {
      message: t("gift.validation.required", "Required field"),
    }).email({
      message: t("gift.validation.email", "Invalid email address"),
    }),

    recipientName: z.string().min(1, {
      message: t("gift.validation.required", "Required field"),
    }),

    recipientEmail: z.string().min(1, {
      message: t("gift.validation.required", "Required field"),
    }).email({
      message: t("gift.validation.email", "Invalid email address"),
    }),

    message: z.string(),

    // Amount is now derived from service, but we keep validation just in case
    amount: z.number().min(1, {
      message: t("gift.validation.amountRequired", "Please select a service"),
    }),

    // Service is now practically required for this flow
    serviceId: z.number({
      required_error: t("gift.validation.serviceRequired", "Please select a service"),
    }),

    selectedDate: z.string().optional(),
    selectedTime: z.string().optional(),
  });

export type GiftFormValues = z.infer<ReturnType<typeof createGiftSchema>>;
