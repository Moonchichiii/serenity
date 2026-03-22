import { mutationOptions, useMutation } from "@tanstack/react-query";
import { paymentsApi } from "@/api/payments.api";
import { normalizeHttpError, type ApiError } from "@/api/httpError";
import type { CheckoutRequest, CheckoutResponse } from "@/types/api/payments";

export const createCheckoutMutationOptions = () =>
  mutationOptions<CheckoutResponse, ApiError, CheckoutRequest>({
    mutationKey: ["payments", "checkout"],
    mutationFn: async (payload) => {
      try {
        return await paymentsApi.createCheckout(payload);
      } catch (e) {
        throw normalizeHttpError(e);
      }
    },
  });

export function useCreateCheckoutMutation() {
  return useMutation(createCheckoutMutationOptions());
}
