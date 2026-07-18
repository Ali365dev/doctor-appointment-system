import type { AppointmentStatus } from "@/types/appointment";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";

export type PatientAppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

/** Collapses the detailed internal AppointmentStatus into the 4 buckets patients see. */
export function toPatientAppointmentStatus(status: AppointmentStatus): PatientAppointmentStatus {
  switch (status) {
    case "confirmed":
    case "rescheduled":
      return "Confirmed";
    case "completed":
      return "Completed";
    case "cancelled":
    case "rejected":
    case "no_show":
      return "Cancelled";
    default:
      return "Pending";
  }
}

export const APPOINTMENT_STATUS_BADGE: Record<PatientAppointmentStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
};

export type PatientPaymentStatus = "Pending" | "Pending Verification" | "Paid" | "Failed" | "Rejected" | "Refunded";

/** Maps the internal PaymentStatus to the patient-facing label from the spec. */
export function toPatientPaymentStatus(status: PaymentStatus): PatientPaymentStatus {
  switch (status) {
    case "submitted":
      return "Pending Verification";
    case "verified":
      return "Paid";
    case "rejected":
      return "Rejected";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      return "Pending";
  }
}

export const PAYMENT_STATUS_BADGE: Record<PatientPaymentStatus, string> = {
  Pending: "bg-orange-100 text-orange-700",
  "Pending Verification": "bg-amber-100 text-amber-700",
  Paid: "bg-emerald-100 text-emerald-700",
  Failed: "bg-red-100 text-red-700",
  Rejected: "bg-red-100 text-red-700",
  Refunded: "bg-purple-100 text-purple-700",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  bank: "Bank Transfer (UBL)",
  jazzcash: "JazzCash",
  easypaisa: "Easypaisa",
  reception: "Pay at Reception",
};
