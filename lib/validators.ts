import { Types } from "mongoose";
import { GENDERS, VISIT_TYPES, type PatientSnapshot, type VisitType, type Gender } from "@/types/appointment";
import { PAYMENT_METHODS, type PaymentMethod } from "@/types/payment";

export function isValidObjectId(value: unknown): value is string {
  return typeof value === "string" && Types.ObjectId.isValid(value);
}

export function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

export function isPastDate(dateStr: string): boolean {
  const date = new Date(`${dateStr}T00:00:00`);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  return date < todayMidnight;
}

export function isValidTimeString(value: unknown): value is string {
  return typeof value === "string" && /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(value.trim());
}

export function isValidPhone(value: unknown): value is string {
  return typeof value === "string" && /^[0-9+\-\s()]{7,15}$/.test(value.trim());
}

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidGender(value: unknown): value is Gender {
  return typeof value === "string" && (GENDERS as readonly string[]).includes(value);
}

export function isValidVisitType(value: unknown): value is VisitType {
  return typeof value === "string" && (VISIT_TYPES as readonly string[]).includes(value);
}

export function isValidPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && (PAYMENT_METHODS as readonly string[]).includes(value);
}

export interface CreateAppointmentRequestBody {
  clinicId: string;
  visitType: VisitType;
  date: string;
  time: string;
  reason?: string;
  patient: PatientSnapshot;
  paymentMethod?: PaymentMethod;
}

/**
 * Validates the raw request body for POST /api/appointments.
 * Returns an error message for the first invalid field found, or null if valid.
 */
export function validateCreateAppointmentBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Request body is required";
  const b = body as Partial<CreateAppointmentRequestBody>;

  if (!isValidObjectId(b.clinicId)) return "A valid clinicId is required";
  if (!isValidVisitType(b.visitType)) return "visitType must be 'clinic' or 'online'";
  if (!isValidDateString(b.date)) return "date must be a valid YYYY-MM-DD string";
  if (isPastDate(b.date as string)) return "Cannot book an appointment in the past";
  if (!isValidTimeString(b.time)) return "time must be a valid 'HH:MM AM/PM' string";

  const patient = b.patient;
  if (!patient || typeof patient !== "object") return "Patient information is required";
  if (!patient.fullName || !patient.fullName.trim()) return "Patient full name is required";
  if (!isValidPhone(patient.phone)) return "A valid patient phone number is required";
  if (!Number.isFinite(patient.age) || patient.age < 1 || patient.age > 120) return "Patient age must be between 1 and 120";
  if (!isValidGender(patient.gender)) return "Patient gender must be Male, Female, or Other";
  if (!patient.city || !patient.city.trim()) return "Patient city is required";
  if (patient.email && !isValidEmail(patient.email)) return "Patient email is invalid";

  if (b.paymentMethod !== undefined && !isValidPaymentMethod(b.paymentMethod)) {
    return "paymentMethod must be one of stripe, jazzcash, easypaisa, reception";
  }

  return null;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export interface UpdateProfileRequestBody {
  name?: string;
  email?: string;
  gender?: string;
  dob?: string;
  bloodType?: string;
  address?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medications?: string;
}

/**
 * Validates the raw request body for PATCH /api/profile.
 * Every field is optional (a partial update); returns an error message for
 * the first invalid field found, or null if valid.
 */
export function validateProfileUpdateBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Request body is required";
  const b = body as UpdateProfileRequestBody;

  if (b.name !== undefined && !b.name.trim()) return "Name cannot be empty";
  if (b.email !== undefined && b.email !== "" && !isValidEmail(b.email)) return "Enter a valid email address";
  if (b.gender !== undefined && !isValidGender(b.gender)) return "Gender must be Male, Female, or Other";
  if (b.dob !== undefined && b.dob !== "" && !isValidDateString(b.dob)) return "Date of birth must be a valid date";
  if (b.bloodType !== undefined && b.bloodType !== "" && !BLOOD_TYPES.includes(b.bloodType)) {
    return "Blood type must be one of A+, A-, B+, B-, AB+, AB-, O+, O-";
  }
  if (b.emergencyContactPhone !== undefined && b.emergencyContactPhone !== "" && !isValidPhone(b.emergencyContactPhone)) {
    return "Enter a valid emergency contact phone number";
  }

  return null;
}
