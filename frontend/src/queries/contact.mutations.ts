import { mutationOptions } from '@tanstack/react-query'
import { contactApi } from '@/api/contact.api'
import { normalizeHttpError, type ApiError } from '@/api/httpError'
import type { ContactSubmission, ContactSubmissionResponse } from '@/types/api'

export const submitContactMutationOptions = () =>
  mutationOptions<ContactSubmissionResponse, ApiError, ContactSubmission>({
    mutationKey: ['contact', 'submit'],
    mutationFn: async (payload) => {
      try {
        return await contactApi.submit(payload)
      } catch (e) {
        throw normalizeHttpError(e)
      }
    },
  })
