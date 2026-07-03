export interface ContactSubmission {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  website?: string
}

export interface ContactSubmissionResponse {
  success: boolean
  message: string
}
