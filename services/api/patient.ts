import "server-only";
import { connectDB } from "@/services/mongodb";
import { findAllPatientUsers } from "@/services/mongodb/repositories/user.repository";
import { findAppointmentStatsForPatients } from "@/services/mongodb/repositories/appointment.repository";

export type PatientDirectoryStatus = "New" | "Active" | "Follow-up";

export interface PatientDirectoryRow {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  lastVisit: string;
  totalVisits: number;
  status: PatientDirectoryStatus;
  lastReason: string;
}

function calculateAge(dob?: Date | null): number | undefined {
  if (!dob) return undefined;
  const diffMs = Date.now() - new Date(dob).getTime();
  return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
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
      phone: user.phone ?? "—",
      email: user.email ?? undefined,
      age: calculateAge(user.dob) ?? mostRecent?.patientSnapshot?.age,
      gender: user.gender ?? mostRecent?.patientSnapshot?.gender,
      lastVisit: completed[0]?.date ?? "—",
      totalVisits: completed.length,
      status,
      lastReason: mostRecent?.reason || "—",
    };
  });
}
