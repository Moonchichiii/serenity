import { describe, it, expect } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModalProvider } from "@/components/modal/ModalProvider";
import { routeTree } from "@/routeTree.gen";
import { server } from "@/mocks/server";
import { http, HttpResponse } from "msw";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

async function renderWithRouter(initialUrl: string) {
  const queryClient = createTestQueryClient();

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialUrl] }),
    context: { queryClient },
  });

  await act(async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <RouterProvider router={router} />
        </ModalProvider>
      </QueryClientProvider>,
    );

    await router.load();
  });

  return { router, queryClient };
}

describe("Router integration", () => {
  it("renders HomePage at /", async () => {
    await renderWithRouter("/");

    await waitFor(() => {
      expect(
        screen.getByRole("navigation", { name: /primary/i }),
      ).toBeInTheDocument();
    });
  });

  it("renders voucher success page at /voucher/success with session_id", async () => {
    server.use(
      http.get("*/api/payments/status/", () => {
        return HttpResponse.json({ status: "paid" });
      }),
    );

    await renderWithRouter("/voucher/success?session_id=cs_test_abc123");

    await waitFor(() => {
      expect(
        screen.getByText(/payment successful|processing payment|something went wrong/i),
      ).toBeInTheDocument();
    });
  });

  it("voucher success page without session_id shows error state", async () => {
    await renderWithRouter("/voucher/success");

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
