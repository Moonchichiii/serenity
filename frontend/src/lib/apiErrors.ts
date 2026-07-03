import { isAxiosError } from "axios";
import type { TFunction } from "i18next";

/**
 * Client half of the stable error contract (prompt 03, Drop 11/12).
 *
 * The backend emits {"errors": [{code, field, message, params?}]} for
 * every validation failure and for throttling. This module parses any
 * failed request into that shape (classifying network/server errors on
 * the way) and resolves each entry to localized copy:
 *
 *   formErrors.byField.<field>.<code>   (most specific)
 *   formErrors.byCode.<code>            (fallback)
 *   formErrors.byCode.unknown           (last resort)
 *
 * No user-facing error strings live in components — FR and EN copy sit
 * side by side in the i18n catalogs, per the form-security phase rules.
 */

export interface ApiFieldError {
  code: string;
  field: string | null;
  message: string;
  params?: Record<string, unknown>;
}

export function parseApiErrors(error: unknown): ApiFieldError[] {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { errors?: ApiFieldError[] }
      | undefined;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors;
    }
    if (error.response) {
      return [{ code: "server", field: null, message: "" }];
    }
    return [{ code: "network", field: null, message: "" }];
  }
  return [{ code: "unknown", field: null, message: "" }];
}

export function apiErrorMessage(t: TFunction, error: ApiFieldError): string {
  const params = error.params ?? {};
  if (error.field) {
    const specific = t(`formErrors.byField.${error.field}.${error.code}`, {
      defaultValue: "",
      ...params,
    });
    if (specific) return specific;
  }
  const generic = t(`formErrors.byCode.${error.code}`, {
    defaultValue: "",
    ...params,
  });
  return generic || t("formErrors.byCode.unknown");
}

/**
 * Split parsed errors into ones that belong to known form fields
 * (→ inline via RHF setError) and the rest (→ form-level toast).
 */
export function splitFieldErrors<Field extends string>(
  errors: ApiFieldError[],
  knownFields: readonly Field[],
): { fieldErrors: Array<ApiFieldError & { field: Field }>; rest: ApiFieldError[] } {
  const fieldErrors: Array<ApiFieldError & { field: Field }> = [];
  const rest: ApiFieldError[] = [];
  for (const entry of errors) {
    if (entry.field && (knownFields as readonly string[]).includes(entry.field)) {
      fieldErrors.push(entry as ApiFieldError & { field: Field });
    } else {
      rest.push(entry);
    }
  }
  return { fieldErrors, rest };
}
