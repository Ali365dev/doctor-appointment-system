"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type { AppointmentStatus, AppointmentType, VisitType } from "@/types/appointment";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";
import { PAYMENT_METHOD_LABEL } from "@/lib/appointmentDisplay";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import { createLetterheadPdf } from "@/lib/pdf/letterhead";

const PAGE_SIZE = 25;

type PatientDirectoryStatus = "New" | "Active" | "Follow-up";

interface PatientAppointmentRow {
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

interface PatientDetail {
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

interface ReportSummary {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  patientId: string;
  files: { id: string; name: string; url: string }[];
}

const STATUS_COLORS: Record<PatientDirectoryStatus, string> = {
  Active: "bg-green-100 text-green-700",
  "Follow-up": "bg-primary/10 text-primary",
  New: "bg-surface-container-highest text-on-surface-variant",
};

const APPT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending_payment: "Pending Payment",
  payment_submitted: "Payment Submitted",
  payment_verification: "Payment Verification",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
  rescheduled: "Rescheduled",
  no_show: "No Show",
};

const APPT_STATUS_BADGE: Record<AppointmentStatus, string> = {
  pending_payment: "bg-amber-100 text-amber-700",
  payment_submitted: "bg-amber-100 text-amber-700",
  payment_verification: "bg-amber-100 text-amber-700",
  confirmed: "bg-primary/10 text-primary",
  completed: "bg-surface-container text-on-surface-variant",
  cancelled: "bg-error/10 text-error",
  rejected: "bg-error/10 text-error",
  rescheduled: "bg-secondary/10 text-secondary",
  no_show: "bg-gray-100 text-gray-700",
};

const PAYMENT_STATUS_BADGE: Record<PaymentStatus, string> = {
  pending: "bg-surface-container-high text-on-surface-variant",
  submitted: "bg-amber-50 text-amber-700 border border-amber-100",
  verified: "bg-green-50 text-green-700 border border-green-100",
  rejected: "bg-error/10 text-error",
  failed: "bg-error/10 text-error",
  refunded: "bg-purple-50 text-purple-700 border border-purple-100",
};

const VISIT_ICON: Record<string, string> = {
  procedure: "biotech",
  follow_up: "history_edu",
  consultation: "stethoscope",
};

const APPOINTMENT_TYPE_LABEL: Record<AppointmentType, string> = {
  consultation: "Consultation",
  procedure: "Procedure",
  follow_up: "Follow Up",
};

function visitTypeLabel(a: PatientAppointmentRow): string {
  if (a.procedureName) return a.procedureName;
  if (a.visitType === "online") return "Online Consultation";
  return APPOINTMENT_TYPE_LABEL[a.appointmentType];
}

function initialsOf(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function waLink(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

/* ---------- small reusable pieces ---------- */

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`p-md rounded-xl border shadow-sm flex flex-col justify-center ${
        highlight ? "bg-primary text-on-primary border-primary" : "bg-surface-container-lowest border-outline-variant"
      }`}
    >
      <p className={`text-caption uppercase font-bold tracking-wider ${highlight ? "text-on-primary/70" : "text-on-surface-variant"}`}>{label}</p>
      <p className="text-headline-md font-bold mt-1">{value}</p>
    </div>
  );
}

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      <div className="px-md py-sm border-b border-outline-variant flex items-center justify-between">
        <h3 className="font-bold text-on-surface">{title}</h3>
        {action}
      </div>
      <div className="p-md">{children}</div>
    </section>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-lg text-center text-on-surface-variant">
      <span className="material-symbols-outlined text-[32px] mb-xs text-outline">{icon}</span>
      <p className="text-body-md">{text}</p>
    </div>
  );
}

function Field({ label, value, full }: { label: string; value?: string; full?: boolean }) {
  if (!value?.trim()) return null;
  return (
    <div className={full ? "col-span-2" : undefined}>
      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">{label}</p>
      <p className="text-body-md font-medium text-on-surface">{value}</p>
    </div>
  );
}

/* ---------- main ---------- */

