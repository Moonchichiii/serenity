import { useMutation } from '@tanstack/react-query'
import { submitContactMutationOptions } from '@/queries/contact.mutations'

export function useSubmitContact() {
  return useMutation(submitContactMutationOptions())
}
