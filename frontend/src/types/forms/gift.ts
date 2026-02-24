import type { TFunction } from 'i18next'
import { z } from 'zod'

/**
 * Gift voucher form Zod schema factory (i18n-driven).
 */
export const createGiftSchema = (t: TFunction) =>
  z.object({
    purchaserName: z
      .string()
      .min(1, t('gift.validation.required', 'Required field')),

    purchaserEmail: z
      .string()
      .min(1, t('gift.validation.required', 'Required field'))
      .email(t('gift.validation.email', 'Invalid email address')),

    recipientName: z
      .string()
      .min(1, t('gift.validation.required', 'Required field')),

    recipientEmail: z
      .string()
      .min(1, t('gift.validation.required', 'Required field'))
      .email(t('gift.validation.email', 'Invalid email address')),

    message: z
      .union([z.string(), z.literal('')])
      .transform((v) => v.trim())
      .transform((v) => (v === '' ? undefined : v))
      .optional(),

    preferredDate: z
      .union([z.string(), z.literal('')])
      .transform((v) => v.trim())
      .transform((v) => (v === '' ? undefined : v))
      .optional(),
  })

export type GiftFormValues = z.infer<ReturnType<typeof createGiftSchema>>
