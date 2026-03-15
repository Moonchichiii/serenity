import { describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderHookWithQuery } from "@/test/utils";
import { useSubmitContact } from "@/hooks/useContact";
import { server } from "@/mocks/server";
import { errorOverrides } from "@/mocks/handlers";

describe("useSubmitContact — error paths", () => {
  it("surfaces DRF field validation errors on 400", async () => {
    server.use(errorOverrides.contactValidationError());

    const { result } = renderHookWithQuery(() => useSubmitContact());

    result.current.mutate({
      name: "",
      email: "bad",
      phone: "123",
      subject: "Test",
      message: "Hello",
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const error = result.current.error;
    expect(error).toBeDefined();
    expect(error?.status).toBe(400);
    expect(error?.message).toBe("Validation error");
    expect(error?.fieldErrors).toEqual({
      email: ["Enter a valid email address."],
      name: ["This field is required."],
    });
  });

  it("surfaces detail message on 500", async () => {
    server.use(errorOverrides.contactServerError());

    const { result } = renderHookWithQuery(() => useSubmitContact());

    result.current.mutate({
      name: "Alice",
      email: "alice@example.com",
      phone: "123",
      subject: "Test",
      message: "Hello",
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const error = result.current.error;
    expect(error?.status).toBe(500);
    expect(error?.message).toBe("Internal server error.");
    expect(error?.fieldErrors).toBeUndefined();
  });
});
