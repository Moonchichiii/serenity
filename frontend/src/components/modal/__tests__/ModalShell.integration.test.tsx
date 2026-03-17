import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQuery } from "../../../test/utils";
import { ModalShell } from "../ModalShell";

describe("ModalShell integration", () => {
  it("renders children when open", () => {
    const onClose = vi.fn();

    renderWithQuery(
      <ModalShell isOpen={true} onClose={onClose}>
        <div data-testid="modal-body">Modal Content</div>
      </ModalShell>,
    );

    expect(screen.getByTestId("modal-body")).toBeInTheDocument();
  });

  it("does not render children when closed", () => {
    const onClose = vi.fn();

    renderWithQuery(
      <ModalShell isOpen={false} onClose={onClose}>
        <div data-testid="modal-body">Modal Content</div>
      </ModalShell>,
    );

    expect(screen.queryByTestId("modal-body")).not.toBeInTheDocument();
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();

    renderWithQuery(
      <ModalShell isOpen={true} onClose={onClose}>
        <div>Content</div>
      </ModalShell>,
    );

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("calls onClose when backdrop/overlay is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithQuery(
      <ModalShell isOpen={true} onClose={onClose}>
        <div data-testid="inner">Content</div>
      </ModalShell>,
    );

    // Click the overlay (the shell container, not the inner content)
    const overlay = screen
      .getByTestId("inner")
      .closest("[data-testid='modal-overlay']") ??
      screen.getByRole("dialog")?.parentElement;

    if (overlay) {
      await user.click(overlay);
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    }
  });

  it("does not call onClose when inner content is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithQuery(
      <ModalShell isOpen={true} onClose={onClose}>
        <div data-testid="inner">Content</div>
      </ModalShell>,
    );

    await user.click(screen.getByTestId("inner"));

    // Allow any microtasks to settle
    await waitFor(() => {
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it("cleans up event listeners on unmount", () => {
    const onClose = vi.fn();
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderWithQuery(
      <ModalShell isOpen={true} onClose={onClose}>
        <div>Content</div>
      </ModalShell>,
    );

    const keydownListenerCount = addSpy.mock.calls.filter(
      ([event]) => event === "keydown",
    ).length;

    unmount();

    const removedKeydownCount = removeSpy.mock.calls.filter(
      ([event]) => event === "keydown",
    ).length;

    expect(removedKeydownCount).toBeGreaterThanOrEqual(keydownListenerCount);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
