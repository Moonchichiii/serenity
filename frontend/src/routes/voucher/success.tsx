/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/voucher/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id:
      typeof search["session_id"] === "string"
        ? search["session_id"]
        : undefined,
  }),
  component: VoucherSuccess,
});

function VoucherSuccess() {
  const { session_id } = Route.useSearch();

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Payment received ✅</h1>
      <p className="mt-2">
        Thanks! Your gift voucher is being prepared and will be emailed
        shortly.
      </p>

      {session_id ? (
        <p className="mt-4 text-sm opacity-80">Session: {session_id}</p>
      ) : null}

      <p className="mt-4 text-sm opacity-80">
        If you don't receive it within a few minutes, please contact us.
      </p>
    </div>
  );
}
