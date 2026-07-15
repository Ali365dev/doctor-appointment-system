import "server-only";
import { connectDB } from "@/services/mongodb";
import { findAllPatientUsers, findUserById } from "@/services/mongodb/repositories/user.repository";
import {
  findAppointmentStatsForPatients,
  findAppointmentsByPatientId,
} from "@/services/mongodb/repositories/appointment.repository";
import type { AppointmentStatus, VisitType, AppointmentType } from "@/types/appointment";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";

export type PatientDirectoryStatus = "New" | "Active" | "Follow-up";

export interface PatientDirectoryRow {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  lastVisit: string;
  totalVisits: number;
  status: PatientDirectoryStatus;
  lastReason: string;
  createdAt: string;
}

function calculateAge(dob?: Date | null): number | undefined {
  if (!dob) return undefined;
  const diffMs = Date.now() - new Date(dob).getTime();
  return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
}

export class PatientServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export interface PatientAppointmentRow {
  id: string;
  appointmentNumber: string;
  date: string;
  time: string;
  visitType: VisitType;
  appointmentType: AppointmentType;
  procedureName?: string;
  clinicName: string;
  feeSnapshotPkr: number;
  status: AppointmentStatus;
  reason?: string;
  condition?: string;
  notes?: string;
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    amountPkr: number;
    transactionRef?: string;
    receiptUrl?: string;
  } | null;
}

export interface PatientDetail {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  bloodType?: string;
  address?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medications?: string;
  isActive: boolean;
  status: PatientDirectoryStatus;
  createdAt: string;
  stats: { total: number; upcoming: number; completed: number; cancelled: number };
  appointments: PatientAppointmentRow[];
}

/**
 * Single-patient detail record for the admin Patient Details page — joins the
 * patient's User profile (already has bloodType/allergies/medications/emergency
 * contact fields, just never surfaced outside their own Profile page) with
 * their full appointment + payment history. No new data is fabricated: fields
 * genuinely absent from the schema (e.g. insurance) are simply omitted by the
 * caller's UI, not invented here.
 */
export async function getPatientDetail(id: string): Promise<PatientDetail> {
  await connectDB();

  const user = await findUserById(id);
  if (!user || user.role !== "patient") {
    throw new PatientServiceError("Patient not found", 404);
  }

  const appointments = await findAppointmentsByPatientId(id);
  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...appointments].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));

  const completed = sorted.filter((a) => a.status === "completed");
  const cancelled = sorted.filter((a) => a.status === "cancelled" || a.status === "rejected");
  const upcoming = sorted.filter((a) => a.status === "confirmed" && a.date >= today);
  const hasUpcoming = upcoming.length > 0;

  const status: PatientDirectoryStatus =
    sorted.length === 0 ? "New" : hasUpcoming ? "Follow-up" : completed.length > 0 ? "Active" : "New";

  const rows: PatientAppointmentRow[] = sorted.map((a) => {
    const clinic = a.clinicId as unknown as { name?: string } | string | null;
    const payment = a.paymentId as unknown as {
      method: PaymentMethod;
      status: PaymentStatus;
      amountPkr: number;
      transactionRef?: string;
      receiptUrl?: string;
    } | string | null;
    return {
      id: String(a._id),
      appointmentNumber: a.appointmentNumber,
      date: a.date,
      time: a.time,
      visitType: a.visitType as VisitType,
      appointmentType: (a.appointmentType ?? "consultation") as AppointmentType,
      procedureName: a.procedureNameSnapshot ?? undefined,
      clinicName: typeof clinic === "string" ? clinic : clinic?.name ?? "—",
      feeSnapshotPkr: a.feeSnapshotPkr,
      status: a.status as AppointmentStatus,
      reason: a.reason || undefined,
      condition: a.patientSnapshot?.condition || undefined,
      notes: a.patientSnapshot?.notes || undefined,
      payment:
        payment && typeof payment === "object"
          ? {
              method: payment.method,
              status: payment.status,
              amountPkr: payment.amountPkr,
              transactionRef: payment.transactionRef,
              receiptUrl: payment.receiptUrl,
            }
          : null,
    };
  });

  return {
    id: String(user._id),
    name: user.name,
    avatar: user.avatar ?? undefined,
    phone: user.phone ?? "—",
    email: user.email ?? undefined,
    age: calculateAge(user.dob) ?? sorted[0]?.patientSnapshot?.age,
    gender: user.gender ?? sorted[0]?.patientSnapshot?.gender,
    bloodType: user.bloodType ?? undefined,
    address: user.address ?? undefined,
    city: user.city ?? sorted[0]?.patientSnapshot?.city,
    country: user.country ?? undefined,
    emergencyContactName: user.emergencyContactName ?? undefined,
    emergencyContactPhone: user.emergencyContactPhone ?? undefined,
    allergies: user.allergies ?? undefined,
    medications: user.medications ?? undefined,
    isActive: user.isActive,
    status,
    createdAt: new Date(user.createdAt).toISOString(),
    stats: { total: sorted.length, upcoming: upcoming.length, completed: completed.length, cancelled: cancelled.length },
    appointments: rows,
  };
}

/**
 * Real Patient Directory data: registered patient accounts joined with their
 * appointment history. Deliberately does NOT include a clinical "condition"
 * or "severity" field — there's no medical-records data source backing that,
 * and fabricating one would be misleading in a medical application.
 */
export async function getPatientsWithStats(): Promise<PatientDirectoryRow[]> {
  await connectDB();

  const [patients, appointments] = await Promise.all([
    findAllPatientUsers(),
    findAppointmentStatsForPatients(),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const byPatient = new Map<string, typeof appointments>();
  for (const apt of appointments) {
    if (!apt.patientId) continue;
    const key = String(apt.patientId);
    const list = byPatient.get(key) ?? [];
    list.push(apt);
    byPatient.set(key, list);
  }

  return patients.map((user) => {
    const userAppointments = (byPatient.get(String(user._id)) ?? []).sort((a, b) => (a.date > b.date ? -1 : 1));
    const completed = userAppointments.filter((a) => a.status === "completed");
    const hasUpcoming = userAppointments.some((a) => a.status === "confirmed" && a.date >= today);
    const mostRecent = userAppointments[0];

    const status: PatientDirectoryStatus =
      userAppointments.length === 0 ? "New" : hasUpcoming ? "Follow-up" : completed.length > 0 ? "Active" : "New";

    return {
      id: String(user._id),
      name: user.name,
      avatar: user.avatar ?? undefined,
      phone: user.phone ?? "—",
      email: user.email ?? undefined,
      age: calculateAge(user.dob) ?? mostRecent?.patientSnapshot?.age,
      gender: user.gender ?? mostRecent?.patientSnapshot?.gender,
      lastVisit: completed[0]?.date ?? "—",
      totalVisits: userAppointments.length,
      status,
      lastReason: mostRecent?.reason || "—",
      createdAt: new Date(user.createdAt).toISOString(),
    };
  });
}
