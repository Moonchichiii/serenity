/* eslint-disable react-refresh/only-export-components */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  renderHook,
  type RenderOptions,
  type RenderHookOptions,
  type RenderResult,
  type RenderHookResult,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { ModalProvider } from "@/components/modal/ModalProvider";

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

export function renderWithQuery(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult & { queryClient: QueryClient } {
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

function AppTestWrapper({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>{children}</ModalProvider>
    </QueryClientProvider>
  );
}

export function renderWithApp(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult & { queryClient: QueryClient } {
  const queryClient = createTestQueryClient();

  return {
    ...render(
      <AppTestWrapper queryClient={queryClient}>{ui}</AppTestWrapper>,
      options,
    ),
    queryClient,
  };
}

export function renderHookWithQuery<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, "wrapper">,
): RenderHookResult<TResult, TProps> & { queryClient: QueryClient } {
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

export function createRequestSpy() {
  const calls: { method: string; url: string; body?: unknown }[] = [];

  return {
    calls,

    track(method: string, url: string, body?: unknown) {
      calls.push({ method, url, body });
    },

    countByUrl(substring: string) {
      return calls.filter((c) => c.url.includes(substring)).length;
    },

    countByMethod(method: string, substring: string) {
      return calls.filter(
        (r) =>
          r.method.toUpperCase() === method.toUpperCase() &&
          r.url.includes(substring),
      ).length;
    },

    bodiesFor(substring: string) {
      return calls
        .filter((c) => c.url.includes(substring))
        .map((c) => c.body);
    },

    assertNoPhantoms(allowedSubstrings: string[]) {
      const phantoms = calls.filter(
        (c) => !allowedSubstrings.some((s) => c.url.includes(s)),
      );
      if (phantoms.length > 0) {
        throw new Error(
          `Phantom requests detected:\n${phantoms
            .map((p) => `  ${p.method} ${p.url}`)
            .join("\n")}`,
        );
      }
    },

    reset() {
      calls.length = 0;
    },
  };
}
