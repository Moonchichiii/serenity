import { z } from "zod";
import type { TFunction } from "i18next";

export function createBookingSchema(t: TFunction) {
  return z.object({
    name: z
      .string()
      .min(2, t("formErrors.byField.name.required", "Please enter your name."))
      .max(100, t("formErrors.byCode.max_length", "This text is too long.")),
    email: z
      .string()
      .min(1, t("formErrors.byField.email.required", "Please enter your email address."))
      .email(t("formErrors.byField.email.invalid", "Please enter a valid email address.")),
    serviceId: z
      .number({ message: t("booking.validation.service", "Please choose a treatment.") })
      .int()
      .positive(t("booking.validation.service", "Please choose a treatment.")),
    selectedDate: z
      .string()
      .min(1, t("booking.validation.date", "Please choose a date.")),
    selectedTime: z
      .string()
      .min(1, t("booking.validation.time", "Please choose a time slot.")),
    notes: z
      .string()
      .max(500, t("formErrors.byCode.max_length", "This text is too long."))
      .optional(),
    website: z.string().optional(),
  });
}

export type BookingFormValues = z.infer<
  ReturnType<typeof createBookingSchema>
>;
