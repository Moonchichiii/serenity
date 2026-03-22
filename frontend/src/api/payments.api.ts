import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  CheckoutRequest,
  CheckoutResponse,
  PaymentStatusResponse,
} from "@/types/api/payments";

export const paymentsApi = {
  createCheckout: async (
    payload: CheckoutRequest,
  ): Promise<CheckoutResponse> => {
    const res = await apiClient.post<CheckoutResponse>(
      endpoints.paymentsCheckout(),
      payload,
    );
    return res.data;
  },

  getPaymentStatus: async (
    sessionId: string,
  ): Promise<PaymentStatusResponse> => {
    const res = await apiClient.get<PaymentStatusResponse>(
      `${endpoints.paymentsStatus()}?session_id=${encodeURIComponent(sessionId)}`,
    );
    return res.data;
  },
};
