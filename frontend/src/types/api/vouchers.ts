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

  calendar_event_id: string;
  calendar_event_link: string;
  calendar_event_status: string;

  service_id?: number | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
}
