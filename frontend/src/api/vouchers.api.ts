import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type {
  GiftVoucherSubmission,
  GiftVoucherResponse,
} from "@/types/api";

type VoucherCreatePayload = {
  sender_name: string;
  sender_email: string;
  recipient_name: string;
  recipient_email: string;
  message: string;

  service_id?: number;
  start_datetime?: string;
  end_datetime?: string;
};

export const vouchersApi = {
  create: async (
    data: GiftVoucherSubmission,
  ): Promise<GiftVoucherResponse> => {
    const payload: VoucherCreatePayload = {
      sender_name: data.senderName,
      sender_email: data.senderEmail,
      recipient_name: data.recipientName,
      recipient_email: data.recipientEmail,
      message: data.message ?? "",
      ...(typeof data.serviceId === "number" &&
      data.startDatetime &&
      data.endDatetime
        ? {
            service_id: data.serviceId,
            start_datetime: data.startDatetime,
            end_datetime: data.endDatetime,
          }
        : {}),
    };

    const res = await apiClient.post<GiftVoucherResponse>(
      endpoints.voucherCreate(),
      payload,
    );
    return res.data;
  },
};
