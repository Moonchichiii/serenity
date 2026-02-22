import axios from "axios"

export type ApiError = {
  status?: number
  message: string
  fieldErrors?: Record<string, string[]>
}

export function normalizeHttpError(err: unknown): ApiError {
  if (!axios.isAxiosError(err)) {
    return { message: "Unexpected error" }
  }

  const status = err.response?.status
  const data = err.response?.data as unknown

  // DRF validation shape: { field: ["msg"] }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const maybeFieldErrors = data as Record<string, unknown>
    const fieldErrors: Record<string, string[]> = {}

    for (const [k, v] of Object.entries(maybeFieldErrors)) {
      if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
        fieldErrors[k] = v as string[]
      }
    }

    const detail =
      typeof (maybeFieldErrors as any).detail === "string"
        ? (maybeFieldErrors as any).detail
        : undefined

    if (Object.keys(fieldErrors).length > 0) {
      return {
        status,
        message: detail ?? "Validation error",
        fieldErrors,
      }
    }

    if (detail) {
      return { status, message: detail }
    }
  }

  return {
    status,
    message: err.message || "Request failed",
  }
}
