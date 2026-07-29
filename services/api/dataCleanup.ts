import "server-only";
import { connectDB } from "@/services/mongodb";
import {
  findAppointmentsInDateRange,
  deleteAppointmentsByIds,
} from "@/services/mongodb/repositories/appointment.repository";
import { deletePaymentsByAppointmentIds } from "@/services/mongodb/repositories/payment.repository";
import { getClinicDateString } from "@/lib/timezone";
import type { AppointmentDoc } from "@/services/mongodb/models/Appointment";

export class DataCleanupError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Today in the clinic's timezone, "YYYY-MM-DD" — matches the plain string format `Appointment.date` is stored in. */
function todayString(): string {
  return getClinicDateString();
}

function validateRange(from: string, to: string): void {
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    throw new DataCleanupError("from/to must be valid YYYY-MM-DD dates");
  }
  if (from > to) {
    throw new DataCleanupError("'from' date must be before 'to' date");
  }
  // Guardrail: this tool is for clearing out history, never for touching
  // upcoming appointments — today's date is allowed (covers same-day cleanup),
  // but a future date can't be, since that could delete not-yet-happened bookings.
  if (to > todayString()) {
    throw new DataCleanupError("'to' date cannot be in the future — this tool only deletes past or today's records");
  }
}

export interface CleanupPreview {
  appointmentCount: number;
  paymentCount: number;
  totalAmountPkr: number;
  appointments: AppointmentDoc[];
}

/** Read-only preview (also used for the "export before delete" CSV) — never deletes anything. */
export async function previewDataCleanup(from: string, to: string): Promise<CleanupPreview> {
  validateRange(from, to);
  await connectDB();
  const appointments = await findAppointmentsInDateRange(from, to);
  const paymentCount = appointments.filter((a) => a.paymentId).length;
  const totalAmountPkr = appointments.reduce((sum, a) => sum + (a.feeSnapshotPkr ?? 0), 0);
  return { appointmentCount: appointments.length, paymentCount, totalAmountPkr, appointments };
}

export interface CleanupResult {
  appointmentsDeleted: number;
  paymentsDeleted: number;
}

/**
 * Deletes every appointment (and its linked payment) with `date` in [from, to].
 * Payments are deleted first so an appointment is never left referencing a
 * payment that no longer exists, in case of a failure partway through.
 */
export async function runDataCleanup(from: string, to: string): Promise<CleanupResult> {
  validateRange(from, to);
  await connectDB();
  const appointments = await findAppointmentsInDateRange(from, to);
  const appointmentIds = appointments.map((a) => String(a._id));

  const paymentsDeleted = await deletePaymentsByAppointmentIds(appointmentIds);
  const appointmentsDeleted = await deleteAppointmentsByIds(appointmentIds);

  return { appointmentsDeleted, paymentsDeleted };
}
