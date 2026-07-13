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

export const APPOINTMENT_TYPES = ["consultation", "procedure", "follow_up"] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

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

// Snapshotted at booking time so later edits to a Procedure (price, name,
// duration) never retroactively change an already-booked appointment.
export interface ProcedureSnapshot {
  procedureId: string;
  name: string;
  pricePkr: number;
  durationMinutes: number;
}
