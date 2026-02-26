import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  renderHook,
  type RenderOptions,
  type RenderHookOptions,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/**
 * Creates a fresh QueryClient for each test with
 * no retries and instant gc (so tests don't leak).
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        gcTime: 0,
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface WrapperProps {
  children: ReactNode;
}

/**
 * Render a component with a fresh QueryClient.
 * Returns the queryClient so tests can inspect the cache.
 */
export function renderWithQuery(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

/**
 * Render a hook with a fresh QueryClient wrapper.
 * Returns the queryClient for cache inspection alongside the hook result.
 */
export function renderHookWithQuery<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, "wrapper">
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...renderHook(hook, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

/**
 * Collects every request URL that hits MSW.
 * Use in tests to assert call counts and detect phantom requests.
 */
export function createRequestSpy() {
  const calls: { method: string; url: string; body?: unknown }[] = [];

  return {
    calls,

    /**
     * Call inside an MSW handler to record the request.
     */
    track(method: string, url: string, body?: unknown) {
      calls.push({ method, url, body });
    },

    /** Number of requests matching a substring in the URL */
    countByUrl(substring: string) {
      return calls.filter((c) => c.url.includes(substring)).length;
    },

    countByMethod(method: string, substring: string) {
      return calls.filter(
        (r) =>
          r.method.toUpperCase() === method.toUpperCase() &&
          r.url.includes(substring)
      ).length;
    },

    /** All POST bodies sent to a URL matching the substring */
    bodiesFor(substring: string) {
      return calls
        .filter((c) => c.url.includes(substring))
        .map((c) => c.body);
    },

    /** Asserts no requests were made to unexpected URLs */
    assertNoPhantoms(allowedSubstrings: string[]) {
      const phantoms = calls.filter(
        (c) => !allowedSubstrings.some((s) => c.url.includes(s))
      );
      if (phantoms.length > 0) {
        throw new Error(
          `Phantom requests detected:\n${phantoms
            .map((p) => `  ${p.method} ${p.url}`)
            .join("\n")}`
        );
      }
    },

    reset() {
      calls.length = 0;
    },
  };
}
