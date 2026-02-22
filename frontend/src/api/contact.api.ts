import { apiClient } from "./client"
import { endpoints } from "./endpoints"
import type { ContactSubmission, ContactSubmissionResponse } from "@/types/api"

export const contactApi = {
  submit: async (data: ContactSubmission): Promise<ContactSubmissionResponse> => {
    const res = await apiClient.post<ContactSubmissionResponse>(endpoints.contactSubmit(), data)
    return res.data
  },
}
