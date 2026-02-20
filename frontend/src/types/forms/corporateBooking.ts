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
 *
 * Note on attendees:
 * - RHF returns "" when empty.
 * - We preprocess "" -> undefined
 * - We coerce numeric strings -> number
 */
export const createCorporateBookingSchema = (t: TFunction) =>
  z.object({
    // contact
    name: z
      .string()
      .min(1, t('corp.form.validation.nameRequired', 'Name is required'))
      .min(2, t('corp.form.validation.nameTooShort', 'Name is too short')),

    email: z
      .string()
      .min(1, t('corp.form.validation.emailRequired', 'Email is required'))
      .email(t('corp.form.validation.emailInvalid', 'Invalid email')),

    phone: z.preprocess(
      (v) => {
        if (typeof v !== 'string') return undefined
        const trimmed = v.trim()
        return trimmed === '' ? undefined : trimmed
      },
      z.string().optional(),
    ),

    // company & event
    company: z
      .string()
      .min(
        1,
        t('corp.form.validation.companyRequired', 'Company is required'),
      ),

    eventType: z.enum(corporateEventTypes),

    attendees: z.preprocess(
      (v) => {
        if (v === '' || v === null || v === undefined) return undefined
        // RHF might give number or string; normalize
        const num =
          typeof v === 'number' ? v : Number(String(v).trim())
        return Number.isFinite(num) ? num : NaN
      },
      z
        .number({
          invalid_type_error: t(
            'corp.form.validation.attendeesNumber',
            'Enter a number',
          ),
        })
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

    notes: z.preprocess(
      (v) => {
        if (typeof v !== 'string') return undefined
        const trimmed = v.trim()
        return trimmed === '' ? undefined : trimmed
      },
      z.string().optional(),
    ),

    budget: z.string().optional(),
    services: z.string().optional(),
  })

export type CorporateBookingFormValues = z.infer<
  ReturnType<typeof createCorporateBookingSchema>
>
