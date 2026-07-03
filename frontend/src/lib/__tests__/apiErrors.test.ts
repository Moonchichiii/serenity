import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import i18n from "@/i18n/config";
import {
  apiErrorMessage,
  parseApiErrors,
  splitFieldErrors,
} from "@/lib/apiErrors";

function axiosError(data?: unknown, status = 400): AxiosError {
  const err = new AxiosError("Request failed");
  if (data !== undefined) {
    err.response = {
      data,
      status,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
  }
  return err;
}

describe("parseApiErrors", () => {
  it("returns the backend errors list verbatim", () => {
    const parsed = parseApiErrors(
      axiosError({
        errors: [{ code: "max_length", field: "message", message: "Too long" }],
      }),
    );
    expect(parsed).toEqual([
      { code: "max_length", field: "message", message: "Too long" },
    ]);
  });

  it("classifies a response without errors list as server", () => {
    expect(parseApiErrors(axiosError({ detail: "boom" }, 500))[0]?.code).toBe(
      "server",
    );
  });

  it("classifies a missing response as network", () => {
    expect(parseApiErrors(axiosError())[0]?.code).toBe("network");
  });

  it("classifies non-axios values as unknown", () => {
    expect(parseApiErrors(new Error("x"))[0]?.code).toBe("unknown");
  });
});

describe("apiErrorMessage", () => {
  it("prefers field-specific copy and follows the active language", async () => {
    await i18n.changeLanguage("fr");
    const t = i18n.getFixedT(null);
    expect(
      apiErrorMessage(t, { code: "invalid", field: "email", message: "" }),
    ).toBe("Veuillez saisir une adresse e-mail valide.");

    await i18n.changeLanguage("en");
    const tEn = i18n.getFixedT(null);
    expect(
      apiErrorMessage(tEn, { code: "invalid", field: "email", message: "" }),
    ).toBe("Please enter a valid email address.");
    await i18n.changeLanguage("fr");
  });

  it("falls back to byCode, then unknown", async () => {
    await i18n.changeLanguage("en");
    const t = i18n.getFixedT(null);
    expect(
      apiErrorMessage(t, { code: "rate_limited", field: null, message: "" }),
    ).toMatch(/Too many requests/);
    expect(
      apiErrorMessage(t, { code: "no_such_code", field: null, message: "" }),
    ).toMatch(/unexpected error/i);
    await i18n.changeLanguage("fr");
  });
});

describe("splitFieldErrors", () => {
  it("routes known fields inline and the rest to form level", () => {
    const { fieldErrors, rest } = splitFieldErrors(
      [
        { code: "invalid", field: "email", message: "" },
        { code: "spam_detected", field: "website", message: "" },
        { code: "rate_limited", field: null, message: "" },
      ],
      ["name", "email"] as const,
    );
    expect(fieldErrors.map((e) => e.field)).toEqual(["email"]);
    expect(rest.map((e) => e.code)).toEqual(["spam_detected", "rate_limited"]);
  });
});
