import type { TFunction } from 'i18next'
import { z } from 'zod'

export const corporateEventTypes = [
  'corporate',
  'team',
  'expo',
  'private',
  'other',
] as const

export type CorporateEventType = (typeof corporateEventTypes)[number]

/**
 * Corporate booking Zod schema factory (i18n-driven).
 */
export const createCorporateBookingSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, t('corp.form.validation.nameRequired', 'Name is required'))
      .min(2, t('corp.form.validation.nameTooShort', 'Name is too short')),

    email: z
      .string()
      .min(1, t('corp.form.validation.emailRequired', 'Email is required'))
      .email(t('corp.form.validation.emailInvalid', 'Invalid email')),

    phone: z.string().optional(),

    company: z
      .string()
      .min(
        1,
        t('corp.form.validation.companyRequired', 'Company is required'),
      ),

    eventType: z.enum(corporateEventTypes),

    attendees: z.preprocess(
      (val) => {
        if (val === '' || val === undefined || val === null) return undefined
        const n = Number(val)
        return Number.isNaN(n) ? val : n
      },
      z
        .number()
        .min(
          1,
          t('corp.form.validation.attendeesMin', 'At least 1 attendee'),
        )
        .optional(),
    ),

    date: z.string().optional(),
    endDate: z.string().optional(),
    duration: z.string().optional(),
    onSiteAddress: z.string().optional(),

    notes: z.string().optional(),

    budget: z.string().optional(),
    services: z.string().optional(),
  })

export type CorporateBookingFormValues = z.infer<
  ReturnType<typeof createCorporateBookingSchema>
>
