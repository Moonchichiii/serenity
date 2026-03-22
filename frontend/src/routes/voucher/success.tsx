/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle,
  Home,
  Calendar,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { paymentsApi } from "@/api/payments.api";

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

  // Initialize state based on whether session_id exists
  const [status, setStatus] = useState<
    "loading" | "paid" | "processing" | "failed"
  >(session_id ? "loading" : "failed");

  useEffect(() => {
    // If no session_id, just return. The state is already "failed"
    if (!session_id) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 15;

    const checkStatus = async (): Promise<boolean> => {
      try {
        const data = await paymentsApi.getPaymentStatus(session_id);

        if (cancelled) return true;

        if (data.status === "paid") {
          setStatus("paid");
          return true;
        }

        if (
          data.status === "failed" ||
          data.status === "canceled"
        ) {
          setStatus("failed");
          return true;
        }

        setStatus("processing");
        return false;
      } catch (error) {
        console.error("Failed to check status", error);
        return false;
      }
    };

    void checkStatus();

    const interval = window.setInterval(async () => {
      attempts += 1;
      const done = await checkStatus();

      if (done || attempts >= maxAttempts) {
        window.clearInterval(interval);
        if (!done && !cancelled) {
          setStatus("failed");
        }
      }
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [session_id]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-sand-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-warm-grey-100 animate-fade-in">
        {/* ICON */}
        <div className="mb-6 flex justify-center">
          {status === "paid" ? (
            <div className="h-20 w-20 bg-sage-100 rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle className="h-10 w-10 text-sage-600" />
            </div>
          ) : status === "failed" ? (
            <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          ) : (
            <div className="h-20 w-20 bg-terracotta-50 rounded-full flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-terracotta-500 animate-spin" />
            </div>
          )}
        </div>

        {/* TITLE */}
        <h1 className="text-3xl font-heading font-bold text-sage-900 mb-2">
          {status === "paid"
            ? "Payment Successful!"
            : status === "failed"
              ? "Something Went Wrong"
              : "Processing Payment..."}
        </h1>

        {/* DESCRIPTION */}
        <div className="text-charcoal/70 space-y-4 mb-8">
          {status === "paid" ? (
            <>
              <p>
                Thank you! Your booking is confirmed and your
                gift voucher has been sent via email.
              </p>
              <div className="bg-sage-50/50 p-4 rounded-xl text-sm border border-sage-100">
                <p className="font-semibold text-sage-800">
                  Check your inbox
                </p>
                <p>
                  We've sent the confirmation to the email
                  address you provided.
                </p>
              </div>
            </>
          ) : status === "failed" ? (
            <>
              <p>
                We couldn't confirm your payment. If you were
                charged, please contact us and we'll sort it out
                right away.
              </p>
              <div className="bg-red-50/50 p-4 rounded-xl text-sm border border-red-100">
                <p className="font-semibold text-red-800">
                  Need help?
                </p>
                <p>
                  Email us with your reference number and we'll
                  investigate immediately.
                </p>
              </div>
            </>
          ) : (
            <p>
              Please wait a moment while we confirm your
              transaction with the bank. Do not close this
              window.
            </p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="w-full py-3 px-4 bg-sage-deep hover:bg-sage-800 text-white rounded-xl font-medium transition-all shadow-warm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return to Home
          </Link>

          <Link
            to="/"
            search={{ modal: "gift" }}
            className="w-full py-3 px-4 bg-white hover:bg-sand-50 text-sage-900 border border-warm-grey-200 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Book Another
          </Link>
        </div>

        {session_id && (
          <p className="mt-8 text-[10px] text-charcoal/30 font-mono">
            Ref: {session_id.slice(-8)}
          </p>
        )}
      </div>
    </div>
  );
}
