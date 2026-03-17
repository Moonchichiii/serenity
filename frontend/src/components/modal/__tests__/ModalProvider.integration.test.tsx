import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQuery } from "../../../test/utils";
import { ModalProvider, useModal } from "../ModalProvider";
import { ModalShell } from "../ModalShell";

// A harness component that gives us control over modal open/close
function ModalHarness({
  onMount,
  onUnmount,
}: {
  onMount?: () => void;
  onUnmount?: () => void;
}) {
  const { open, close, current } = useModal();

  return (
    <div>
      <button onClick={() => open("gift")}>Open Gift</button>
      <button onClick={() => open("contact")}>Open Contact</button>
      <button onClick={() => open("legal")}>Open Legal</button>
      <button onClick={() => close()}>Close Modal</button>
      <div data-testid="current-modal">{current ?? "none"}</div>
    </div>
  );
}

// Tracked component to verify mount/unmount lifecycle
function TrackedContent({
  onMount,
  onUnmount,
  label,
}: {
  onMount: () => void;
  onUnmount: () => void;
  label: string;
}) {
  React.useEffect(() => {
    onMount();
    return () => onUnmount();
  }, [onMount, onUnmount]);

  return <div data-testid="tracked-content">{label}</div>;
}

import React from "react";

describe("ModalProvider integration", () => {
  it("starts with no modal open", () => {
    renderWithQuery(
      <ModalProvider>
        <ModalHarness />
      </ModalProvider>,
    );

    expect(screen.getByTestId("current-modal")).toHaveTextContent("none");
  });

  it("opens gift modal and renders gift screen content", async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <ModalProvider>
        <ModalHarness />
      </ModalProvider>,
    );

    await user.click(screen.getByText("Open Gift"));

    await waitFor(() => {
      expect(screen.getByTestId("current-modal")).toHaveTextContent("gift");
    });
  });

  it("opens contact modal and renders contact screen content", async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <ModalProvider>
        <ModalHarness />
      </ModalProvider>,
    );

    await user.click(screen.getByText("Open Contact"));

    await waitFor(() => {
      expect(screen.getByTestId("current-modal")).toHaveTextContent("contact");
    });
  });

  it("opens legal modal and renders legal screen content", async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <ModalProvider>
        <ModalHarness />
      </ModalProvider>,
    );

    await user.click(screen.getByText("Open Legal"));

    await waitFor(() => {
      expect(screen.getByTestId("current-modal")).toHaveTextContent("legal");
    });
  });

  it("closing modal resets state to none", async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <ModalProvider>
        <ModalHarness />
      </ModalProvider>,
    );

    await user.click(screen.getByText("Open Gift"));
    await waitFor(() => {
      expect(screen.getByTestId("current-modal")).toHaveTextContent("gift");
    });

    await user.click(screen.getByText("Close Modal"));
    await waitFor(() => {
      expect(screen.getByTestId("current-modal")).toHaveTextContent("none");
    });
  });

  it("switching modals unmounts previous content before mounting new", async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <ModalProvider>
        <ModalHarness />
      </ModalProvider>,
    );

    await user.click(screen.getByText("Open Gift"));
    await waitFor(() => {
      expect(screen.getByTestId("current-modal")).toHaveTextContent("gift");
    });

    await user.click(screen.getByText("Open Contact"));
    await waitFor(() => {
      expect(screen.getByTestId("current-modal")).toHaveTextContent("contact");
    });

    // Gift content should no longer be in DOM
    expect(screen.getByTestId("current-modal")).not.toHaveTextContent("gift");
  });

  it("rapid open/close cycles don't leave stale modal content", async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <ModalProvider>
        <ModalHarness />
      </ModalProvider>,
    );

    // Rapid cycle
    await user.click(screen.getByText("Open Gift"));
    await user.click(screen.getByText("Close Modal"));
    await user.click(screen.getByText("Open Contact"));
    await user.click(screen.getByText("Close Modal"));
    await user.click(screen.getByText("Open Legal"));

    await waitFor(() => {
      expect(screen.getByTestId("current-modal")).toHaveTextContent("legal");
    });
  });
});
