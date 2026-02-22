import { useMutation } from '@tanstack/react-query'
import { contactApi } from '@/api/contact.api'
import type {
  ContactSubmission,
  ContactSubmissionResponse,
} from '@/types/api'

export function useSubmitContact() {
  return useMutation<ContactSubmissionResponse, unknown, ContactSubmission>({
    mutationFn: contactApi.submit,
  })
}
