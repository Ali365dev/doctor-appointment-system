import "server-only";
import { connectDB } from "@/services/mongodb";
import { generateAppointmentNumber } from "@/lib/appointmentNumber";
import { findClinicById } from "@/services/mongodb/repositories/clinic.repository";
import { findProcedureById } from "@/services/mongodb/repositories/procedure.repository";
import { findAssignment } from "@/services/mongodb/repositories/clinicProcedure.repository";
import { generateSlotsForDate } from "@/lib/slots";
import { sendNotification } from "@/services/notifications";
import { bookingConfirmationEmail, cancellationEmail, appointmentConfirmedEmail } from "@/services/notifications/templates";
import { createGoogleMeetEvent, isGoogleCalendarConfigured } from "@/services/google/calendar";
import {
  createAppointment as createAppointmentRecord,
  findAppointmentByClinicDateTime,
  findAppointmentById,
  findAppointmentsByPatientId,
  findAllAppointments,
  findBookedTimesForClinicDate,
  updateAppointmentStatus,
  linkAppointmentPayment,
  setAppointmentMeetingLink,
} from "@/services/mongodb/repositories/appointment.repository";
import type { AppointmentDoc } from "@/services/mongodb/models/Appointment";
import type { AppointmentStatus, AppointmentType, PatientSnapshot, VisitType } from "@/types/appointment";
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
  appointmentType?: AppointmentType;
  procedureId?: string;
  referralDoctor?: string;
  medicalReportUrl?: string;
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

  // Never trust a client-sent procedure name/price/duration — always re-resolve
  // server-side from the Procedure doc and its clinic-specific assignment, and
  // reject bookings for a procedure that isn't (or is no longer) offered here.
  let procedureId: string | undefined;
  let procedureNameSnapshot: string | undefined;
  let durationMinutes: number = clinic.defaultSlotDurationMinutes;
  let totalAmount: number = clinic.feePkr;

  if (params.procedureId) {
    const procedure = await findProcedureById(params.procedureId);
    if (!procedure || procedure.isArchived) {
      throw new AppointmentServiceError("Procedure not found", 404);
    }
    if (!procedure.isActive) {
      throw new AppointmentServiceError("This procedure is no longer available for booking", 409);
    }
    const assignment = await findAssignment(params.clinicId, params.procedureId);
    if (!assignment || !assignment.isActive) {
      throw new AppointmentServiceError("This procedure is not offered at the selected clinic", 409);
    }
    procedureId = params.procedureId;
    procedureNameSnapshot = procedure.name;
    durationMinutes = assignment.durationOverrideMinutes ?? procedure.durationMinutes;
    totalAmount = assignment.priceOverridePkr ?? procedure.pricePkr;
  }

  const appointmentNumber = await generateAppointmentNumber();

  let appointment;
  try {
    appointment = await createAppointmentRecord({
      appointmentNumber,
      patientId: params.patientId,
      clinicId: params.clinicId,
      visitType: params.visitType,
      date: params.date,
      time: params.time,
      reason: params.reason,
      patientSnapshot: params.patient,
      feeSnapshotPkr: totalAmount,
      appointmentType: params.appointmentType ?? "consultation",
      procedureId,
      procedureNameSnapshot,
      durationMinutes,
      totalAmount,
      referralDoctor: params.referralDoctor,
      medicalReportUrl: params.medicalReportUrl,
      paymentMethod: params.paymentMethod,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_ALREADY_BOOKED") {
      throw new AppointmentServiceError("This time slot has already been booked", 409);
    }
    throw err;
  }

  // Best-effort — a missing SMTP/WhatsApp config must never block booking creation.
  void sendNotification(
    { email: params.patient.email, phone: params.patient.phone },
    bookingConfirmationEmail({
      patientName: params.patient.fullName,
      appointmentNumber,
      appointmentId: String(appointment._id),
      clinicName: clinic.name,
      procedureName: procedureNameSnapshot,
      date: params.date,
      time: params.time,
      feePkr: totalAmount,
    })
  );

  return appointment;
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

  if (status === "cancelled" || status === "rejected") {
    void sendNotification(
      { email: updated.patientSnapshot.email, phone: updated.patientSnapshot.phone },
      cancellationEmail({
        patientName: updated.patientSnapshot.fullName,
        appointmentNumber: updated.appointmentNumber,
        date: updated.date,
        time: updated.time,
        status,
        note,
      })
    );
  } else if (status === "confirmed") {
    // Covers every path to "confirmed" — payment verified, pay-at-reception,
    // and an admin manually confirming from the appointments panel.
    let meetingLink = updated.meetingLink ?? undefined;
    if (updated.visitType === "online" && !meetingLink && isGoogleCalendarConfigured()) {
      // Best-effort — a Calendar API hiccup must never block confirming the
      // appointment; the doctor can still share a link manually if this fails.
      try {
        const link = await createGoogleMeetEvent({
          appointmentNumber: updated.appointmentNumber,
          patientName: updated.patientSnapshot.fullName,
          date: updated.date,
          time: updated.time,
          durationMinutes: updated.durationMinutes,
        });
        if (link) {
          await setAppointmentMeetingLink(appointmentId, link);
          meetingLink = link;
        }
      } catch (err) {
        console.warn("[google-calendar] Failed to create Meet link:", err);
      }
    }

    void sendNotification(
      { email: updated.patientSnapshot.email, phone: updated.patientSnapshot.phone },
      appointmentConfirmedEmail({
        patientName: updated.patientSnapshot.fullName,
        appointmentNumber: updated.appointmentNumber,
        appointmentId: String(updated._id),
        date: updated.date,
        time: updated.time,
        meetingLink,
      })
    );
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
  appointmentType: AppointmentType;
  procedureName?: string;
  durationMinutes: number;
  visitType: VisitType;
  meetingLink?: string;
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
    appointmentType: appointment.appointmentType as AppointmentType,
    procedureName: appointment.procedureNameSnapshot ?? undefined,
    durationMinutes: appointment.durationMinutes,
    visitType: appointment.visitType as VisitType,
    meetingLink: appointment.meetingLink ?? undefined,
  };
}
