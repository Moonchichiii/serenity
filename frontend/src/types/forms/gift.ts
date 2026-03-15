import type { TFunction } from "i18next";
import { z } from "zod";

export const createGiftSchema = (t: TFunction) =>
  z.object({
    senderName: z.string().min(1, {
      message: t(
        "gift.validation.required",
        "Required field"
      ),
    }),

    senderEmail: z
      .string()
      .min(1, {
        message: t(
          "gift.validation.required",
          "Required field"
        ),
      })
      .email({
        message: t(
          "gift.validation.email",
          "Invalid email address"
        ),
      }),

    recipientName: z.string().min(1, {
      message: t(
        "gift.validation.required",
        "Required field"
      ),
    }),

    recipientEmail: z
      .string()
      .min(1, {
        message: t(
          "gift.validation.required",
          "Required field"
        ),
      })
      .email({
        message: t(
          "gift.validation.email",
          "Invalid email address"
        ),
      }),

    message: z.string(),

    amount: z.number().min(1, {
      message: t(
        "gift.validation.amountRequired",
        "Please select a service"
      ),
    }),

    serviceId: z
      .number({
        error: t(
          "gift.validation.serviceRequired",
          "Please select a service"
        ),
      })
      .min(1, {
        message: t(
          "gift.validation.serviceRequired",
          "Please select a service"
        ),
      }),

    selectedDate: z.string().optional(),
    selectedTime: z.string().optional(),
  });

export type GiftFormValues = z.infer<
  ReturnType<typeof createGiftSchema>
>;
