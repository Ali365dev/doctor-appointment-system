export const APPOINTMENT_STATUSES = [
  "pending_payment",
  "payment_submitted",
  "payment_verification",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
  "rescheduled",
  "no_show",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const VISIT_TYPES = ["clinic", "online"] as const;
export type VisitType = (typeof VISIT_TYPES)[number];

export const GENDERS = ["Male", "Female", "Other"] as const;
export type Gender = (typeof GENDERS)[number];

export interface PatientSnapshot {
  fullName: string;
  phone: string;
  gender: Gender;
  age: number;
  cnic?: string;
  email?: string;
  city: string;
  isExisting: boolean;
  condition?: string;
  notes?: string;
}
