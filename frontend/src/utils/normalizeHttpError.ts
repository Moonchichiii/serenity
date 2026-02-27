export type NormalizedHttpError = {
  message: string
  status?: number
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}

export function normalizeHttpError(err: unknown): NormalizedHttpError {
  if (err instanceof Error) return { message: err.message }
  if (typeof err === "string") return { message: err }

  if (isObject(err)) {
    const msg = err["message"]
    if (typeof msg === "string") return { message: msg }

    const detail = err["detail"]
    if (typeof detail === "string") return { message: detail }

    const e = err["error"]
    if (typeof e === "string") return { message: e }

    const response = err["response"]
    if (isObject(response)) {
      const statusVal = response["status"]
      const status = typeof statusVal === "number" ? statusVal : undefined

      const data = response["data"]
      if (isObject(data)) {
        const dataMsg = data["message"]
        if (typeof dataMsg === "string") return { message: dataMsg, status }

        const dataDetail = data["detail"]
        if (typeof dataDetail === "string") return { message: dataDetail, status }
      }

      return { message: "Request failed", status }
    }
  }

  return { message: "Something went wrong" }
}
