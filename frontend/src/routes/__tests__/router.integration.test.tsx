import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithQuery } from "../../test/utils";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { routeTree } from "../../routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// MSW is already set up globally via setup.ts

function renderWithRouter(initialUrl: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialUrl] }),
    context: { queryClient },
  });

  return {
    ...renderWithQuery(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    ),
    router,
    queryClient,
  };
}

describe("Router integration", () => {
  it("renders HomePage at /", async () => {
    renderWithRouter("/");

    await waitFor(
      () => {
        // HomePage should render hero or some identifiable content
        // Adjust selector to match your actual HomePage output
        expect(
          screen.getByRole("main") || document.querySelector("[data-page='home']"),
        ).toBeTruthy();
      },
      { timeout: 5000 },
    );
  });

  it("renders voucher success page at /voucher/success with session_id", async () => {
    renderWithRouter("/voucher/success?session_id=cs_test_abc123");

    await waitFor(
      () => {
        // Should show some polling/status UI
        const statusElement =
          screen.queryByText(/processing/i) ??
          screen.queryByText(/success/i) ??
          screen.queryByText(/checking/i) ??
          screen.queryByText(/payment/i);
        expect(statusElement).toBeTruthy();
      },
      { timeout: 5000 },
    );
  });

  it("voucher success page without session_id shows error or redirect", async () => {
    renderWithRouter("/voucher/success");

    await waitFor(
      () => {
        // Should either redirect or show an error state
        const errorOrRedirect =
          screen.queryByText(/error/i) ??
          screen.queryByText(/missing/i) ??
          screen.queryByText(/invalid/i) ??
          screen.queryByText(/required/i);
        // If your implementation redirects, check the URL instead
        expect(errorOrRedirect).toBeTruthy();
      },
      { timeout: 5000 },
    );
  });

  it("search param modal=gift triggers gift modal open", async () => {
    renderWithRouter("/?modal=gift");

    await waitFor(
      () => {
        // Gift modal content should be visible
        const giftContent =
          screen.queryByText(/gift/i) ??
          screen.queryByText(/voucher/i) ??
          screen.queryByRole("dialog");
        expect(giftContent).toBeTruthy();
      },
      { timeout: 5000 },
    );
  });
});
