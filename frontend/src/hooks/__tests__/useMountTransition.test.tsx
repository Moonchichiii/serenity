import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useMountTransition } from "@/hooks/useMountTransition";

function Probe({ isOpen }: { isOpen: boolean }) {
  const { rendered, open } = useMountTransition(isOpen, 50);
  if (!rendered) return null;
  return <div data-testid="panel" data-open={open} />;
}

describe("useMountTransition", () => {
  it("mounts closed, then opens; unmounts after exit delay", async () => {
    const { rerender } = render(<Probe isOpen={false} />);
    expect(screen.queryByTestId("panel")).toBeNull();

    rerender(<Probe isOpen />);
    await waitFor(() =>
      expect(screen.getByTestId("panel").dataset["open"]).toBe("true"),
    );

    rerender(<Probe isOpen={false} />);
    await waitFor(() =>
      expect(screen.getByTestId("panel").dataset["open"]).toBe("false"),
    );
    await waitFor(() => expect(screen.queryByTestId("panel")).toBeNull());
  });
});
