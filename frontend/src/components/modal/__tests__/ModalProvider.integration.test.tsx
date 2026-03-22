import React from "react";
import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQuery } from "../../../test/utils";
import { ModalProvider } from "../ModalProvider";
import { useModal } from "../useModal";

function ModalHarness() {
  const { open, close, isOpen } = useModal();

  const current = isOpen("gift")
    ? "gift"
    : isOpen("contact")
      ? "contact"
      : isOpen("legal")
        ? "legal"
        : "none";

  return (
    <div>
      <button onClick={() => open("gift")}>Open Gift</button>
      <button onClick={() => open("contact")}>Open Contact</button>
      <button onClick={() => open("legal")}>Open Legal</button>
      <button onClick={() => close()}>Close Modal</button>
      <div data-testid="current-modal">{current}</div>
    </div>
  );
}

describe("ModalProvider integration", () => {
  it("starts with no modal open", () => {
    renderWithQuery(
      <ModalProvider>
        <ModalHarness />
      </ModalProvider>,
    );

    expect(screen.getByTestId("current-modal")).toHaveTextContent("none");
  });

  it("opens gift modal", async () => {
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

  it("opens contact modal", async () => {
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

  it("opens legal modal", async () => {
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

  it("switching modals replaces previous modal state", async () => {
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

    expect(screen.getByTestId("current-modal")).not.toHaveTextContent("gift");
  });

  it("rapid open/close cycles do not leave stale modal state", async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <ModalProvider>
        <ModalHarness />
      </ModalProvider>,
    );

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
