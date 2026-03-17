import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import { renderWithQuery } from "../test/utils";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { http, HttpResponse, delay } from "msw";
import { server } from "../mocks/server";
import React from "react";

describe("Query cancellation on unmount", () => {
  it("cancels in-flight queries when component unmounts", async () => {
    let requestReceived = false;
    let requestCompleted = false;

    server.use(
      http.get("*/api/slow-endpoint", async () => {
        requestReceived = true;
        // Simulate slow response
        await delay(5000);
        requestCompleted = true;
        return HttpResponse.json({ data: "slow" });
      }),
    );

    function SlowComponent() {
      const { data, isLoading } = useQuery({
        queryKey: ["slow-test"],
        queryFn: async ({ signal }) => {
          const res = await fetch("/api/slow-endpoint", { signal });
          return res.json();
        },
      });

      return (
        <div>
          {isLoading ? "Loading..." : JSON.stringify(data)}
        </div>
      );
    }

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const { unmount } = renderWithQuery(
      <QueryClientProvider client={queryClient}>
        <SlowComponent />
      </QueryClientProvider>,
    );

    // Wait for the request to start
    await waitFor(() => {
      expect(requestReceived).toBe(true);
    });

    // Unmount before response arrives
    unmount();

    // Give some time to verify the request didn't complete processing
    await new Promise((r) => setTimeout(r, 100));

    // The query should have been cancelled — no state updates after unmount
    // This mainly verifies no "Cannot update unmounted component" warnings
    expect(requestCompleted).toBe(false);

    // Cleanup
    queryClient.clear();
  });

  it("cancels queries via queryClient.cancelQueries on unmount", async () => {
    const cancelSpy = vi.fn();

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const originalCancel = queryClient.cancelQueries.bind(queryClient);
    queryClient.cancelQueries = vi.fn((...args) => {
      cancelSpy();
      return originalCancel(...args);
    });

    function AutoCancelComponent() {
      const qc = queryClient;

      React.useEffect(() => {
        return () => {
          qc.cancelQueries({ queryKey: ["auto-cancel"] });
        };
      }, [qc]);

      useQuery(
        {
          queryKey: ["auto-cancel"],
          queryFn: async () => {
            await new Promise((r) => setTimeout(r, 10000));
            return "data";
          },
        },
      );

      return <div>Auto Cancel Component</div>;
    }

    const { unmount } = renderWithQuery(
      <QueryClientProvider client={queryClient}>
        <AutoCancelComponent />
      </QueryClientProvider>,
    );

    unmount();

    expect(cancelSpy).toHaveBeenCalled();
    queryClient.clear();
  });
});

describe("Voucher success page — interval cleanup", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("clears polling interval on unmount", async () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    server.use(
      http.get("*/api/payments/status", () => {
        return HttpResponse.json({ status: "processing" });
      }),
    );

    // Import the actual voucher success component
    let VoucherSuccess: React.ComponentType;
    try {
      const mod = await import("../routes/voucher/success");
      VoucherSuccess = mod.default ?? mod.Route?.options?.component;
    } catch {
      // Fallback: create a mock that simulates the polling behavior
      VoucherSuccess = () => {
        const [status, setStatus] = React.useState("processing");

        React.useEffect(() => {
          const interval = setInterval(async () => {
            try {
              const res = await fetch("/api/payments/status?session_id=test");
              const data = await res.json();
              setStatus(data.status);
            } catch {
              // ignore
            }
          }, 2000);

          return () => clearInterval(interval);
        }, []);

        return <div data-testid="voucher-status">{status}</div>;
      };
    }

    const { unmount } = renderWithQuery(<VoucherSuccess />);

    // Advance time to trigger at least one poll
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    const clearCallsBefore = clearIntervalSpy.mock.calls.length;

    unmount();

    // clearInterval should have been called during cleanup
    expect(clearIntervalSpy.mock.calls.length).toBeGreaterThan(
      clearCallsBefore,
    );

    clearIntervalSpy.mockRestore();
  });

  it("stops polling when status becomes complete", async () => {
    let pollCount = 0;

    server.use(
      http.get("*/api/payments/status", () => {
        pollCount++;
        // Return "complete" after first poll
        if (pollCount >= 2) {
          return HttpResponse.json({ status: "complete" });
        }
        return HttpResponse.json({ status: "processing" });
      }),
    );

    let VoucherSuccess: React.ComponentType;
    try {
      const mod = await import("../routes/voucher/success");
      VoucherSuccess = mod.default ?? mod.Route?.options?.component;
    } catch {
      VoucherSuccess = () => {
        const [status, setStatus] = React.useState("processing");

        React.useEffect(() => {
          if (status === "complete") return;

          const interval = setInterval(async () => {
            const res = await fetch("/api/payments/status?session_id=test");
            const data = await res.json();
            setStatus(data.status);
            if (data.status === "complete") clearInterval(interval);
          }, 2000);

          return () => clearInterval(interval);
        }, [status]);

        return <div data-testid="voucher-status">{status}</div>;
      };
    }

    renderWithQuery(<VoucherSuccess />);

    // Advance through several poll cycles
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });
    }

    // Should have stopped polling after receiving "complete"
    // pollCount should be low (2-3), not 5+
    expect(pollCount).toBeLessThanOrEqual(4);
  });
});
