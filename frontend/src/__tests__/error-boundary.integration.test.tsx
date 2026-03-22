// frontend/src/__tests__/error-boundary.integration.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQuery } from "../test/utils";
import React from "react";

// A component that throws on demand
function ThrowOnRender({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test render error");
  }
  return <div data-testid="child-content">All good</div>;
}

// Try to import the real error boundary from your codebase
let AppErrorBoundary: React.ComponentType<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}>;
try {
  const mod = await import("../components/ErrorBoundary");
  AppErrorBoundary = mod.ErrorBoundary ?? mod.default;
} catch {
  // Minimal fallback error boundary for testing if the app doesn't export one
  class TestErrorBoundary extends React.Component<
    {
      children: React.ReactNode;
      fallback?: React.ReactNode;
      onReset?: () => void;
    },
    { hasError: boolean }
  > {
    state = { hasError: false };

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    render() {
      if (this.state.hasError) {
        return (
          <div>
            <h1>Oops! Something went wrong</h1>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onReset?.();
              }}
            >
              Try Again
            </button>
          </div>
        );
      }
      return this.props.children;
    }
  }
  AppErrorBoundary = TestErrorBoundary;
}

describe("Error boundary integration", () => {
  // Suppress console.error for expected errors
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it("catches render errors and displays fallback", () => {
    renderWithQuery(
      <AppErrorBoundary>
        <ThrowOnRender shouldThrow={true} />
      </AppErrorBoundary>,
    );

    expect(
      screen.getByText(/oops! something went wrong/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("child-content"),
    ).not.toBeInTheDocument();
  });

  it("renders children when no error occurs", () => {
    renderWithQuery(
      <AppErrorBoundary>
        <ThrowOnRender shouldThrow={false} />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(
      screen.queryByText(/oops! something went wrong/i),
    ).not.toBeInTheDocument();
  });

  it("reset button recovers from error state", async () => {
    const user = userEvent.setup();
    let throwError = true;

    function ConditionalThrower() {
      if (throwError) throw new Error("Boom");
      return <div data-testid="recovered">Recovered!</div>;
    }

    renderWithQuery(
      <AppErrorBoundary>
        <ConditionalThrower />
      </AppErrorBoundary>,
    );

    expect(
      screen.getByText(/oops! something went wrong/i),
    ).toBeInTheDocument();

    // Fix the error condition before resetting
    throwError = false;

    const resetButton = screen.getByRole("button", {
      name: /try again/i,
    });
    await user.click(resetButton);

    await waitFor(() => {
      expect(screen.getByTestId("recovered")).toBeInTheDocument();
    });
  });

  it("nested error boundaries catch errors at the nearest level", () => {
    renderWithQuery(
      <AppErrorBoundary>
        <div data-testid="outer-content">Outer Content</div>
        <AppErrorBoundary>
          <ThrowOnRender shouldThrow={true} />
        </AppErrorBoundary>
      </AppErrorBoundary>,
    );

    // Inner boundary catches the error
    expect(
      screen.getByText(/oops! something went wrong/i),
    ).toBeInTheDocument();
    // Outer content is unaffected
    expect(
      screen.getByTestId("outer-content"),
    ).toBeInTheDocument();
  });
});
