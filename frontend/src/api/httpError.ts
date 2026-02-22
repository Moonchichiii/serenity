import axios from "axios";

export type ApiError = {
  status?: number;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

function getStringProp(
  obj: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = obj[key];
  return typeof value === "string" ? value : undefined;
}

export function normalizeHttpError(err: unknown): ApiError {
  if (!axios.isAxiosError(err)) {
    return { message: "Unexpected error" };
  }

  const status = err.response?.status;
  const data: unknown = err.response?.data;

  // DRF validation shape: { field: ["msg"] }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;

    const fieldErrors: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
        fieldErrors[k] = v;
      }
    }

    const detail = getStringProp(obj, "detail");

    if (Object.keys(fieldErrors).length > 0) {
      return {
        status,
        message: detail ?? "Validation error",
        fieldErrors,
      };
    }

    if (detail) {
      return { status, message: detail };
    }
  }

  return {
    status,
    message: err.message || "Request failed",
  };
}
