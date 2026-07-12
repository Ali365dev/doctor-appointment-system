import "server-only";
import { connectDB } from "@/services/mongodb";
import { generateAppointmentNumber } from "@/lib/appointmentNumber";
import { findClinicById } from "@/services/mongodb/repositories/clinic.repository";
import { generateSlotsForDate } from "@/lib/slots";
import {
  createAppointment as createAppointmentRecord,
  findAppointmentByClinicDateTime,
  findAppointmentById,
  findAppointmentsByPatientId,
  findAllAppointments,
  findBookedTimesForClinicDate,
  updateAppointmentStatus,
  linkAppointmentPayment,
} from "@/services/mongodb/repositories/appointment.repository";
import type { AppointmentDoc } from "@/services/mongodb/models/Appointment";
import type { AppointmentStatus, PatientSnapshot, VisitType } from "@/types/appointment";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";

export interface CreateAppointmentParams {
  patientId?: string;
  clinicId: string;
  visitType: VisitType;
  date: string;
  time: string;
  reason?: string;
  patient: PatientSnapshot;
  paymentMethod?: PaymentMethod;
}

export class AppointmentServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Creates an appointment after validating the clinic is active and the
 * requested slot isn't already taken. The appointment number is generated
 * server-side (never trust a client-supplied reference).
 */
export async function createAppointment(params: CreateAppointmentParams): Promise<AppointmentDoc> {
  await connectDB();

  const clinic = await findClinicById(params.clinicId);
  if (!clinic) {
    throw new AppointmentServiceError("Clinic not found", 404);
  }
  if (!clinic.isActive) {
    throw new AppointmentServiceError("This clinic is not currently accepting bookings", 409);
  }

  const validSlots = generateSlotsForDate(clinic.schedule, clinic.defaultSlotDurationMinutes, params.date);
  if (!validSlots.includes(params.time)) {
    throw new AppointmentServiceError("This clinic is closed at the requested date/time", 409);
  }

  const existing = await findAppointmentByClinicDateTime(params.clinicId, params.date, params.time);
  if (existing) {
    throw new AppointmentServiceError("This time slot has already been booked", 409);
  }

  const appointmentNumber = await generateAppointmentNumber();

  return createAppointmentRecord({
    appointmentNumber,
    patientId: params.patientId,
    clinicId: params.clinicId,
    visitType: params.visitType,
    date: params.date,
    time: params.time,
    reason: params.reason,
    patientSnapshot: params.patient,
    feeSnapshotPkr: clinic.feePkr,
    paymentMethod: params.paymentMethod,
  });
}

export async function getAppointmentById(appointmentId: string): Promise<AppointmentDoc> {
  await connectDB();
  const appointment = await findAppointmentById(appointmentId);
  if (!appointment) {
    throw new AppointmentServiceError("Appointment not found", 404);
  }
  return appointment;
}

export async function getAppointmentsForPatient(patientId: string): Promise<AppointmentDoc[]> {
  await connectDB();
  return findAppointmentsByPatientId(patientId);
}

export async function getAllAppointments(filter?: { status?: AppointmentStatus }): Promise<AppointmentDoc[]> {
  await connectDB();
  return findAllAppointments(filter);
}

export async function changeAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  changedBy: string,
  note?: string
): Promise<AppointmentDoc> {
  await connectDB();
  const appointment = await findAppointmentById(appointmentId);
  if (!appointment) {
    throw new AppointmentServiceError("Appointment not found", 404);
  }
  const updated = await updateAppointmentStatus(appointmentId, status, changedBy, note);
  if (!updated) {
    throw new AppointmentServiceError("Appointment not found", 404);
  }
  return updated;
}

export async function cancelAppointment(
  appointmentId: string,
  changedBy: string,
  note?: string
): Promise<AppointmentDoc> {
  return changeAppointmentStatus(appointmentId, "cancelled", changedBy, note);
}

export async function attachPaymentToAppointment(appointmentId: string, paymentId: string): Promise<void> {
  await connectDB();
  await linkAppointmentPayment(appointmentId, paymentId);
}

export async function getBookedTimesForClinicDate(clinicId: string, date: string): Promise<string[]> {
  await connectDB();
  return findBookedTimesForClinicDate(clinicId, date);
}

export interface AppointmentConfirmation {
  appointmentNumber: string;
  status: AppointmentStatus;
  clinicName: string;
  date: string;
  time: string;
  patientName: string;
  feeSnapshotPkr: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
}

/**
 * Minimal, non-sensitive read used by the public booking success page.
 * Deliberately unauthenticated (bookings can be made without an account) —
 * only returns display fields, never the full appointment/patient document.
 */
export async function getAppointmentConfirmation(appointmentId: string): Promise<AppointmentConfirmation> {
  await connectDB();
  // findAppointmentById already populates clinicId/paymentId with the fields
  // needed below — clinicId/paymentId here are populated objects, not raw
  // ObjectIds, so never re-fetch them by casting to a string.
  const appointment = await findAppointmentById(appointmentId);
  if (!appointment) {
    throw new AppointmentServiceError("Appointment not found", 404);
  }

  const clinic = appointment.clinicId && typeof appointment.clinicId === "object" ? (appointment.clinicId as unknown as { name?: string }) : null;
  const payment = appointment.paymentId && typeof appointment.paymentId === "object" ? (appointment.paymentId as unknown as { status?: PaymentStatus }) : null;

  return {
    appointmentNumber: appointment.appointmentNumber,
    status: appointment.status as AppointmentStatus,
    clinicName: clinic?.name ?? "—",
    date: appointment.date,
    time: appointment.time,
    patientName: appointment.patientSnapshot.fullName,
    feeSnapshotPkr: appointment.feeSnapshotPkr,
    paymentMethod: appointment.paymentMethod as PaymentMethod | undefined,
    paymentStatus: payment?.status,
  };
}
