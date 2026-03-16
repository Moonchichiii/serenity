import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "../FormField";
import type { FieldError } from "react-hook-form";

describe("FormField", () => {
  it("renders label and children", () => {
    render(
      <FormField label="Email">
        <input data-testid="input" />
      </FormField>
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("renders error message with alert role when error is present", () => {
    const error: FieldError = {
      type: "required",
      message: "Email is required",
    };

    render(
      <FormField label="Email" error={error}>
        <input />
      </FormField>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Email is required");
  });

  it("does not render error element when no error", () => {
    render(
      <FormField label="Email">
        <input />
      </FormField>
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
