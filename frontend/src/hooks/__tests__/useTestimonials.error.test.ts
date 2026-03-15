import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithQuery } from "@/test/utils";
import {
  useSubmitTestimonial,
  useReplyToTestimonial,
  useTestimonials,
} from "@/hooks/useTestimonials";
import { server } from "@/mocks/server";
import { errorOverrides } from "@/mocks/handlers";

describe("useTestimonials — error paths", () => {
  // ── Query error ─────────────────────────────────────────────
  it("surfaces network error on testimonials query", async () => {
    server.use(
      http.get("/api/testimonials/", () => HttpResponse.error())
    );

    const { result } = renderHookWithQuery(() => useTestimonials(0));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  // ── Submit mutation error ───────────────────────────────────
  it("surfaces validation error on testimonial submit (400)", async () => {
    server.use(errorOverrides.reviewValidationError());

    const { result } = renderHookWithQuery(() =>
      useSubmitTestimonial()
    );

    result.current.mutate({
      name: "Alice",
      rating: 5,
      text: "",
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const error = result.current.error;
    expect(error?.status).toBe(400);
    expect(error?.fieldErrors).toEqual({
      text: ["This field is required."],
    });
  });

  // ── Reply mutation error ────────────────────────────────────
  it("surfaces 500 error on reply mutation", async () => {
    server.use(errorOverrides.replyServerError());

    const { result } = renderHookWithQuery(() =>
      useReplyToTestimonial()
    );

    result.current.mutate({
      id: 1,
      data: {
        name: "Admin",
        email: "admin@example.com",
        text: "Thanks!",
      },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const error = result.current.error;
    expect(error?.status).toBe(500);
    expect(error?.message).toBe("Something went wrong.");
  });

  it("surfaces 404 when replying to non-existent testimonial", async () => {
    server.use(errorOverrides.replyNotFound());

    const { result } = renderHookWithQuery(() =>
      useReplyToTestimonial()
    );

    result.current.mutate({
      id: 9999,
      data: {
        name: "Admin",
        email: "admin@example.com",
        text: "Thanks!",
      },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const error = result.current.error;
    expect(error?.status).toBe(404);
  });
});
