import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ErrorBoundary,
  ErrorFallback,
  SectionErrorBoundary,
} from "../ErrorBoundary";

// A component that throws on render
function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test explosion");
  }
  return <div>All good</div>;
}

describe("ErrorBoundary", () => {
  // Suppress React's console.error for error boundary tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("renders children when no error is thrown", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("renders default fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText(/something went wrong/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.getByText("Go Back")).toBeInTheDocument();
    expect(screen.getByText("Go Home")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error page</div>}>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error page")).toBeInTheDocument();
    expect(
      screen.queryByText(/something went wrong/i)
    ).not.toBeInTheDocument();
  });

  it("calls onError callback when a child throws", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Test explosion" }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });
});

describe("ErrorFallback", () => {
  it("renders error message", () => {
    render(<ErrorFallback error={new Error("Boom")} />);

    expect(screen.getByText("Boom")).toBeInTheDocument();
  });

  it("renders generic message when no error provided", () => {
    render(<ErrorFallback />);

    expect(
      screen.getByText(/unexpected error/i)
    ).toBeInTheDocument();
  });

  it("calls resetError when Try Again is clicked", async () => {
    const user = userEvent.setup();
    const resetError = vi.fn();

    render(<ErrorFallback error={new Error("Boom")} resetError={resetError} />);

    await user.click(screen.getByText("Try Again"));
    expect(resetError).toHaveBeenCalledTimes(1);
  });
});

describe("SectionErrorBoundary", () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("renders section-level error message on throw", () => {
    render(
      <SectionErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </SectionErrorBoundary>
    );

    expect(
      screen.getByText(/this section failed to load/i)
    ).toBeInTheDocument();
  });
});
