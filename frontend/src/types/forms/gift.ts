import type { TFunction } from "i18next";
import { z } from "zod";

export const createGiftSchema = (t: TFunction) =>
  z.object({
    senderName: z
      .string()
      .min(1, {
        message: t("gift.validation.required", "Required field"),
      }),

    senderEmail: z
      .string()
      .min(1, {
        message: t("gift.validation.required", "Required field"),
      })
      .email({
        message: t(
          "gift.validation.email",
          "Invalid email address",
        ),
      }),

    recipientName: z
      .string()
      .min(1, {
        message: t("gift.validation.required", "Required field"),
      }),

    recipientEmail: z
      .string()
      .min(1, {
        message: t("gift.validation.required", "Required field"),
      })
      .email({
        message: t(
          "gift.validation.email",
          "Invalid email address",
        ),
      }),

    message: z.string(),

    // ✅ plain z.number() — RHF already sends a number via valueAsNumber
    amount: z
      .number({
        message: t(
          "gift.validation.amountInvalid",
          "Invalid amount",
        ),
      })
      .finite({
        message: t(
          "gift.validation.amountInvalid",
          "Invalid amount",
        ),
      })
      .positive({
        message: t(
          "gift.validation.amountPositive",
          "Amount must be greater than 0",
        ),
      }),

    // ✅ plain z.number() — setValue already sends a number
    serviceId: z.number().optional(),
    selectedDate: z.string().optional(),
    selectedTime: z.string().optional(),
  });

export type GiftFormValues = z.infer<
  ReturnType<typeof createGiftSchema>
>;
