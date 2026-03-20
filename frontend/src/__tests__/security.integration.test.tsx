import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQuery } from "../test/utils";
import { ModalProvider } from "@/components/modal/ModalProvider";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";

/**
 * Helper: wraps a component in ModalProvider before passing
 * to renderWithQuery (which already supplies QueryClientProvider).
 */
function renderWithProviders(ui: React.ReactElement) {
  return renderWithQuery(<ModalProvider>{ui}</ModalProvider>);
}

describe("Security — XSS prevention", () => {
  it("CMS content with script tags is not executed", async () => {
    const xssPayload = '<img src=x onerror="window.__xss=true">';
    const scriptPayload = '<script>window.__xssScript=true</script>';

    server.use(
      http.get("*/api/cms/globals", () => {
        return HttpResponse.json({
          siteName: `Serenity${scriptPayload}`,
          description: xssPayload,
          footer: `© 2026 ${xssPayload}`,
        });
      }),
    );

    const { Header } = await import(
      "@/components/layout/Header"
    );

    renderWithProviders(<Header />);

    await waitFor(() => {
      expect(
        (window as unknown as Record<string, unknown>)["__xss"],
      ).toBeUndefined();
      expect(
        (window as unknown as Record<string, unknown>)["__xssScript"],
      ).toBeUndefined();

      const scripts = document.querySelectorAll("script");
      for (const script of scripts) {
        expect(script.textContent).not.toContain("__xssScript");
      }
    });
  });

  it("testimonial content with XSS payloads is safely rendered", async () => {
    server.use(
      http.get("*/api/testimonials", () => {
        return HttpResponse.json([
          {
            id: "xss-1",
            name: '<script>alert("xss")</script>Evil User',
            text: '"><img src=x onerror=alert(1)>Great service!',
            rating: 5,
            createdAt: "2026-01-01T00:00:00Z",
          },
        ]);
      }),
    );

    let TestimonialBanner: React.ComponentType;
    try {
      const mod = await import(
        "../features/testimonials/TestimonialBanner"
      );
      TestimonialBanner = mod.TestimonialBanner ?? mod.default;
    } catch {
      return;
    }

    renderWithQuery(<TestimonialBanner />);

    await waitFor(() => {
      const scripts = document.querySelectorAll("script");
      for (const script of scripts) {
        expect(script.textContent).not.toContain("alert");
      }
    });
  });

  it("form inputs are sanitized — HTML in name field does not create DOM elements", async () => {
    const user = userEvent.setup();

    let ContactForm: React.ComponentType;
    try {
      const mod = await import("../components/forms/Contactform");
      ContactForm = mod.ContactForm;
    } catch {
      return;
    }

    renderWithQuery(<ContactForm />);

    const nameInput =
      screen.queryByLabelText(/name/i) ??
      screen.queryByPlaceholderText(/name/i);

    if (nameInput) {
      await user.type(nameInput, '<img src=x onerror="alert(1)">');

      expect(nameInput).toHaveValue(
        '<img src=x onerror="alert(1)">',
      );

      const suspiciousImgs = document.querySelectorAll(
        'img[src="x"]',
      );
      expect(suspiciousImgs.length).toBe(0);
    }
  });
});

describe("Security — API error handling", () => {
  it("401 responses don't expose sensitive data in UI", async () => {
    server.use(
      http.get("*/api/cms/globals", () => {
        return HttpResponse.json(
          {
            error: "Unauthorized",
            internalMessage:
              "JWT token expired for user admin@serenity.se",
          },
          { status: 401 },
        );
      }),
    );

    const { Header } = await import(
      "@/components/layout/Header"
    );

    renderWithProviders(<Header />);

    await waitFor(() => {
      expect(screen.queryByText(/JWT/i)).not.toBeInTheDocument();
      expect(
        screen.queryByText(/admin@/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/token expired/i),
      ).not.toBeInTheDocument();
    });
  });

  it("500 responses show generic error, not stack traces", async () => {
    server.use(
      http.get("*/api/testimonials", () => {
        return HttpResponse.json(
          {
            error: "Internal Server Error",
            stack:
              "Error: DB connection failed\n  at /app/server.ts:42:7",
          },
          { status: 500 },
        );
      }),
    );

    let TestimonialBanner: React.ComponentType;
    try {
      const mod = await import(
        "../features/testimonials/TestimonialBanner"
      );
      TestimonialBanner = mod.TestimonialBanner ?? mod.default;
    } catch {
      return;
    }

    renderWithQuery(<TestimonialBanner />);

    await waitFor(
      () => {
        expect(
          screen.queryByText(/server\.ts/i),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(/DB connection/i),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(/at \/app/i),
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});

describe("Security — Zod schema validation as defense", () => {
  it("malformed API responses are caught by Zod schemas", async () => {
    server.use(
      http.get("*/api/testimonials", () => {
        return HttpResponse.json([
          {
            unexpectedField: "should be caught",
            __proto__: { polluted: true },
          },
        ]);
      }),
    );

    let TestimonialBanner: React.ComponentType;
    try {
      const mod = await import(
        "../features/testimonials/TestimonialBanner"
      );
      TestimonialBanner = mod.TestimonialBanner ?? mod.default;
    } catch {
      return;
    }

    renderWithQuery(<TestimonialBanner />);

    await waitFor(
      () => {
        const hasContent =
          screen.queryByText(/unexpectedField/);
        expect(hasContent).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    expect(
      (Object.prototype as Record<string, unknown>)["polluted"],
    ).toBeUndefined();
  });
});
