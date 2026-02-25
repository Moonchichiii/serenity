export interface GiftVoucherSubmission {
  purchaserName: string;
  purchaserEmail: string;
  recipientName: string;
  recipientEmail: string;
  message?: string;
  preferredDate?: string;
  // Optional booking fields
  serviceId?: number;
  startDatetime?: string;
  endDatetime?: string;
}

export interface GiftVoucherResponse {
  code: string;
  booking_confirmation?: string;
}
