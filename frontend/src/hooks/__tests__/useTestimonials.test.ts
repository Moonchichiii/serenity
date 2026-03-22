import { describe, it, expect, vi } from "vitest";
import { waitFor, act } from "@testing-library/react";
import { renderHookWithQuery } from "@/test/utils";
import {
  useTestimonials,
  useTestimonialStats,
  useSubmitTestimonial,
  useReplyToTestimonial,
} from "@/hooks/useTestimonials";
import { requestLog } from "@/mocks/handlers";
import {
  WagtailTestimonialSchema,
  TestimonialStatsSchema,
  TestimonialSubmissionResponseSchema,
  ReplyResponseSchema,
} from "@/test/schemas";
import {
  testimonialListFixture,
} from "@/test/fixtures";
import { z } from "zod";

// ═════════════════════════════════════════════════════════════════
// Flow 7: Testimonials List
// ═════════════════════════════════════════════════════════════════
describe("useTestimonials — Flow 7: Testimonials List", () => {
  // ── Category 1: Schema ──────────────────────────────────────
  it("returns array matching WagtailTestimonial[]", async () => {
    const { result } = renderHookWithQuery(() => useTestimonials(4));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const parsed = z
      .array(WagtailTestimonialSchema)
      .safeParse(result.current.data);
    expect(parsed.success).toBe(true);
  });

  it("sends min_rating as query param", async () => {
    const { result } = renderHookWithQuery(() => useTestimonials(4));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const call = requestLog.find((r) => r.url.includes("/api/testimonials/"));
    expect(call).toBeDefined();

    const url = new URL(call!.url);
    expect(url.searchParams.get("min_rating")).toBe("4");
  });

  it("each testimonial has replies array", async () => {
    const { result } = renderHookWithQuery(() => useTestimonials(4));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    for (const t of result.current.data!) {
      expect(Array.isArray(t.replies)).toBe(true);
    }
  });

  it("filters by min_rating (only rating >= 4 returned)", async () => {
    const { result } = renderHookWithQuery(() => useTestimonials(5));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Fixture has one 5-star and one 4-star; min_rating=5 should
    // return only the 5-star
    const fiveStarCount = testimonialListFixture.filter(
      (t) => t.rating >= 5,
    ).length;
    expect(result.current.data).toHaveLength(fiveStarCount);
  });

  // ── Category 2: Call Count ──────────────────────────────────
  it("fires exactly 1 GET on mount", async () => {
    const { result } = renderHookWithQuery(() => useTestimonials(4));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const calls = requestLog.filter(
      (r) =>
        r.url.includes("/api/testimonials/") &&
        !r.url.includes("/stats") &&
        !r.url.includes("/submit") &&
        !r.url.includes("/reply"),
    );
    expect(calls).toHaveLength(1);
  });

  it("does NOT refetch on re-render", async () => {
    const { result, rerender } = renderHookWithQuery(() => useTestimonials(4));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender();
    rerender();

    const calls = requestLog.filter(
      (r) =>
        r.url.includes("/api/testimonials/") &&
        !r.url.includes("/stats") &&
        !r.url.includes("/submit") &&
        !r.url.includes("/reply"),
    );
    expect(calls).toHaveLength(1);
  });
});

// ═════════════════════════════════════════════════════════════════
// Flow 8: Testimonial Stats
// ═════════════════════════════════════════════════════════════════
describe("useTestimonialStats — Flow 8: Stats", () => {
  it("returns data matching TestimonialStatsSchema", async () => {
    const { result } = renderHookWithQuery(() => useTestimonialStats());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const parsed = TestimonialStatsSchema.safeParse(result.current.data);
    expect(parsed.success).toBe(true);
  });

  it("contains all 7 expected stat fields", async () => {
    const { result } = renderHookWithQuery(() => useTestimonialStats());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data).toHaveProperty("average_rating");
    expect(data).toHaveProperty("total_reviews");
    expect(data).toHaveProperty("five_star_count");
    expect(data).toHaveProperty("four_star_count");
    expect(data).toHaveProperty("three_star_count");
    expect(data).toHaveProperty("two_star_count");
    expect(data).toHaveProperty("one_star_count");
  });

  it("fires exactly 1 GET", async () => {
    const { result } = renderHookWithQuery(() => useTestimonialStats());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const calls = requestLog.filter((r) =>
      r.url.includes("/api/testimonials/stats/"),
    );
    expect(calls).toHaveLength(1);
  });
});

