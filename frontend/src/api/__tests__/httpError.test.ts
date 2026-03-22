import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { normalizeHttpError, type ApiError } from "@/api/httpError";

/**
 * Helper to create a minimal AxiosError with a response.
 */
function makeAxiosError(
  status: number,
  data: unknown,
  message = "Request failed"
): AxiosError {
  const headers = new AxiosHeaders();
  const error = new AxiosError(message, "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "Error",
    headers,
    config: { headers },
    data,
  });
  return error;
}

describe("normalizeHttpError (api/httpError)", () => {
  // ── Non-Axios errors ────────────────────────────────────────
  it("returns generic message for a plain Error", () => {
    const result = normalizeHttpError(new Error("boom"));
    expect(result).toEqual({ message: "Unexpected error" });
  });

  it("returns generic message for a string throw", () => {
    const result = normalizeHttpError("something broke");
    expect(result).toEqual({ message: "Unexpected error" });
  });

  it("returns generic message for null/undefined", () => {
    expect(normalizeHttpError(null)).toEqual({
      message: "Unexpected error",
    });
    expect(normalizeHttpError(undefined)).toEqual({
      message: "Unexpected error",
    });
  });

  // ── AxiosError with DRF field validation shape ──────────────
  it("extracts field errors from DRF validation response", () => {
    const err = makeAxiosError(400, {
      email: ["Enter a valid email address."],
      name: ["This field is required."],
    });

    const result = normalizeHttpError(err);

    expect(result).toEqual<ApiError>({
      status: 400,
      message: "Validation error",
      fieldErrors: {
        email: ["Enter a valid email address."],
        name: ["This field is required."],
      },
    });
  });

  it("extracts field errors AND detail together", () => {
    const err = makeAxiosError(400, {
      detail: "Fix the following errors.",
      email: ["Invalid email."],
    });

    const result = normalizeHttpError(err);

    expect(result.status).toBe(400);
    expect(result.message).toBe("Fix the following errors.");
    expect(result.fieldErrors).toEqual({ email: ["Invalid email."] });
  });

  // ── AxiosError with detail string ───────────────────────────
  it("extracts detail string from response data", () => {
    const err = makeAxiosError(429, {
      detail: "Rate limit exceeded. Please try again later.",
    });

    const result = normalizeHttpError(err);

    expect(result).toEqual<ApiError>({
      status: 429,
      message: "Rate limit exceeded. Please try again later.",
    });
  });

  it("extracts detail from a 500 response", () => {
    const err = makeAxiosError(500, {
      detail: "Internal server error.",
    });

    const result = normalizeHttpError(err);

    expect(result).toEqual<ApiError>({
      status: 500,
      message: "Internal server error.",
    });
  });

  // ── AxiosError with empty/non-object data ───────────────────
  it("falls back to err.message when data is a string", () => {
    const err = makeAxiosError(502, "Bad Gateway");

    const result = normalizeHttpError(err);

    expect(result).toEqual<ApiError>({
      status: 502,
      message: "Request failed",
    });
  });

  it("falls back to err.message when data is null", () => {
    const err = makeAxiosError(503, null, "Service Unavailable");

    const result = normalizeHttpError(err);

    expect(result).toEqual<ApiError>({
      status: 503,
      message: "Service Unavailable",
    });
  });

  // ── AxiosError with no response (network error) ────────────
  it("handles network error (no response object)", () => {
    const err = new AxiosError(
      "Network Error",
      "ERR_NETWORK",
      undefined,
      undefined,
      undefined
    );

    const result = normalizeHttpError(err);

    expect(result).toEqual<ApiError>({
      status: undefined,
      message: "Network Error",
    });
  });

  // ── Ignores non-string-array fields ─────────────────────────
  it("ignores fields that are not string arrays", () => {
    const err = makeAxiosError(400, {
      name: ["Required."],
      count: 42,
      nested: { foo: "bar" },
    });

    const result = normalizeHttpError(err);

    expect(result.fieldErrors).toEqual({ name: ["Required."] });
  });
});
