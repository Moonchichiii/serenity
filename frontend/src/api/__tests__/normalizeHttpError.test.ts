import { describe, expect, it } from "vitest";
import { normalizeHttpError } from "@/utils/normalizeHttpError";

describe("normalizeHttpError (utils — generic)", () => {
  // ── Error instances ─────────────────────────────────────────
  it("extracts message from a standard Error", () => {
    expect(normalizeHttpError(new Error("boom"))).toEqual({
      message: "boom",
    });
  });

  it("extracts message from a TypeError", () => {
    expect(normalizeHttpError(new TypeError("type issue"))).toEqual({
      message: "type issue",
    });
  });

  // ── String throws ──────────────────────────────────────────
  it("wraps a thrown string", () => {
    expect(normalizeHttpError("oops")).toEqual({ message: "oops" });
  });

  it("wraps an empty string", () => {
    expect(normalizeHttpError("")).toEqual({ message: "" });
  });

  // ── Object with message/detail/error ────────────────────────
  it("reads .message from a plain object", () => {
    expect(normalizeHttpError({ message: "obj msg" })).toEqual({
      message: "obj msg",
    });
  });

  it("reads .detail from a plain object", () => {
    expect(normalizeHttpError({ detail: "detail msg" })).toEqual({
      message: "detail msg",
    });
  });

  it("reads .error from a plain object", () => {
    expect(normalizeHttpError({ error: "err msg" })).toEqual({
      message: "err msg",
    });
  });

  it("prefers .message over .detail", () => {
    expect(
      normalizeHttpError({ message: "msg", detail: "det" })
    ).toEqual({ message: "msg" });
  });

  // ── Axios-like shape (response.data) ────────────────────────
  it("extracts message from response.data.message", () => {
    const err = {
      response: { status: 400, data: { message: "bad request" } },
    };

    expect(normalizeHttpError(err)).toEqual({
      message: "bad request",
      status: 400,
    });
  });

  it("extracts detail from response.data.detail", () => {
    const err = {
      response: { status: 429, data: { detail: "rate limited" } },
    };

    expect(normalizeHttpError(err)).toEqual({
      message: "rate limited",
      status: 429,
    });
  });

  it("returns 'Request failed' when response has no parseable data", () => {
    const err = { response: { status: 500, data: {} } };

    expect(normalizeHttpError(err)).toEqual({
      message: "Request failed",
      status: 500,
    });
  });

  it("handles response without data", () => {
    const err = { response: { status: 502 } };

    expect(normalizeHttpError(err)).toEqual({
      message: "Request failed",
      status: 502,
    });
  });

  // ── Edge cases ──────────────────────────────────────────────
  it("returns fallback for null", () => {
    expect(normalizeHttpError(null)).toEqual({
      message: "Something went wrong",
    });
  });

  it("returns fallback for undefined", () => {
    expect(normalizeHttpError(undefined)).toEqual({
      message: "Something went wrong",
    });
  });

  it("returns fallback for a number", () => {
    expect(normalizeHttpError(42)).toEqual({
      message: "Something went wrong",
    });
  });

  it("returns fallback for an empty object", () => {
    expect(normalizeHttpError({})).toEqual({
      message: "Something went wrong",
    });
  });
});
