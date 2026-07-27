import { connectDB } from "../connection";
import Appointment, { type AppointmentDoc } from "../models/Appointment";
import "../models/Clinic"; // registers the "Clinic" model so populate("clinicId") below can resolve it
import "../models/Payment"; // registers the "Payment" model so populate("paymentId") below can resolve it
import type { AppointmentStatus, AppointmentType, PatientSnapshot, VisitType } from "@/types/appointment";
import type { PaymentMethod } from "@/types/payment";
import { timeToMinutes } from "@/lib/slots";

const PAYMENT_POPULATE_FIELDS =
  "method status amountPkr transactionRef receiptUrl receiptUploadedAt rejectionReason verifiedAt refundedAt";

export interface CreateAppointmentInput {
  appointmentNumber: string;
  patientId?: string;
  clinicId: string;
  visitType: VisitType;
  date: string;
  time: string;
  reason?: string;
  patientSnapshot: PatientSnapshot;
  feeSnapshotPkr: number;
  appointmentType: AppointmentType;
  procedureId?: string;
  procedureNameSnapshot?: string;
  durationMinutes: number;
  totalAmount: number;
  referralDoctor?: string;
  medicalReportUrl?: string;
  paymentMethod?: PaymentMethod;
}

export async function findAppointmentByClinicDateTime(
  clinicId: string,
  date: string,
  time: string
): Promise<AppointmentDoc | null> {
  await connectDB();
  return Appointment.findOne({
    clinicId,
    date,
    time,
    status: { $nin: ["cancelled", "rejected"] },
  }).lean<AppointmentDoc>();
}

export async function findBookedTimesForClinicDate(clinicId: string, date: string): Promise<string[]> {
  await connectDB();
  const rows = await Appointment.find(
    { clinicId, date, status: { $nin: ["cancelled", "rejected"] } },
    { time: 1 }
  ).lean<{ time: string }[]>();
  return rows.map((r) => r.time);
}

export async function createAppointment(input: CreateAppointmentInput): Promise<AppointmentDoc> {
  await connectDB();
  try {
    const created = await Appointment.create({
      ...input,
      status: "pending_payment",
      statusHistory: [{ status: "pending_payment", changedAt: new Date(), changedBy: "system" }],
    });
    return created.toObject() as AppointmentDoc;
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code?: number }).code === 11000) {
      throw new Error("SLOT_ALREADY_BOOKED");
    }
    throw err;
  }
}

export async function findAppointmentById(appointmentId: string): Promise<AppointmentDoc | null> {
  await connectDB();
  return Appointment.findById(appointmentId)
    .populate("clinicId", "name address feePkr")
    .populate("paymentId", PAYMENT_POPULATE_FIELDS)
    .lean<AppointmentDoc>();
}

export async function findAppointmentsByPatientId(patientId: string): Promise<AppointmentDoc[]> {
  await connectDB();
  return Appointment.find({ patientId })
    .populate("clinicId", "name")
    .populate("paymentId", PAYMENT_POPULATE_FIELDS)
    .sort({ createdAt: -1 })
    .lean<AppointmentDoc[]>();
}

export async function findAllAppointments(filter?: {
  status?: AppointmentStatus;
}): Promise<AppointmentDoc[]> {
  await connectDB();
  return Appointment.find(filter?.status ? { status: filter.status } : {})
    .populate("clinicId", "name")
    .populate("paymentId", PAYMENT_POPULATE_FIELDS)
    .sort({ createdAt: -1 })
    .lean<AppointmentDoc[]>();
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  changedBy: string,
  note?: string
): Promise<AppointmentDoc | null> {
  await connectDB();
  return Appointment.findByIdAndUpdate(
    appointmentId,
    {
      $set: { status },
      $push: { statusHistory: { status, changedAt: new Date(), changedBy, note } },
    },
    { new: true }
  ).lean<AppointmentDoc>();
}

export async function linkAppointmentPayment(
  appointmentId: string,
  paymentId: string
): Promise<void> {
  await connectDB();
  await Appointment.updateOne({ _id: appointmentId }, { $set: { paymentId } });
}

export async function setAppointmentMeetingLink(appointmentId: string, meetingLink: string): Promise<void> {
  await connectDB();
  await Appointment.updateOne({ _id: appointmentId }, { $set: { meetingLink } });
}

export async function findAppointmentsByDate(date: string): Promise<AppointmentDoc[]> {
  await connectDB();
  const rows = await Appointment.find({ date, status: { $nin: ["cancelled", "rejected"] } })
    .populate("clinicId", "name")
    .lean<AppointmentDoc[]>();
  // "HH:MM AM/PM" doesn't sort correctly as a string (e.g. "02:00 PM" < "09:00 AM"
  // lexicographically), so sort chronologically in application code instead.
  return rows.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

export async function countAppointmentsForDate(date: string): Promise<number> {
  await connectDB();
  return Appointment.countDocuments({ date, status: { $nin: ["cancelled", "rejected"] } });
}

export interface AppointmentStatsRow {
  patientId?: string;
  status: AppointmentStatus;
  date: string;
  reason?: string;
  patientSnapshot: { age?: number; gender?: string };
}

/** Lean per-patient appointment history used to compute Patient Directory stats. */
export async function findAppointmentStatsForPatients(): Promise<AppointmentStatsRow[]> {
  await connectDB();
  return Appointment.find(
    { patientId: { $ne: null } },
    { patientId: 1, status: 1, date: 1, reason: 1, "patientSnapshot.age": 1, "patientSnapshot.gender": 1 }
  ).lean<AppointmentStatsRow[]>();
}
