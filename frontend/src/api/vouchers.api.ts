import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type {
  GiftVoucherSubmission,
  GiftVoucherResponse,
} from "@/types/api";

type VoucherCreatePayload = {
  purchaser_name: string;
  purchaser_email: string;
  recipient_name: string;
  recipient_email: string;
  message: string;
  preferred_date: string | null;
  service_id?: number;
  start_datetime?: string;
  end_datetime?: string;
};

export const vouchersApi = {
  create: async (
    data: GiftVoucherSubmission,
  ): Promise<GiftVoucherResponse> => {
    const payload: VoucherCreatePayload = {
      purchaser_name: data.purchaserName,
      purchaser_email: data.purchaserEmail,
      recipient_name: data.recipientName,
      recipient_email: data.recipientEmail,
      message: data.message ?? "",
      preferred_date: data.preferredDate ? data.preferredDate : null,
      ...(data.serviceId && {
        service_id: data.serviceId,
        start_datetime: data.startDatetime,
        end_datetime: data.endDatetime,
      }),
    };

    const res = await apiClient.post<GiftVoucherResponse>(
      endpoints.voucherCreate(),
      payload,
    );
    return res.data;
  },
};
