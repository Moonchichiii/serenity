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

    // keep these as strings; defaults handled via RHF + schema default
    message: z.string().optional().default(''),
    preferredDate: z.string().optional().default(''),
  })

export type GiftFormValues = z.infer<ReturnType<typeof createGiftSchema>>
