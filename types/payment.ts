export const PAYMENT_STATUSES = [
  "pending",
  "submitted",
  "verified",
  "rejected",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ["bank", "jazzcash", "easypaisa", "reception"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
