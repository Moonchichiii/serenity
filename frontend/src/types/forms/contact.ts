import type { TFunction } from 'i18next'
import { z } from 'zod'

/**
 * Contact form Zod schema factory (i18n-driven).
 */
export const createContactSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, t('contact.form.validation.nameRequired', 'Name is required'))
      .min(2, t('contact.form.validation.nameTooShort', 'Name is too short'))
      .max(100, t('formErrors.byCode.max_length', 'This text is too long.')),

    email: z
      .string()
      .min(1, t('contact.form.validation.emailRequired', 'Email is required'))
      .email(t('contact.form.validation.emailInvalid', 'Invalid email')),

    phone: z
      .union([z.string(), z.literal('')])
      .transform((v) => v.trim())
      .transform((v) => (v === '' ? undefined : v))
      .optional(),

    subject: z
      .string()
      .min(
        1,
        t('contact.form.validation.subjectRequired', 'Subject is required'),
      )
      .max(200, t('formErrors.byCode.max_length', 'This text is too long.')),

    message: z
      .string()
      .min(
        1,
        t('contact.form.validation.messageRequired', 'Message is required'),
      )
      .min(
        10,
        t('contact.form.validation.messageTooShort', 'Message is too short'),
      )
      .max(
        1500,
        t('formErrors.byField.message.max_length', 'Your message is too long.'),
      ),

    website: z.string().optional(),
  })

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>