export default function PatientDetailContent({ patientId }: { patientId: string }) {
  const doctor = useDoctorProfile();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [page, setPage] = useState(1);

  // mailto: links silently no-op on machines with no default mail client
  // configured (common on Windows). Copy the address as a fallback so the
  // click is always useful, without blocking the mailto navigation itself.
  function handleEmailClick(email: string) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(email)
        .then(() => toast.info(`Email copied: ${email}`))
        .catch(() => {});
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`);
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 404) setNotFound(true);
        else toast.error(data.error ?? "Could not load patient");
        return;
      }
      setPatient(data.patient);

      const repRes = await fetch("/api/medical-records");
      const repData = await repRes.json();
      if (repRes.ok) {
        setReports((repData.reports ?? []).filter((r: ReportSummary) => r.patientId === patientId));
      }
    } catch {
      toast.error("Network error loading patient");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  async function exportPDF() {
    if (!patient) return;
    const { doc, headerHeight, renderTable, drawFooter } = await createLetterheadPdf(doctor, {
      title: `Appointment History — ${patient.name}`,
    });
    renderTable({
      startY: headerHeight + 6,
      headers: ["Date", "Time", "Appt #", "Visit Type", "Location", "Fee", "Payment", "Status"],
      rows: patient.appointments.map((a) => [
        a.date,
        a.time,
        a.appointmentNumber,
        visitTypeLabel(a),
        a.clinicName,
        `Rs. ${a.feeSnapshotPkr.toLocaleString()}`,
        a.payment?.status ?? "—",
        APPT_STATUS_LABEL[a.status],
      ]),
      badgeColumns: ["Payment", "Status"],
    });
    drawFooter();
    doc.save(`${patient.name.replace(/\s+/g, "_")}_appointments.pdf`);
  }

  if (loading) {
    return (
      <div className="px-gutter py-lg max-w-7xl mx-auto text-body-md text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin align-middle mr-xs">progress_activity</span>
        Loading patient…
      </div>
    );
  }

  if (notFound || !patient) {
    return (
      <div className="px-gutter py-lg max-w-7xl mx-auto">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center">
          <span className="material-symbols-outlined text-error text-[40px] mb-sm">person_off</span>
          <p className="text-headline-md font-bold text-on-surface mb-xs">Patient not found</p>
          <p className="text-body-md text-on-surface-variant mb-md">This patient record doesn&apos;t exist or was removed.</p>
          <button onClick={() => router.push("/admin/patients")} className="text-primary font-semibold hover:underline">
            ← Back to Patients Directory
          </button>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(patient.appointments.length / PAGE_SIZE));
  const pageItems = patient.appointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const procedures = patient.appointments.filter((a) => a.appointmentType === "procedure");
  const paymentHistory = patient.appointments.filter((a) => a.payment);
  const notes = patient.appointments.filter((a) => a.reason || a.condition || a.notes);

  return (
    <div className="px-gutter py-lg max-w-7xl mx-auto space-y-md">
      {/* Breadcrumb */}
      <div className="flex items-center gap-xs text-body-md text-on-surface-variant">
        <Link href="/admin/patients" className="hover:text-primary transition-colors">
          Patients
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-semibold">{patient.name}</span>
      </div>

      {/* Profile Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-md flex flex-col lg:flex-row justify-between gap-md">
        <div className="flex items-center gap-md">
          {patient.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={patient.avatar} alt={patient.name} className="w-20 h-20 rounded-full object-cover border-4 border-surface-container shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center font-bold text-headline-lg shrink-0">
              {initialsOf(patient.name)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-sm flex-wrap">
              <h2 className="text-headline-lg font-bold text-on-surface">{patient.name}</h2>
              <span className={`px-sm py-0.5 rounded-full text-caption font-bold ${STATUS_COLORS[patient.status]}`}>
                {patient.status.toUpperCase()}
              </span>
            </div>
            <p className="text-body-md text-on-surface-variant mt-1">
              Patient ID: <span className="font-mono text-primary font-semibold">#{patient.id.slice(-8).toUpperCase()}</span>
            </p>
            <div className="flex gap-md mt-2 flex-wrap">
              {patient.age && (
                <span className="flex items-center gap-1 text-caption text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">cake</span> {patient.age} Years Old
                </span>
              )}
              {(patient.city || patient.country) && (
                <span className="flex items-center gap-1 text-caption text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {[patient.city, patient.country].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-xs items-start">
          {patient.email && (
            <a
              href={`mailto:${patient.email}`}
              onClick={() => handleEmailClick(patient.email!)}
              className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
              title="Send Message (Email)"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
            </a>
          )}
          {patient.phone && patient.phone !== "—" && (
            <>
              <a
                href={`tel:${patient.phone}`}
                className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
                title="Call Patient"
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
              </a>
              <a
                href={waLink(patient.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
                title="WhatsApp"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </a>
            </>
          )}
          <button
            onClick={() => window.print()}
            className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
            title="Print File"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
          </button>
        </div>
      </div>

      {/* Personal Details + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <SectionCard title="Personal Details">
          <div className="grid grid-cols-2 gap-md">
            <Field label="Gender" value={patient.gender} />
            <Field label="Blood Type" value={patient.bloodType} />
            <Field label="Phone" value={patient.phone !== "—" ? patient.phone : undefined} />
            <Field label="Email" value={patient.email} />
            <Field full label="Address" value={[patient.address, patient.city, patient.country].filter(Boolean).join(", ")} />
            <Field full label="Allergies" value={patient.allergies} />
            <Field full label="Current Medications" value={patient.medications} />
            <Field
              full
              label="Emergency Contact"
              value={
                patient.emergencyContactName || patient.emergencyContactPhone
                  ? [patient.emergencyContactName, patient.emergencyContactPhone].filter(Boolean).join(" · ")
                  : undefined
              }
            />
          </div>
        </SectionCard>

        <div className="grid grid-cols-2 gap-md">
          <StatCard label="Total Appointments" value={patient.stats.total} />
          <StatCard label="Upcoming" value={patient.stats.upcoming} highlight />
          <StatCard label="Completed" value={patient.stats.completed} />
          <StatCard label="Cancelled" value={patient.stats.cancelled} />
        </div>
      </div>

      {/* Appointment History */}
      <SectionCard
        title="Appointment History"
        action={
          <button
            onClick={exportPDF}
            disabled={patient.appointments.length === 0}
            className="px-md py-xs bg-surface-container text-on-surface rounded-lg text-caption font-bold hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            Export PDF
          </button>
        }
      >
        {patient.appointments.length === 0 ? (
          <EmptyState icon="event_busy" text="No appointments recorded for this patient yet." />
        ) : (
          <>
            <div className="overflow-x-auto overflow-y-auto max-h-150 -mx-md">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-1">
                  <tr className="bg-surface-container-low">
                    {["Date & Time", "Visit Type", "Location", "Fee", "Payment Status", "Appt. Status", "Actions"].map((h, i, arr) => (
                      <th
                        key={h}
                        className={`px-md py-sm text-[10px] uppercase font-bold text-on-surface-variant whitespace-nowrap ${i === arr.length - 1 ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {pageItems.map((a) => (
                    <tr key={a.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-md py-sm whitespace-nowrap">
                        <p className="text-body-md font-bold">{a.date}</p>
                        <p className="text-caption text-on-surface-variant">{a.time}</p>
                        <p className="text-caption text-outline">{a.appointmentNumber}</p>
                      </td>
                      <td className="px-md py-sm whitespace-nowrap">
                        <div className="flex items-center gap-xs">
                          <div className="w-8 h-8 rounded bg-primary/5 text-primary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[16px]">
                              {VISIT_ICON[a.appointmentType] ?? "clinical_notes"}
                            </span>
                          </div>
                          <p className="text-body-md font-medium">{visitTypeLabel(a)}</p>
                        </div>
                      </td>
                      <td className="px-md py-sm text-body-md whitespace-nowrap">{a.clinicName}</td>
                      <td className="px-md py-sm text-body-md font-medium whitespace-nowrap">Rs. {a.feeSnapshotPkr.toLocaleString()}</td>
                      <td className="px-md py-sm whitespace-nowrap">
                        {a.payment ? (
                          <span className={`inline-flex items-center gap-1 px-sm py-0.5 rounded-full text-[10px] font-bold ${PAYMENT_STATUS_BADGE[a.payment.status]}`}>
                            {a.payment.status.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-caption text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="px-md py-sm whitespace-nowrap">
                        <span className={`px-sm py-0.5 rounded text-[10px] font-bold ${APPT_STATUS_BADGE[a.status]}`}>
                          {APPT_STATUS_LABEL[a.status].toUpperCase()}
                        </span>
                      </td>
                      <td className="px-md py-sm text-right">
                        <Link
                          href={`/admin/appointments/verify/${a.id}`}
                          className="text-primary text-caption font-bold opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1"
                        >
                          View Details <span className="material-symbols-outlined text-[14px]">visibility</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-md mt-md border-t border-outline-variant/30">
              <p className="text-caption text-on-surface-variant">
                Showing {(page - 1) * PAGE_SIZE + 1} to {(page - 1) * PAGE_SIZE + pageItems.length} of {patient.appointments.length} appointments
              </p>
              <div className="flex gap-xs">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-caption font-bold transition-colors ${
                      page === n ? "bg-primary text-on-primary" : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </SectionCard>

      {/* Procedures + Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <SectionCard title="Procedures">
          {procedures.length === 0 ? (
            <EmptyState icon="biotech" text="No procedures on record." />
          ) : (
            <ul className="space-y-sm max-h-80 overflow-y-auto pr-xs">
              {procedures.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-sm p-sm rounded-lg bg-surface-container-low">
                  <div>
                    <p className="text-body-md font-semibold text-on-surface">{p.procedureName}</p>
                    <p className="text-caption text-on-surface-variant">{p.date} · {p.clinicName}</p>
                  </div>
                  <span className={`px-sm py-0.5 rounded text-[10px] font-bold shrink-0 ${APPT_STATUS_BADGE[p.status]}`}>
                    {APPT_STATUS_LABEL[p.status].toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Uploaded Reports">
          {reports.length === 0 ? (
            <EmptyState icon="description" text="No reports uploaded by this patient." />
          ) : (
            <ul className="space-y-sm max-h-80 overflow-y-auto pr-xs">
              {reports.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/admin/medical-records?id=${r.id}`}
                    className="flex items-center justify-between gap-sm p-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-body-md font-semibold text-on-surface truncate">{r.title}</p>
                      <p className="text-caption text-on-surface-variant">
                        {r.category} · {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-primary shrink-0">chevron_right</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Payment History + Doctor Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <SectionCard title="Payment History">
          {paymentHistory.length === 0 ? (
            <EmptyState icon="payments" text="No payments recorded." />
          ) : (
            <ul className="space-y-sm max-h-80 overflow-y-auto pr-xs">
              {paymentHistory.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-sm p-sm rounded-lg bg-surface-container-low">
                  <div>
                    <p className="text-body-md font-semibold text-on-surface">Rs. {a.payment!.amountPkr.toLocaleString()}</p>
                    <p className="text-caption text-on-surface-variant">
                      {PAYMENT_METHOD_LABEL[a.payment!.method]} · {a.date}
                    </p>
                  </div>
                  <span className={`px-sm py-0.5 rounded-full text-[10px] font-bold shrink-0 ${PAYMENT_STATUS_BADGE[a.payment!.status]}`}>
                    {a.payment!.status.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Doctor Notes">
          {notes.length === 0 ? (
            <EmptyState icon="clinical_notes" text="No notes recorded for this patient." />
          ) : (
            <ul className="space-y-sm max-h-80 overflow-y-auto pr-xs">
              {notes.map((a) => (
                <li key={a.id} className="p-sm rounded-lg bg-surface-container-low">
                  <p className="text-caption text-on-surface-variant mb-1">{a.date}</p>
                  {a.reason && <p className="text-body-md text-on-surface">{a.reason}</p>}
                  {a.condition && <p className="text-caption text-on-surface-variant mt-1">Condition: {a.condition}</p>}
                  {a.notes && <p className="text-caption text-on-surface-variant mt-1">{a.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
