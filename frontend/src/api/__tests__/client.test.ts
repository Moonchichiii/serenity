import { describe, expect, it } from "vitest";
import { apiClient, API_URL } from "@/api/client";

describe("apiClient configuration", () => {
  it("has the correct baseURL", () => {
    expect(apiClient.defaults.baseURL).toBe(API_URL);
  });

  it("sends JSON content-type by default", () => {
    const ct = apiClient.defaults.headers.common?.["Content-Type"]
      ?? apiClient.defaults.headers["Content-Type"];
    expect(ct).toBe("application/json");
  });

  it("enables withCredentials for cookie auth", () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it("has a 10 second timeout", () => {
    expect(apiClient.defaults.timeout).toBe(10_000);
  });

  it("configures CSRF cookie/header names", () => {
    expect(apiClient.defaults.xsrfCookieName).toBe("csrftoken");
    expect(apiClient.defaults.xsrfHeaderName).toBe("X-CSRFToken");
  });

  it("has a request interceptor registered", () => {
    // Axios stores interceptors internally — at least the CSRF one
    // should be registered
    const requestInterceptors =
      (apiClient.interceptors.request as unknown as { handlers: unknown[] })
        .handlers;
    expect(requestInterceptors.length).toBeGreaterThanOrEqual(1);
  });
});
