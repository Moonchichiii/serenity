export type CheckoutRequest = {
  sender_name: string;
  sender_email: string;
  recipient_name: string;
  recipient_email: string;

  message?: string;
  amount: string | number; // match what your form provides; backend will Decimal(str())
  preferred_language: "fr" | "en";

  // Optional booking fields (must be all-or-nothing)
  service_id?: number;
  start_datetime?: string; // ISO
  end_datetime?: string;   // ISO
};
