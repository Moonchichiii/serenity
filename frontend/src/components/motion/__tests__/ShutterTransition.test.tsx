import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ShutterProvider,
  useShutter,
} from "@/components/motion/ShutterTransition";

/* Reduced-motion path: no overlay, no gsap, actions run instantly. */
vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));

vi.mock("@/lib/motion/gsap", () => ({
  loadGsap: vi.fn(() => {
    throw new Error("gsap must not load under reduced motion");
  }),
}));

function Probe() {
  const { run, isTransitioning } = useShutter();
  return (
    <button
      type="button"
      data-state={isTransitioning ? "busy" : "idle"}
      onClick={() => {
        void run(() => {
          document.title = "acted";
        });
      }}
    >
      go
    </button>
  );
}

describe("ShutterProvider (reduced motion)", () => {
  it("renders children and keeps the overlay hidden", () => {
    render(
      <ShutterProvider>
        <p>content</p>
      </ShutterProvider>,
    );
    expect(screen.getByText("content")).toBeInTheDocument();
    const overlay = screen.getByTestId("shutter-overlay");
    expect(overlay).toHaveStyle({ display: "none" });
    expect(overlay).toHaveAttribute("aria-hidden", "true");
  });

  it("runs the action immediately without animating", async () => {
    document.title = "before";
    render(
      <ShutterProvider>
        <Probe />
      </ShutterProvider>,
    );
    screen.getByRole("button").click();
    await vi.waitFor(() => {
      expect(document.title).toBe("acted");
    });
    expect(screen.getByRole("button").dataset["state"]).toBe("idle");
  });

  it("throws a clear error when useShutter is used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/inside <ShutterProvider>/);
    spy.mockRestore();
  });
});
