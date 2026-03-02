import { apiClient } from "@/api/client";
import type {
  CheckoutRequest,
  CheckoutResponse,
  PaymentStatusResponse,
} from "@/types/api/payments";

export const paymentsApi = {
  createCheckout: async (payload: CheckoutRequest): Promise<CheckoutResponse> => {
    const res = await apiClient.post<CheckoutResponse>("/api/payments/checkout/", payload);
    return res.data;
  },

  // Optional (recommended) if you add a backend status endpoint:
  getPaymentStatus: async (sessionId: string): Promise<PaymentStatusResponse> => {
    const res = await apiClient.get<PaymentStatusResponse>(
      `/api/payments/status/?session_id=${encodeURIComponent(sessionId)}`,
    );
    return res.data;
  },
};
