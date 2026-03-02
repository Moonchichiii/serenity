import type { CheckoutRequest } from "@/types/api/checkout";

export type CheckoutResponse = {
  url: string;
  session_id: string;
};

export type PaymentStatusResponse = {
  status: "created" | "paid" | "failed" | "canceled";
  voucher_id?: number | null;
};

// re-export so callers can just import from payments if they want
export type { CheckoutRequest };
