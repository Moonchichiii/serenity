export interface GiftVoucherSubmission {
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  message?: string;

  // Optional booking/slot fields
  serviceId?: number;
  startDatetime?: string;
  endDatetime?: string;
}

export interface GiftVoucherResponse {
  code: string;

  // Slot metadata (voucher-owned)
  calendar_event_id: string;
  calendar_event_link: string;
  calendar_event_status: string;

  // Optional echoes (if you include them in backend response)
  service_id?: number | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
}