// ═════════════════════════════════════════════════════════════════
// Flow 9: Review Submit
// ═════════════════════════════════════════════════════════════════
describe("useSubmitTestimonial — Flow 9: Review Submit", () => {
  const validReview = {
    name: "Eve",
    email: "eve@example.com",
    rating: 5,
    text: "Fantastic massage!",
  };

  const reviewNoEmail = {
    name: "Frank",
    rating: 4,
    text: "Very good experience.",
  };

  // ── Category 1: Schema ──────────────────────────────────────
  it("sends payload matching expected shape", async () => {
    const { result } = renderHookWithQuery(() => useSubmitTestimonial());

    await act(async () => {
      result.current.mutate(validReview);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const body = requestLog.find((r) =>
      r.url.includes("/api/testimonials/submit/"),
    )?.body as Record<string, unknown>;

    expect(body.name).toBe("Eve");
    expect(body.rating).toBe(5);
    expect(body.text).toBe("Fantastic massage!");
  });

  it("response matches TestimonialSubmissionResponseSchema", async () => {
    const { result } = renderHookWithQuery(() => useSubmitTestimonial());

    await act(async () => {
      result.current.mutate(validReview);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const parsed = TestimonialSubmissionResponseSchema.safeParse(
      result.current.data,
    );
    expect(parsed.success).toBe(true);
  });

  it("email is optional — omitting it still succeeds", async () => {
    const { result } = renderHookWithQuery(() => useSubmitTestimonial());

    await act(async () => {
      result.current.mutate(reviewNoEmail);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const body = requestLog.find((r) =>
      r.url.includes("/api/testimonials/submit/"),
    )?.body as Record<string, unknown>;

    // email should be undefined or not present, NOT empty string
    expect(body.email).toBeUndefined();
  });

  // ── Category 2: Call Count ──────────────────────────────────
  it("fires exactly 1 POST per submit", async () => {
    const { result } = renderHookWithQuery(() => useSubmitTestimonial());

    await act(async () => {
      result.current.mutate(validReview);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const posts = requestLog.filter(
      (r) =>
        r.url.includes("/api/testimonials/submit/") && r.method === "POST",
    );
    expect(posts).toHaveLength(1);
  });

  // ── Category 3: Cache Invalidation (preview) ────────────────
  it("invalidates testimonial stats after submit", async () => {
    const { result, queryClient } = renderHookWithQuery(() =>
      useSubmitTestimonial(),
    );

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await act(async () => {
      result.current.mutate(validReview);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: expect.arrayContaining(["testimonials", "stats"])
      })
    );
  });
});

// ═════════════════════════════════════════════════════════════════
// Flow 10: Testimonial Reply
// ═════════════════════════════════════════════════════════════════
describe("useReplyToTestimonial — Flow 10: Reply Submit", () => {
  const validReply = {
    id: 1,
    data: {
      name: "Serenity Team",
      email: "team@serenity.example",
      text: "Thank you for your kind words!",
    },
  };

  // ── Category 1: Schema ──────────────────────────────────────
  it("sends POST to /api/testimonials/{id}/reply/", async () => {
    const { result } = renderHookWithQuery(() => useReplyToTestimonial());

    await act(async () => {
      result.current.mutate(validReply);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const call = requestLog.find((r) =>
      r.url.includes("/api/testimonials/1/reply/"),
    );
    expect(call).toBeDefined();
    expect(call!.method).toBe("POST");
  });

  it("payload matches ReplySubmission shape (name, email, text)", async () => {
    const { result } = renderHookWithQuery(() => useReplyToTestimonial());

    await act(async () => {
      result.current.mutate(validReply);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const body = requestLog.find((r) =>
      r.url.includes("/reply/"),
    )?.body as Record<string, unknown>;

    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("email");
    expect(body).toHaveProperty("text");
    // id and data wrapper should NOT be in the body (id is in the URL,
    // data is unwrapped by the mutationFn)
    expect(body).not.toHaveProperty("id");
    expect(body).not.toHaveProperty("testimonialId");
    expect(body).not.toHaveProperty("data");
  });

  it("response matches ReplyResponseSchema", async () => {
    const { result } = renderHookWithQuery(() => useReplyToTestimonial());

    await act(async () => {
      result.current.mutate(validReply);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const parsed = ReplyResponseSchema.safeParse(result.current.data);
    expect(parsed.success).toBe(true);
  });

  // ── Category 2: Call Count ──────────────────────────────────
  it("fires exactly 1 POST", async () => {
    const { result } = renderHookWithQuery(() => useReplyToTestimonial());

    await act(async () => {
      result.current.mutate(validReply);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const posts = requestLog.filter(
      (r) => r.url.includes("/reply/") && r.method === "POST",
    );
    expect(posts).toHaveLength(1);
  });

  // ── Category 3: Cache Invalidation (preview) ────────────────
  it("invalidates broad ['testimonials'] prefix after reply", async () => {
    const { result, queryClient } = renderHookWithQuery(() =>
      useReplyToTestimonial(),
    );

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await act(async () => {
      result.current.mutate(validReply);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["testimonials"]
      })
    );
  });
});
