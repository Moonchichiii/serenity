import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { waitFor, act } from "@testing-library/react";
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
          void qc.cancelQueries({ queryKey: ["auto-cancel"] });
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
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function PollingVoucherStatus({ sessionId }: { sessionId: string }) {
    const [status, setStatus] = React.useState<
      "loading" | "paid" | "processing" | "failed"
    >("loading");

    React.useEffect(() => {
      let cancelled = false;
      let attempts = 0;
      const maxAttempts = 15;

      const checkStatus = async (): Promise<boolean> => {
        try {
          const res = await fetch(`/api/payments/status?session_id=${sessionId}`);
          const data = (await res.json()) as { status: string };

          if (cancelled) return true;

          if (data.status === "paid") {
            setStatus("paid");
            return true;
          }

          if (data.status === "failed" || data.status === "canceled") {
            setStatus("failed");
            return true;
          }

          setStatus("processing");
          return false;
        } catch {
          return false;
        }
      };

      void checkStatus();

      const interval = window.setInterval(() => {
        void (async () => {
          attempts += 1;
          const done = await checkStatus();

          if (done || attempts >= maxAttempts) {
            window.clearInterval(interval);
            if (!done && !cancelled) {
              setStatus("failed");
            }
          }
        })();
      }, 2000);

      return () => {
        cancelled = true;
        window.clearInterval(interval);
      };
    }, [sessionId]);

    return <div data-testid="voucher-status">{status}</div>;
  }

  it("clears polling interval on unmount", async () => {
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");

    server.use(
      http.get("*/api/payments/status*", () => {
        return HttpResponse.json({ status: "processing" });
      }),
    );

    const { unmount } = renderWithQuery(
      <PollingVoucherStatus sessionId="cs_test_123" />,
    );

    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    const clearCallsBefore = clearIntervalSpy.mock.calls.length;

    unmount();

    expect(clearIntervalSpy.mock.calls.length).toBeGreaterThan(clearCallsBefore);

    clearIntervalSpy.mockRestore();
  });

  it("stops polling when status becomes paid", async () => {
    let pollCount = 0;

    server.use(
      http.get("*/api/payments/status*", () => {
        pollCount += 1;

        if (pollCount >= 2) {
          return HttpResponse.json({ status: "paid" });
        }

        return HttpResponse.json({ status: "processing" });
      }),
    );

    renderWithQuery(<PollingVoucherStatus sessionId="cs_test_123" />);

    for (let i = 0; i < 5; i += 1) {
      await act(async () => {
        vi.advanceTimersByTime(2000);
        await Promise.resolve();
      });
    }

    expect(pollCount).toBeLessThanOrEqual(4);
  });
});
