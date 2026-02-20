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
      .min(2, t('contact.form.validation.nameTooShort', 'Name is too short')),

    email: z
      .string()
      .min(1, t('contact.form.validation.emailRequired', 'Email is required'))
      .email(t('contact.form.validation.emailInvalid', 'Invalid email')),

    phone: z.preprocess(
      (v) => {
        if (typeof v !== 'string') return undefined
        const trimmed = v.trim()
        return trimmed === '' ? undefined : trimmed
      },
      z.string().optional(),
    ),

    subject: z
      .string()
      .min(
        1,
        t('contact.form.validation.subjectRequired', 'Subject is required'),
      ),

    message: z
      .string()
      .min(
        1,
        t('contact.form.validation.messageRequired', 'Message is required'),
      )
      .min(
        10,
        t(
          'contact.form.validation.messageTooShort',
          'Message is too short',
        ),
      ),
  })

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>
