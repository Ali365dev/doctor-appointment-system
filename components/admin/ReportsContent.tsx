"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { AppointmentStatus, AppointmentType, VisitType } from "@/types/appointment";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import { PAYMENT_METHOD_LABEL } from "@/lib/appointmentDisplay";

/* ============================================================
   Types
   ============================================================ */

interface ApiPayment {
  _id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amountPkr: number;
}

interface ApiAppointment {
  _id: string;
  appointmentNumber: string;
  clinicId: { _id: string; name: string } | string;
  visitType: VisitType;
  date: string;
  time: string;
  patientId?: string;
  patientSnapshot: { fullName: string; phone?: string; age?: number; gender?: string };
  feeSnapshotPkr: number;
  paymentId?: ApiPayment | string;
  status: AppointmentStatus;
  appointmentType: AppointmentType;
  procedureNameSnapshot?: string;
  createdAt: string;
}

interface ApiClinic {
  _id: string;
  name: string;
  city: string;
}

type PatientGroup = "Active" | "Follow-up" | "New";

interface ApiPatient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  age?: number;
  gender?: string;
  totalVisits?: number;
  status: PatientGroup;
  createdAt: string;
}

/* ============================================================
   Constants
   ============================================================ */

const APPOINTMENT_TYPE_LABEL: Record<AppointmentType, string> = {
  consultation: "Consultation",
  procedure: "Procedure",
  follow_up: "Follow Up",
};

const PENDING_STATUSES: AppointmentStatus[] = ["pending_payment", "payment_submitted", "payment_verification"];
const CANCELLED_STATUSES: AppointmentStatus[] = ["cancelled", "rejected", "no_show"];
const APPOINTMENT_TYPES_LIST: AppointmentType[] = ["consultation", "procedure", "follow_up"];
const ONLINE_PAYMENT_METHODS: PaymentMethod[] = ["bank", "jazzcash", "easypaisa"];

/** Paid = payment verified. Pending = still owed on any non-cancelled appointment. */
function paidAmount(a: ApiAppointment): number {
  const p = getPayment(a);
  return p?.status === "verified" ? p.amountPkr : 0;
}
function pendingAmount(a: ApiAppointment): number {
  if (CANCELLED_STATUSES.includes(a.status)) return 0;
  return a.feeSnapshotPkr - paidAmount(a);
}

type ReportKey = "overall" | "procedure" | "location" | "group" | "clinicSummary" | "patient" | "payment";

/** Data-driven tab list — add a new entry + a computeXxx() branch below to add a report type. */
const REPORT_TABS: { key: ReportKey; label: string; icon: string }[] = [
  { key: "overall", label: "Overall Report", icon: "dashboard" },
  { key: "procedure", label: "Procedure / Service", icon: "medical_services" },
  { key: "location", label: "Location-wise", icon: "location_on" },
  { key: "group", label: "Group Report", icon: "category" },
  { key: "clinicSummary", label: "Clinic Summary", icon: "storefront" },
  { key: "patient", label: "Patient Report", icon: "person_search" },
  { key: "payment", label: "Payment Report", icon: "payments" },
];

const STATUS_LABEL: Record<AppointmentStatus, string> = {
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

/* ============================================================
   Helpers
   ============================================================ */

function getPayment(a: ApiAppointment): ApiPayment | null {
  return a.paymentId && typeof a.paymentId === "object" ? a.paymentId : null;
}
function clinicOf(a: ApiAppointment): { id: string; name: string } | null {
  if (!a.clinicId) return null;
  return typeof a.clinicId === "string" ? { id: a.clinicId, name: a.clinicId } : { id: a.clinicId._id, name: a.clinicId.name };
}
function serviceLabel(a: ApiAppointment): string {
  return a.procedureNameSnapshot ?? APPOINTMENT_TYPE_LABEL[a.appointmentType ?? "consultation"];
}
function isoDay(dateLike: string): string {
  return dateLike.slice(0, 10);
}
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Sums every column where all rows hold a number, labeling the row "Total" in
 * the first column. Returns null when there's nothing numeric to total (e.g.
 * the Overall Report's Metric/Value table, whose Value column mixes numbers
 * and pre-formatted strings) or when there are no rows.
 */
function computeTotalsRow(headers: string[], rows: (string | number)[][]): (string | number)[] | null {
  if (rows.length === 0) return null;
  const numericCols = headers
    .map((_, i) => i)
    .filter((i) => i > 0 && rows.every((r) => typeof r[i] === "number"));
  if (numericCols.length === 0) return null;
  const totals: (string | number)[] = headers.map(() => "");
  totals[0] = "Total";
  for (const i of numericCols) {
    totals[i] = rows.reduce((sum, r) => sum + (r[i] as number), 0);
  }
  return totals;
}

interface ReportTable {
  headers: string[];
  rows: (string | number)[][];
}
interface ChartPoint {
  label: string;
  value: number;
}
interface SummaryCard {
  label: string;
  value: string | number;
}
interface ComputedReport {
  table: ReportTable;
  chart: ChartPoint[];
  summary?: SummaryCard[];
  extraTables?: { title: string; table: ReportTable }[];
}

/* ============================================================
   Component
   ============================================================ */

export default function ReportsContent() {
  const doctor = useDoctorProfile();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [clinics, setClinics] = useState<ApiClinic[]>([]);
  const [patients, setPatients] = useState<ApiPatient[]>([]);
  const [loading, setLoading] = useState(true);

  const todayIso = new Date().toISOString().slice(0, 10);
  const monthAgoIso = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState(monthAgoIso);
  const [dateTo, setDateTo] = useState(todayIso);
  const [clinicFilter, setClinicFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [procedureFilter, setProcedureFilter] = useState("All");
  const [patientFilter, setPatientFilter] = useState("All");
  const [patientQuery, setPatientQuery] = useState("");
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportKey>("overall");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [aRes, cRes, pRes] = await Promise.all([
          fetch("/api/appointments"),
          fetch("/api/clinics"),
          fetch("/api/patients"),
        ]);
        const [aData, cData, pData] = await Promise.all([aRes.json(), cRes.json(), pRes.json()]);
        if (aRes.ok) setAppointments(aData.appointments ?? []);
        if (cRes.ok) setClinics(cData.clinics ?? []);
        if (pRes.ok) setPatients(pData.patients ?? []);
        if (!aRes.ok || !cRes.ok || !pRes.ok) toast.error("Could not load some report data");
      } catch {
        toast.error("Network error loading reports");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Reset sort/search whenever the active report or any filter changes.
  useEffect(() => {
    setSortKey(null);
    setSearch("");
  }, [activeReport, dateFrom, dateTo, clinicFilter, locationFilter, procedureFilter, patientFilter]);

  const clinicMap = useMemo(() => new Map(clinics.map((c) => [c._id, c])), [clinics]);
  const patientMap = useMemo(() => new Map(patients.map((p) => [p.id, p])), [patients]);
  const patientOptions = useMemo(() => {
    const sorted = [...patients].sort((a, b) => a.name.localeCompare(b.name));
    const q = patientQuery.trim().toLowerCase();
    return q ? sorted.filter((p) => p.name.toLowerCase().includes(q)) : sorted;
  }, [patients, patientQuery]);
  const locations = useMemo(() => [...new Set(clinics.map((c) => c.city))].sort(), [clinics]);
  const procedures = useMemo(() => [...new Set(appointments.map(serviceLabel))].sort(), [appointments]);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((a) => {
        if (dateFrom && a.date < dateFrom) return false;
        if (dateTo && a.date > dateTo) return false;
        const clinic = clinicOf(a);
        if (clinicFilter !== "All" && clinic?.id !== clinicFilter) return false;
        if (locationFilter !== "All" && clinicMap.get(clinic?.id ?? "")?.city !== locationFilter) return false;
        if (procedureFilter !== "All" && serviceLabel(a) !== procedureFilter) return false;
        if (patientFilter !== "All" && a.patientId !== patientFilter) return false;
        return true;
      }),
    [appointments, dateFrom, dateTo, clinicFilter, locationFilter, procedureFilter, patientFilter, clinicMap]
  );

  const filteredPatients = useMemo(
    () =>
      patients.filter((p) => {
        const day = isoDay(p.createdAt);
        if (dateFrom && day < dateFrom) return false;
        if (dateTo && day > dateTo) return false;
        if (patientFilter !== "All" && p.id !== patientFilter) return false;
        return true;
      }),
    [patients, dateFrom, dateTo, patientFilter]
  );

  // Earliest-ever appointment date per patient, from the FULL unfiltered set —
  // needed to classify a filtered appointment as belonging to a "new" vs
  // "returning" patient regardless of the active date range.
  const firstApptDateByPatient = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of appointments) {
      if (!a.patientId) continue;
      const existing = map.get(a.patientId);
      if (!existing || a.date < existing) map.set(a.patientId, a.date);
    }
    return map;
  }, [appointments]);

  /* ---------- Report computations ---------- */

  const BREAKDOWN_HEADERS_APPTS = ["Appointments", "Paid Amount (Rs.)", "Pending Amount (Rs.)", "Total Amount (Rs.)"];

  /** [count, paid, pending, total] rows for any grouping of appointments — shared by every breakdown table below. */
  function breakdownRows(apts: ApiAppointment[], keyFn: (a: ApiAppointment) => string): (string | number)[][] {
    const map = new Map<string, ApiAppointment[]>();
    for (const a of apts) {
      const k = keyFn(a);
      const list = map.get(k) ?? [];
      list.push(a);
      map.set(k, list);
    }
    return [...map.entries()].map(([label, group]) => [
      label,
      group.length,
      group.reduce((s, a) => s + paidAmount(a), 0),
      group.reduce((s, a) => s + pendingAmount(a), 0),
      group.reduce((s, a) => s + (paidAmount(a) + pendingAmount(a)), 0),
    ]);
  }

  /** Payment Status Summary (Transactions + Amount) and Appointment Status Summary (Count) — shared by Overall and Patient reports. */
  function paymentStatusSummaryTable(apts: ApiAppointment[]): ReportTable {
    const map = new Map<string, { count: number; amount: number }>();
    for (const a of apts) {
      const p = getPayment(a);
      if (!p) continue;
      const entry = map.get(p.status) ?? { count: 0, amount: 0 };
      entry.count += 1;
      entry.amount += p.amountPkr;
      map.set(p.status, entry);
    }
    return {
      headers: ["Payment Status", "Transactions", "Amount (Rs.)"],
      rows: [...map.entries()].map(([status, v]) => [capitalize(status), v.count, v.amount]),
    };
  }

  function appointmentStatusSummaryTable(apts: ApiAppointment[]): ReportTable {
    const map = new Map<string, number>();
    for (const a of apts) map.set(STATUS_LABEL[a.status], (map.get(STATUS_LABEL[a.status]) ?? 0) + 1);
    return {
      headers: ["Appointment Status", "Count"],
      rows: [...map.entries()].map(([label, count]) => [label, count]),
    };
  }

  const overall: ComputedReport = useMemo(() => {
    const patientIds = new Set(filteredAppointments.map((a) => a.patientId).filter(Boolean) as string[]);
    const completed = filteredAppointments.filter((a) => a.status === "completed").length;
    const confirmed = filteredAppointments.filter((a) => a.status === "confirmed").length;
    const pending = filteredAppointments.filter((a) => PENDING_STATUSES.includes(a.status)).length;
    const cancelled = filteredAppointments.filter((a) => CANCELLED_STATUSES.includes(a.status)).length;
    const revenue = filteredAppointments.reduce((sum, a) => {
      const p = getPayment(a);
      return p?.status === "verified" ? sum + p.amountPkr : sum;
    }, 0);

    const paymentStatuses: PaymentStatus[] = ["pending", "submitted", "verified", "rejected", "failed", "refunded"];
    const paymentSummary = paymentStatuses
      .map((status) => {
        const matches = filteredAppointments.map(getPayment).filter((p): p is ApiPayment => !!p && p.status === status);
        return { status, count: matches.length, amount: matches.reduce((s, p) => s + p.amountPkr, 0) };
      })
      .filter((g) => g.count > 0);

    const table: ReportTable = {
      headers: ["Metric", "Value"],
      rows: [
        ["Total Patients", patientIds.size],
        ["Total Appointments", filteredAppointments.length],
        ["Confirmed", confirmed],
        ["Completed", completed],
        ["Pending", pending],
        ["Cancelled", cancelled],
        ["Revenue (Rs.)", revenue.toLocaleString()],
        ...paymentSummary.map((g): [string, string] => [
          `Payments — ${g.status}`,
          `${g.count} (Rs. ${g.amount.toLocaleString()})`,
        ]),
      ],
    };

    const summary: SummaryCard[] = [
      { label: "Total Patients", value: patientIds.size },
      { label: "Total Appointments", value: filteredAppointments.length },
      { label: "Confirmed", value: confirmed },
      { label: "Completed", value: completed },
      { label: "Pending", value: pending },
      { label: "Cancelled", value: cancelled },
      { label: "Revenue (Rs.)", value: revenue.toLocaleString() },
      ...paymentSummary.map((g): SummaryCard => ({
        label: `Payments — ${g.status.charAt(0).toUpperCase()}${g.status.slice(1)}`,
        value: g.amount.toLocaleString(),
      })),
    ];

    const chart = paymentSummary.map((g) => ({ label: g.status, value: g.amount }));

    const appointmentsTable: ReportTable = {
      headers: ["Date", "Time", "Patient", "Phone", "Email", "Clinic", "Type", "Service", "Status", "Fee (Rs.)", "Payment"],
      rows: [...filteredAppointments]
        .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : b.date.localeCompare(a.date)))
        .map((a) => [
          a.date,
          a.time,
          a.patientSnapshot.fullName,
          a.patientSnapshot.phone ?? patientMap.get(a.patientId ?? "")?.phone ?? "—",
          patientMap.get(a.patientId ?? "")?.email ?? "—",
          clinicOf(a)?.name ?? "—",
          APPOINTMENT_TYPE_LABEL[a.appointmentType ?? "consultation"],
          serviceLabel(a),
          STATUS_LABEL[a.status],
          a.feeSnapshotPkr,
          getPayment(a)?.status ?? "—",
        ]),
    };

    const patientsTable: ReportTable = {
      headers: ["Name", "Phone", "Email", "Group", "Registered On"],
      rows: [...filteredPatients]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((p) => [p.name, p.phone ?? "—", p.email ?? "—", p.status, isoDay(p.createdAt)]),
    };

    const appointmentTypeTable: ReportTable = {
      headers: ["Appointment Type", ...BREAKDOWN_HEADERS_APPTS],
      rows: breakdownRows(filteredAppointments, (a) => APPOINTMENT_TYPE_LABEL[a.appointmentType ?? "consultation"]),
    };
    const paymentMethodTable: ReportTable = {
      headers: ["Payment Method", "Transactions", "Paid Amount (Rs.)", "Pending Amount (Rs.)", "Total Amount (Rs.)"],
      rows: breakdownRows(
        filteredAppointments.filter((a) => getPayment(a)),
        (a) => PAYMENT_METHOD_LABEL[getPayment(a)!.method]
      ),
    };
    const clinicBreakdownTable: ReportTable = {
      headers: ["Clinic", ...BREAKDOWN_HEADERS_APPTS],
      rows: breakdownRows(filteredAppointments, (a) => clinicOf(a)?.name ?? "—"),
    };
    const procedureBreakdownTable: ReportTable = {
      headers: ["Procedure / Service", ...BREAKDOWN_HEADERS_APPTS],
      rows: breakdownRows(filteredAppointments, serviceLabel),
    };

    const extraTables = [
      { title: "Appointment Breakdown", table: appointmentTypeTable },
      { title: "Payment Method Summary", table: paymentMethodTable },
      { title: "Clinic-wise Summary", table: clinicBreakdownTable },
      { title: "Procedure / Service Summary", table: procedureBreakdownTable },
      { title: "Payment Status Summary", table: paymentStatusSummaryTable(filteredAppointments) },
      { title: "Appointment Status Summary", table: appointmentStatusSummaryTable(filteredAppointments) },
      { title: "All Appointments", table: appointmentsTable },
      { title: "All Patients", table: patientsTable },
    ];

    return { table, chart, summary, extraTables };
  }, [filteredAppointments, filteredPatients, patientMap]);

  const procedureReport: ComputedReport = useMemo(() => {
    const map = new Map<string, { patients: Set<string>; appointments: number; revenue: number }>();
    for (const a of filteredAppointments) {
      const label = serviceLabel(a);
      const entry = map.get(label) ?? { patients: new Set<string>(), appointments: 0, revenue: 0 };
      if (a.patientId) entry.patients.add(a.patientId);
      entry.appointments += 1;
      const p = getPayment(a);
      if (p?.status === "verified") entry.revenue += p.amountPkr;
      map.set(label, entry);
    }
    const rows = [...map.entries()]
      .map(([label, v]) => ({ label, patients: v.patients.size, appointments: v.appointments, revenue: v.revenue }))
      .sort((a, b) => b.appointments - a.appointments);

    return {
      table: {
        headers: ["Service", "Patients", "Appointments", "Revenue (Rs.)"],
        rows: rows.map((r) => [r.label, r.patients, r.appointments, r.revenue]),
      },
      chart: rows.slice(0, 8).map((r) => ({ label: r.label, value: r.appointments })),
    };
  }, [filteredAppointments]);

  const locationReport: ComputedReport = useMemo(() => {
    const map = new Map<string, { clinics: Set<string>; patients: Set<string>; appointments: number; revenue: number }>();
    for (const a of filteredAppointments) {
      const c = clinicOf(a);
      if (!c) continue;
      const city = clinicMap.get(c.id)?.city ?? "Unknown";
      const entry = map.get(city) ?? { clinics: new Set<string>(), patients: new Set<string>(), appointments: 0, revenue: 0 };
      entry.clinics.add(c.id);
      if (a.patientId) entry.patients.add(a.patientId);
      entry.appointments += 1;
      const p = getPayment(a);
      if (p?.status === "verified") entry.revenue += p.amountPkr;
      map.set(city, entry);
    }
    const rows = [...map.entries()]
      .map(([city, v]) => ({ city, clinics: v.clinics.size, patients: v.patients.size, appointments: v.appointments, revenue: v.revenue }))
      .sort((a, b) => b.appointments - a.appointments);

    return {
      table: {
        headers: ["Location", "Clinics", "Patients", "Appointments", "Revenue (Rs.)"],
        rows: rows.map((r) => [r.city, r.clinics, r.patients, r.appointments, r.revenue]),
      },
      chart: rows.map((r) => ({ label: r.city, value: r.appointments })),
    };
  }, [filteredAppointments, clinicMap]);

  const groupReport: ComputedReport = useMemo(() => {
    const rows = APPOINTMENT_TYPES_LIST.map((type) => {
      const apts = filteredAppointments.filter((a) => (a.appointmentType ?? "consultation") === type);
      const ids = new Set(apts.map((a) => a.patientId).filter(Boolean) as string[]);
      const revenue = apts.reduce((sum, a) => {
        const p = getPayment(a);
        return p?.status === "verified" ? sum + p.amountPkr : sum;
      }, 0);
      return { type: APPOINTMENT_TYPE_LABEL[type], patients: ids.size, appointments: apts.length, revenue };
    });

    return {
      table: {
        headers: ["Type", "Patients", "Appointments", "Revenue (Rs.)"],
        rows: rows.map((r) => [r.type, r.patients, r.appointments, r.revenue]),
      },
      chart: rows.map((r) => ({ label: r.type, value: r.appointments })),
    };
  }, [filteredAppointments]);

  const paymentReport: ComputedReport = useMemo(() => {
    const withPayments = filteredAppointments
      .map((a) => ({ a, p: getPayment(a) }))
      .filter((x): x is { a: ApiAppointment; p: ApiPayment } => !!x.p);

    const online = withPayments.filter((x) => ONLINE_PAYMENT_METHODS.includes(x.p.method));
    const reception = withPayments.filter((x) => x.p.method === "reception");
    const sumAmount = (list: typeof withPayments) => list.reduce((s, x) => s + x.p.amountPkr, 0);
    const onlineTotal = sumAmount(online);
    const receptionTotal = sumAmount(reception);

    const sortByDateDesc = (list: typeof withPayments) =>
      [...list].sort((x, y) => (x.a.date === y.a.date ? y.a.time.localeCompare(x.a.time) : y.a.date.localeCompare(x.a.date)));

    const onlineTable: ReportTable = {
      headers: ["Date", "Time", "Patient", "Method", "Amount (Rs.)", "Status"],
      rows: sortByDateDesc(online).map((x) => [
        x.a.date,
        x.a.time,
        x.a.patientSnapshot.fullName,
        PAYMENT_METHOD_LABEL[x.p.method],
        x.p.amountPkr,
        capitalize(x.p.status),
      ]),
    };

    const receptionTable: ReportTable = {
      headers: ["Date", "Time", "Patient", "Amount (Rs.)", "Status"],
      rows: sortByDateDesc(reception).map((x) => [
        x.a.date,
        x.a.time,
        x.a.patientSnapshot.fullName,
        x.p.amountPkr,
        capitalize(x.p.status),
      ]),
    };

    return {
      table: {
        headers: ["Payment Type", "Count", "Amount (Rs.)"],
        rows: [
          ["Online Payments", online.length, onlineTotal],
          ["Reception Payments", reception.length, receptionTotal],
        ],
      },
      chart: [
        { label: "Online", value: onlineTotal },
        { label: "Reception", value: receptionTotal },
      ],
      summary: [
        { label: "Online Payments", value: `${online.length} · Rs. ${onlineTotal.toLocaleString()}` },
        { label: "Reception Payments", value: `${reception.length} · Rs. ${receptionTotal.toLocaleString()}` },
        { label: "Total Payments", value: withPayments.length },
        { label: "Grand Total (Rs.)", value: (onlineTotal + receptionTotal).toLocaleString() },
      ],
      extraTables: [
        { title: "Online Payments", table: onlineTable },
        { title: "Reception Payments", table: receptionTable },
      ],
    };
  }, [filteredAppointments]);

  const clinicSummaryReport: ComputedReport = useMemo(() => {
    const map = new Map<string, { name: string; patients: Set<string>; newPatients: Set<string>; appointments: number; revenue: number }>();
    for (const a of filteredAppointments) {
      const c = clinicOf(a);
      if (!c) continue;
      const entry = map.get(c.id) ?? { name: c.name, patients: new Set<string>(), newPatients: new Set<string>(), appointments: 0, revenue: 0 };
      if (a.patientId) {
        entry.patients.add(a.patientId);
        if (firstApptDateByPatient.get(a.patientId) === a.date) entry.newPatients.add(a.patientId);
      }
      entry.appointments += 1;
      const p = getPayment(a);
      if (p?.status === "verified") entry.revenue += p.amountPkr;
      map.set(c.id, entry);
    }
    const rows = [...map.entries()]
      .map(([, v]) => ({
        clinic: v.name,
        total: v.patients.size,
        newPatients: v.newPatients.size,
        returning: v.patients.size - v.newPatients.size,
        appointments: v.appointments,
        revenue: v.revenue,
      }))
      .sort((a, b) => b.appointments - a.appointments);

    return {
      table: {
        headers: ["Clinic", "Total Patients", "New", "Returning", "Appointments", "Revenue (Rs.)"],
        rows: rows.map((r) => [r.clinic, r.total, r.newPatients, r.returning, r.appointments, r.revenue]),
      },
      chart: rows.map((r) => ({ label: r.clinic, value: r.appointments })),
    };
  }, [filteredAppointments, firstApptDateByPatient]);

  const PATIENT_TABLE_HEADERS = ["Date", "Time", "Patient", "Phone", "Email", "Clinic", "Procedure / Service", "Type", "Status", "Fee (Rs.)"];
  // Full, unfiltered appointment history for the selected patient — used for the
  // identity header (last/next visit, total visits, outstanding balance), which
  // should reflect the patient's whole record, not just the active date range.
  const patientAllAppointments = useMemo(() => {
    if (patientFilter === "All") return [];
    return appointments
      .filter((a) => a.patientId === patientFilter)
      .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : b.date.localeCompare(a.date)));
  }, [appointments, patientFilter]);

  const patientHeaderInfo = useMemo(() => {
    if (patientFilter === "All") return null;
    const patient = patientMap.get(patientFilter);
    const all = patientAllAppointments;
    const todayStr = todayIso;
    const past = all.filter((a) => a.date <= todayStr);
    const future = all
      .filter((a) => a.date > todayStr && (a.status === "confirmed" || PENDING_STATUSES.includes(a.status)))
      .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));

    const resolvedPhone =
      (patient?.phone && patient.phone !== "—" ? patient.phone : undefined) ??
      all.find((a) => a.patientSnapshot.phone)?.patientSnapshot.phone ??
      "—";
    const resolvedEmail = patient?.email && patient.email !== "—" ? patient.email : "—";
    const resolvedAge = patient?.age ?? all[0]?.patientSnapshot.age ?? null;
    const resolvedGender = patient?.gender ?? all[0]?.patientSnapshot.gender ?? null;
    const outstanding = all.reduce((s, a) => s + pendingAmount(a), 0);

    return {
      name: patient?.name ?? all[0]?.patientSnapshot.fullName ?? "—",
      patientId: patientFilter,
      phone: resolvedPhone,
      email: resolvedEmail,
      gender: resolvedGender ? capitalize(resolvedGender) : "—",
      age: resolvedAge != null ? String(resolvedAge) : "—",
      dob: "—",
      registeredSince: patient ? isoDay(patient.createdAt) : "—",
      totalVisits: patient?.totalVisits ?? all.length,
      outstandingBalance: `Rs. ${outstanding.toLocaleString()}`,
      lastAppointment: past.length > 0 ? `${past[0].date} ${past[0].time}` : "—",
      nextAppointment: future.length > 0 ? `${future[0].date} ${future[0].time}` : "—",
    };
  }, [patientFilter, patientMap, patientAllAppointments, todayIso]);

  const patientReport: ComputedReport = useMemo(() => {
    if (patientFilter === "All") {
      return { table: { headers: PATIENT_TABLE_HEADERS, rows: [] }, chart: [] };
    }
    const apts = filteredAppointments
      .filter((a) => a.patientId === patientFilter)
      .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : b.date.localeCompare(a.date)));

    const completed = apts.filter((a) => a.status === "completed").length;
    const upcoming = apts.filter((a) => a.status === "confirmed" && a.date >= todayIso).length;
    const cancelled = apts.filter((a) => a.status === "cancelled" || a.status === "rejected").length;
    const rescheduled = apts.filter((a) => a.status === "rescheduled").length;
    const totalPaid = apts.reduce((s, a) => s + paidAmount(a), 0);
    const totalPending = apts.reduce((s, a) => s + pendingAmount(a), 0);

    // 3. Appointment Breakdown — becomes the report's main table.
    const appointmentTypeTable: ReportTable = {
      headers: ["Appointment Type", ...BREAKDOWN_HEADERS_APPTS],
      rows: breakdownRows(apts, (a) => APPOINTMENT_TYPE_LABEL[a.appointmentType ?? "consultation"]),
    };

    // 4. Payment Method Summary
    const paymentMethodTable: ReportTable = {
      headers: ["Payment Method", "Transactions", "Paid Amount (Rs.)", "Pending Amount (Rs.)", "Total Amount (Rs.)"],
      rows: breakdownRows(
        apts.filter((a) => getPayment(a)),
        (a) => PAYMENT_METHOD_LABEL[getPayment(a)!.method]
      ),
    };

    // 5. Clinic-wise Summary
    const clinicTable: ReportTable = {
      headers: ["Clinic", ...BREAKDOWN_HEADERS_APPTS],
      rows: breakdownRows(apts, (a) => clinicOf(a)?.name ?? "—"),
    };

    // 6. Procedure / Service Summary
    const procedureTable: ReportTable = {
      headers: ["Procedure / Service", ...BREAKDOWN_HEADERS_APPTS],
      rows: breakdownRows(apts, serviceLabel),
    };

    // 7. Payment Status Summary (Transactions + Amount only, no paid/pending split)
    const paymentStatusTable = paymentStatusSummaryTable(apts);

    // 8. Appointment Status Summary (Count only)
    const appointmentStatusTable = appointmentStatusSummaryTable(apts);

    // Full appointment listing — preserved from the previous report for drill-down detail, shown last.
    const appointmentDetailsTable: ReportTable = {
      headers: PATIENT_TABLE_HEADERS,
      rows: apts.map((a) => [
        a.date,
        a.time,
        a.patientSnapshot.fullName,
        a.patientSnapshot.phone && a.patientSnapshot.phone !== "—" ? a.patientSnapshot.phone : patientHeaderInfo?.phone ?? "—",
        patientHeaderInfo?.email ?? "—",
        clinicOf(a)?.name ?? "—",
        serviceLabel(a),
        APPOINTMENT_TYPE_LABEL[a.appointmentType ?? "consultation"],
        STATUS_LABEL[a.status],
        a.feeSnapshotPkr,
      ]),
    };

    return {
      table: appointmentTypeTable,
      chart: [],
      summary: [
        { label: "Total Revenue", value: `Rs. ${(totalPaid + totalPending).toLocaleString()}` },
        { label: "Total Paid Amount", value: `Rs. ${totalPaid.toLocaleString()}` },
        { label: "Total Pending Amount", value: `Rs. ${totalPending.toLocaleString()}` },
        { label: "Outstanding Balance", value: `Rs. ${totalPending.toLocaleString()}` },
        { label: "Total Appointments", value: apts.length },
        { label: "Completed Appointments", value: completed },
        { label: "Upcoming Appointments", value: upcoming },
        { label: "Cancelled Appointments", value: cancelled },
        { label: "Rescheduled Appointments", value: rescheduled },
      ],
      extraTables: [
        { title: "Payment Method Summary", table: paymentMethodTable },
        { title: "Clinic-wise Summary", table: clinicTable },
        { title: "Procedure / Service Summary", table: procedureTable },
        { title: "Payment Status Summary", table: paymentStatusTable },
        { title: "Appointment Status Summary", table: appointmentStatusTable },
        { title: "Appointment Details", table: appointmentDetailsTable },
      ],
    };
  }, [filteredAppointments, patientFilter, patientHeaderInfo, todayIso]);

  const reportByKey: Record<ReportKey, ComputedReport> = {
    overall,
    procedure: procedureReport,
    location: locationReport,
    group: groupReport,
    clinicSummary: clinicSummaryReport,
    patient: patientReport,
    payment: paymentReport,
  };
  const active = reportByKey[activeReport];

  /* ---------- Search / sort / paginate the active table ---------- */

  const searchedRows = useMemo(() => {
    if (!search.trim()) return active.table.rows;
    const term = search.toLowerCase();
    return active.table.rows.filter((row) => row.some((cell) => String(cell).toLowerCase().includes(term)));
  }, [active, search]);

  const sortedRows = useMemo(() => {
    if (sortKey === null) return searchedRows;
    const copy = [...searchedRows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [searchedRows, sortKey, sortDir]);

  const mainTotalsRow = useMemo(
    () => computeTotalsRow(active.table.headers, sortedRows),
    [active.table.headers, sortedRows]
  );

  function toggleSort(colIndex: number) {
    if (sortKey === colIndex) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(colIndex);
      setSortDir("asc");
    }
  }

  const filterSummary = [
    `${dateFrom || "Start"} to ${dateTo || "Today"}`,
    clinicFilter === "All" ? null : `Clinic: ${clinicMap.get(clinicFilter)?.name ?? clinicFilter}`,
    locationFilter === "All" ? null : `Location: ${locationFilter}`,
    procedureFilter === "All" ? null : `Procedure: ${procedureFilter}`,
    patientFilter === "All" ? null : `Patient: ${patientMap.get(patientFilter)?.name ?? patientFilter}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const activeLabel = REPORT_TABS.find((t) => t.key === activeReport)?.label ?? "Report";

  /* ---------- Export ---------- */

  async function exportPDF() {
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF({ orientation: "landscape" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      const HEADER_H = 32;

      const NAVY: [number, number, number] = [10, 36, 71];
      const NAVY_LIGHT: [number, number, number] = [24, 60, 105];
      const TEXT_DARK: [number, number, number] = [24, 28, 38];
      const TEXT_MUTED: [number, number, number] = [110, 114, 130];
      const CARD_BORDER: [number, number, number] = [226, 230, 238];
      const ROW_ALT: [number, number, number] = [244, 247, 250];

      const generatedAt = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
      const initials = doctor.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "DR";

      function drawHeader() {
        doc.setFillColor(...NAVY);
        doc.rect(0, 0, pageWidth, HEADER_H, "F");
        doc.setFillColor(...NAVY_LIGHT);
        doc.triangle(pageWidth * 0.62, HEADER_H, pageWidth, HEADER_H, pageWidth, HEADER_H * 0.25, "F");

        doc.setFillColor(255, 255, 255);
        doc.circle(margin + 8, HEADER_H / 2, 8, "F");
        doc.setTextColor(...NAVY);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(initials, margin + 8, HEADER_H / 2 + 1.5, { align: "center" });

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.text(doctor.name, margin + 20, HEADER_H / 2 - 4);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(doctor.designation, margin + 20, HEADER_H / 2 + 1.5);
        doc.setFontSize(8);
        doc.text([doctor.contactPhone, doctor.contactEmail].filter(Boolean).join("   ·   "), margin + 20, HEADER_H / 2 + 7);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(activeLabel, pageWidth - margin, HEADER_H / 2 - 3, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Generated: ${generatedAt}`, pageWidth - margin, HEADER_H / 2 + 4, { align: "right" });

        doc.setTextColor(0, 0, 0);
      }

      function drawFooter() {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setDrawColor(...CARD_BORDER);
          doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(...TEXT_MUTED);
          doc.text("Confidential — for internal clinical use only", margin, pageHeight - 7);
          doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: "right" });
        }
      }

      type IconKind = "people" | "calendar" | "check" | "clipboard" | "hourglass" | "cross" | "dollar" | "wallet" | "shield" | "dot";

      function cardMeta(label: string): { color: [number, number, number]; icon: IconKind } {
        const l = label.toLowerCase();
        if (l.includes("cancel") || l.includes("reject")) return { color: [239, 68, 68], icon: "cross" };
        if (l.startsWith("payments") && l.includes("pending")) return { color: [249, 115, 22], icon: "wallet" };
        if (l.includes("pending")) return { color: [249, 115, 22], icon: "hourglass" };
        if (l.includes("verified")) return { color: [34, 197, 94], icon: "shield" };
        if (l.includes("complete")) return { color: [20, 184, 166], icon: "clipboard" };
        if (l.includes("confirm")) return { color: [59, 130, 246], icon: "check" };
        if (l.includes("revenue")) return { color: [37, 99, 235], icon: "dollar" };
        if (l.includes("appointment")) return { color: [34, 197, 94], icon: "calendar" };
        if (l.includes("patient")) return { color: [59, 130, 246], icon: "people" };
        return { color: [100, 116, 139], icon: "dot" };
      }

      function drawCardIcon(cx: number, cy: number, r: number, icon: IconKind) {
        const s = r * 0.55;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(255, 255, 255);
        switch (icon) {
          case "check":
            doc.setLineWidth(0.7);
            doc.line(cx - s * 0.7, cy, cx - s * 0.15, cy + s * 0.55);
            doc.line(cx - s * 0.15, cy + s * 0.55, cx + s * 0.75, cy - s * 0.55);
            break;
          case "cross":
            doc.setLineWidth(0.7);
            doc.line(cx - s * 0.65, cy - s * 0.65, cx + s * 0.65, cy + s * 0.65);
            doc.line(cx - s * 0.65, cy + s * 0.65, cx + s * 0.65, cy - s * 0.65);
            break;
          case "hourglass":
            doc.triangle(cx - s * 0.8, cy - s * 0.9, cx + s * 0.8, cy - s * 0.9, cx, cy, "F");
            doc.triangle(cx - s * 0.8, cy + s * 0.9, cx + s * 0.8, cy + s * 0.9, cx, cy, "F");
            break;
          case "people":
            doc.circle(cx - s * 0.5, cy - s * 0.35, s * 0.4, "F");
            doc.circle(cx + s * 0.45, cy - s * 0.25, s * 0.4, "F");
            doc.triangle(cx - s * 1.0, cy + s * 0.9, cx, cy + s * 0.9, cx - s * 0.5, cy + s * 0.1, "F");
            doc.triangle(cx - s * 0.05, cy + s * 0.9, cx + s * 0.95, cy + s * 0.9, cx + s * 0.45, cy + s * 0.2, "F");
            break;
          case "calendar":
            doc.setLineWidth(0.5);
            doc.roundedRect(cx - s * 0.9, cy - s * 0.8, s * 1.8, s * 1.6, 0.4, 0.4, "S");
            doc.line(cx - s * 0.9, cy - s * 0.25, cx + s * 0.9, cy - s * 0.25);
            break;
          case "clipboard":
            doc.setLineWidth(0.5);
            doc.roundedRect(cx - s * 0.8, cy - s * 0.9, s * 1.6, s * 1.8, 0.4, 0.4, "S");
            doc.line(cx - s * 0.45, cy - s * 0.1, cx + s * 0.45, cy - s * 0.1);
            doc.line(cx - s * 0.45, cy + s * 0.35, cx + s * 0.45, cy + s * 0.35);
            break;
          case "dollar":
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(r * 2.1);
            doc.text("$", cx, cy + r * 0.35, { align: "center" });
            break;
          case "wallet":
            doc.setLineWidth(0.5);
            doc.roundedRect(cx - s * 0.95, cy - s * 0.65, s * 1.9, s * 1.3, 0.4, 0.4, "S");
            doc.circle(cx + s * 0.55, cy, s * 0.22, "F");
            break;
          case "shield":
            doc.roundedRect(cx - s * 0.75, cy - s * 0.9, s * 1.5, s * 1.2, 0.3, 0.3, "F");
            doc.triangle(cx - s * 0.75, cy + s * 0.25, cx + s * 0.75, cy + s * 0.25, cx, cy + s * 1.0, "F");
            break;
          default:
            doc.circle(cx, cy, s * 0.4, "F");
        }
        doc.setTextColor(0, 0, 0);
      }

      function isWideCard(c: SummaryCard) {
        return c.label.startsWith("Revenue") || c.label.startsWith("Payments") || String(c.value).length > 12;
      }

      function drawCard(c: SummaryCard, x: number, cy: number, w: number, h: number) {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...CARD_BORDER);
        doc.roundedRect(x, cy, w, h, 2.5, 2.5, "FD");

        const meta = cardMeta(c.label);
        const iconCx = x + 7;
        const iconCy = cy + 7;
        doc.setFillColor(...meta.color);
        doc.circle(iconCx, iconCy, 3.2, "F");
        drawCardIcon(iconCx, iconCy, 3.2, meta.icon);

        doc.setTextColor(...TEXT_MUTED);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.text(c.label, x + 13, cy + 8.2, { maxWidth: w - 16 });

        doc.setTextColor(...TEXT_DARK);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11.5);
        doc.text(String(c.value), x + 4, cy + h - 4, { maxWidth: w - 8 });
      }

      function drawSummaryCards(cards: SummaryCard[], startY: number): number {
        if (cards.length === 0) return startY;
        const compact = cards.filter((c) => !isWideCard(c));
        const wide = cards.filter(isWideCard);
        const gap = 4;
        let y = startY;

        if (compact.length > 0) {
          const cols = Math.min(6, compact.length);
          const cardW = (contentWidth - gap * (cols - 1)) / cols;
          const cardH = 20;
          compact.forEach((c, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            drawCard(c, margin + col * (cardW + gap), y + row * (cardH + gap), cardW, cardH);
          });
          y += Math.ceil(compact.length / cols) * (cardH + gap);
        }

        if (wide.length > 0) {
          const cols = Math.min(3, wide.length);
          const cardW = (contentWidth - gap * (cols - 1)) / cols;
          const cardH = 20;
          wide.forEach((c, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            drawCard(c, margin + col * (cardW + gap), y + row * (cardH + gap), cardW, cardH);
          });
          y += Math.ceil(wide.length / cols) * (cardH + gap);
        }

        return y + 4;
      }

      function pillColors(raw: string): { bg: [number, number, number]; text: [number, number, number] } | null {
        const v = raw.trim().toLowerCase();
        if (["confirmed", "verified"].includes(v)) return { bg: [220, 252, 231], text: [21, 128, 61] };
        if (v === "completed") return { bg: [219, 234, 254], text: [30, 64, 175] };
        if (["pending payment", "payment submitted", "payment verification", "pending", "submitted"].includes(v))
          return { bg: [255, 237, 213], text: [194, 65, 12] };
        if (["cancelled", "rejected", "no show", "failed"].includes(v)) return { bg: [254, 226, 226], text: [185, 28, 28] };
        if (v === "rescheduled") return { bg: [237, 233, 254], text: [91, 33, 182] };
        if (v === "refunded") return { bg: [229, 231, 235], text: [55, 65, 81] };
        return null;
      }

      function renderTable(headers: string[], rows: (string | number)[][], startY: number, fontSize: number): number {
        const badgeCols = new Set(headers.map((h, i) => (h === "Status" || h === "Payment" ? i : -1)).filter((i) => i >= 0));
        const totalsRow = computeTotalsRow(headers, rows);

        // Badge cell text is blanked below (drawn as a colored pill instead), which
        // would otherwise starve autoTable's auto-width calc for that column — pill
        // width is measured up front so the column is never narrower than its widest
        // pill, which is what caused pills to spill into the next column.
        const badgePillFontSize = Math.max(6, fontSize - 0.5);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(badgePillFontSize);
        const badgeColumnStyles: Record<number, { minCellWidth: number }> = {};
        for (const colIndex of badgeCols) {
          let maxPillWidth = 0;
          for (const row of rows) {
            const raw = String(row[colIndex] ?? "").trim();
            if (!raw || raw === "—") continue;
            maxPillWidth = Math.max(maxPillWidth, doc.getTextWidth(raw) + 4.4);
          }
          if (maxPillWidth > 0) badgeColumnStyles[colIndex] = { minCellWidth: maxPillWidth + 5 };
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);

        autoTable(doc, {
          startY,
          head: [headers],
          body: rows,
          foot: totalsRow ? [totalsRow] : undefined,
          theme: "striped",
          styles: { fontSize, cellPadding: 2.5, textColor: TEXT_DARK, lineColor: CARD_BORDER, lineWidth: 0.1 },
          headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
          footStyles: { fillColor: ROW_ALT, textColor: TEXT_DARK, fontStyle: "bold" },
          alternateRowStyles: { fillColor: ROW_ALT },
          columnStyles: badgeColumnStyles,
          margin: { left: margin, right: margin, top: 16, bottom: 16 },
          didParseCell: (data) => {
            if (data.section === "body" && badgeCols.has(data.column.index)) {
              data.cell.text = [""];
            }
          },
          didDrawCell: (data) => {
            if (data.section !== "body" || !badgeCols.has(data.column.index)) return;
            const raw = String(data.cell.raw ?? "").trim();
            if (!raw || raw === "—") return;
            const style = pillColors(raw);
            if (!style) return;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(Math.max(6, fontSize - 0.5));
            const textW = doc.getTextWidth(raw);
            // Clamped so a long label can never overflow into the next column even
            // if the column ends up narrower than the pill (e.g. a very tight page).
            const pillW = Math.min(textW + 4.4, data.cell.width - 1);
            const pillH = data.cell.height - 3;
            const px = data.cell.x + (data.cell.width - pillW) / 2;
            const py = data.cell.y + (data.cell.height - pillH) / 2;
            doc.setFillColor(...style.bg);
            doc.roundedRect(px, py, pillW, pillH, pillH / 2, pillH / 2, "F");
            doc.setTextColor(...style.text);
            doc.text(raw, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: "center" });
            doc.setTextColor(...TEXT_DARK);
          },
          didDrawPage: () => {
            if (doc.getCurrentPageInfo().pageNumber === 1) drawHeader();
          },
        });

        return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
      }

      drawHeader();

      doc.setTextColor(...NAVY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text(activeLabel, margin, HEADER_H + 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(filterSummary, margin, HEADER_H + 16);
      doc.setDrawColor(...CARD_BORDER);
      doc.line(margin, HEADER_H + 19, pageWidth - margin, HEADER_H + 19);
      doc.setTextColor(...TEXT_DARK);

      let y = HEADER_H + 25;

      if (activeReport === "patient" && patientHeaderInfo) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...NAVY);
        doc.text("Patient Information", margin, y);
        doc.setTextColor(...TEXT_DARK);
        y += 4;
        y = renderTable(
          ["Field", "Value"],
          [
            ["Patient Name", patientHeaderInfo.name],
            ["Patient ID / MR No.", patientHeaderInfo.patientId],
            ["Phone Number", patientHeaderInfo.phone],
            ["Email", patientHeaderInfo.email],
            ["Gender", patientHeaderInfo.gender],
            ["Age", patientHeaderInfo.age],
            ["Date of Birth", patientHeaderInfo.dob],
            ["Registered Since", patientHeaderInfo.registeredSince],
            ["Total Visits", patientHeaderInfo.totalVisits],
            ["Outstanding Balance", patientHeaderInfo.outstandingBalance],
            ["Last Appointment", patientHeaderInfo.lastAppointment],
            ["Next Appointment", patientHeaderInfo.nextAppointment],
          ],
          y,
          8
        );
        y += 6;
      }

      if (active.summary && active.summary.length > 0) {
        // Cards are hand-drawn (no autoTable pagination), so pre-compute their
        // height and break to a fresh page ourselves if they wouldn't fit —
        // otherwise they silently overflow into (or past) the footer band.
        const compactCount = active.summary.filter((c) => !isWideCard(c)).length;
        const wideCount = active.summary.length - compactCount;
        const cardH = 20;
        const gap = 4;
        const compactRows = compactCount > 0 ? Math.ceil(compactCount / Math.min(6, compactCount)) : 0;
        const wideRows = wideCount > 0 ? Math.ceil(wideCount / Math.min(3, wideCount)) : 0;
        const cardsBlockHeight = 5 + compactRows * (cardH + gap) + wideRows * (cardH + gap) + 4;
        const pageHeight = doc.internal.pageSize.getHeight();
        if (y + cardsBlockHeight > pageHeight - 18) {
          doc.addPage();
          y = 16;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...NAVY);
        doc.text("Summary Overview", margin, y);
        doc.setTextColor(...TEXT_DARK);
        y += 5;
        y = drawSummaryCards(active.summary, y);
      }

      const isMetricValueTable = active.table.headers.length === 2 && active.table.headers[0] === "Metric" && active.table.headers[1] === "Value";
      if (!isMetricValueTable) {
        y = renderTable(active.table.headers, sortedRows, y, 8);
      }

      for (const et of active.extraTables ?? []) {
        let startY = y + 12;
        if (startY > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          startY = 16;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...NAVY);
        doc.text(et.title, margin, startY);
        doc.setTextColor(...TEXT_DARK);
        y = renderTable(et.table.headers, et.table.rows, startY + 4, 7);
      }

      drawFooter();
      doc.save(`${activeReport}-report.pdf`);
    } finally {
      setExporting(false);
      setExportOpen(false);
    }
  }

  function exportCSV() {
    const sections: (string | number)[][] = [
      active.table.headers,
      ...sortedRows,
      ...(mainTotalsRow ? [mainTotalsRow] : []),
    ];
    for (const et of active.extraTables ?? []) {
      const etTotals = computeTotalsRow(et.table.headers, et.table.rows);
      sections.push([], [et.title], et.table.headers, ...et.table.rows, ...(etTotals ? [etTotals] : []));
    }
    const csv = sections
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeReport}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  }

  async function exportXLSX() {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        active.table.headers,
        ...sortedRows,
        ...(mainTotalsRow ? [mainTotalsRow] : []),
      ]);
      XLSX.utils.book_append_sheet(wb, ws, activeLabel.slice(0, 28));

      for (const et of active.extraTables ?? []) {
        const etTotals = computeTotalsRow(et.table.headers, et.table.rows);
        const ews = XLSX.utils.aoa_to_sheet([
          et.table.headers,
          ...et.table.rows,
          ...(etTotals ? [etTotals] : []),
        ]);
        XLSX.utils.book_append_sheet(wb, ews, et.title.slice(0, 28));
      }

      XLSX.writeFile(wb, `${activeReport}-report.xlsx`);
    } finally {
      setExporting(false);
      setExportOpen(false);
    }
  }

  function resetFilters() {
    setDateFrom(monthAgoIso);
    setDateTo(todayIso);
    setClinicFilter("All");
    setLocationFilter("All");
    setProcedureFilter("All");
    setPatientFilter("All");
    setPatientQuery("");
  }

  /* ---------- Render ---------- */

  return (
    <div className="max-w-container-max mx-auto px-gutter py-gutter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Reports</h2>
          <p className="text-body-lg text-on-surface-variant">Export clinical &amp; financial reports across every clinic</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setExportOpen((v) => !v)}
            disabled={exporting || loading}
            className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary font-semibold text-label-md rounded-lg hover:brightness-110 transition-all shadow-sm disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[20px]">ios_share</span>
            {exporting ? "Exporting…" : "Export Report"}
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
          {exportOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 mt-xs w-44 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-20 overflow-hidden">
                <button onClick={exportPDF} className="w-full text-left px-md py-sm text-body-md hover:bg-surface-container-high transition-colors flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px] text-error">picture_as_pdf</span> PDF
                </button>
                <button onClick={exportXLSX} className="w-full text-left px-md py-sm text-body-md hover:bg-surface-container-high transition-colors flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px] text-secondary">table_view</span> Excel (XLSX)
                </button>
                <button onClick={exportCSV} className="w-full text-left px-md py-sm text-body-md hover:bg-surface-container-high transition-colors flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px] text-primary">description</span> CSV
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm mb-lg border border-outline-variant/30 flex flex-wrap gap-md items-end">
        <div className="flex items-center gap-xs">
          <label className="text-label-md text-outline">Date Range</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-sm py-xs bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-md" />
          <span className="text-outline">–</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-sm py-xs bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-md" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-outline">Clinic</label>
          <select value={clinicFilter} onChange={(e) => setClinicFilter(e.target.value)} className="px-sm py-xs bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-md min-w-40">
            <option value="All">All Clinics</option>
            {clinics.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-outline">Location</label>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="px-sm py-xs bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-md min-w-32">
            <option value="All">All Locations</option>
            {locations.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-caption text-outline">Procedure</label>
          <select value={procedureFilter} onChange={(e) => setProcedureFilter(e.target.value)} className="px-sm py-xs bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-md min-w-40">
            <option value="All">All Procedures</option>
            {procedures.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 relative">
          <label className="text-caption text-outline">Patient</label>
          <div className="relative">
            <input
              type="text"
              value={patientFilter === "All" ? patientQuery : patientMap.get(patientFilter)?.name ?? ""}
              onChange={(e) => {
                setPatientQuery(e.target.value);
                setPatientFilter("All");
                setPatientDropdownOpen(true);
              }}
              onFocus={() => setPatientDropdownOpen(true)}
              placeholder="Search patient by name…"
              className="px-sm py-xs bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-md min-w-48 w-full"
            />
            {patientFilter !== "All" && (
              <button
                type="button"
                onClick={() => {
                  setPatientFilter("All");
                  setPatientQuery("");
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-outline hover:text-on-surface rounded"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
            {patientDropdownOpen && patientFilter === "All" && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPatientDropdownOpen(false)} />
                <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg">
                  {patientOptions.length === 0 ? (
                    <p className="px-sm py-xs text-caption text-outline">No patients found</p>
                  ) : (
                    patientOptions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPatientFilter(p.id);
                          setPatientQuery(p.name);
                          setPatientDropdownOpen(false);
                        }}
                        className="w-full text-left px-sm py-xs text-body-md hover:bg-surface-container-high transition-colors"
                      >
                        {p.name}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <button onClick={resetFilters} className="text-primary text-label-md font-semibold hover:underline ml-auto">
          Reset Filters
        </button>
      </div>

      {/* Report tabs */}
      <div className="flex flex-wrap gap-xs mb-lg">
        {REPORT_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveReport(t.key)}
            className={`flex items-center gap-xs px-md py-xs rounded-full text-label-md font-semibold transition-colors ${
              activeReport === t.key ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-xl text-center text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin align-middle mr-xs">progress_activity</span>
          Loading reports…
        </div>
      ) : (
        <>
          {/* Patient Information Header */}
          {activeReport === "patient" && patientHeaderInfo && (
            <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm mb-lg">
              <h3 className="font-bold text-on-surface mb-md">Patient Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
                {[
                  { label: "Patient Name", value: patientHeaderInfo.name },
                  { label: "Patient ID / MR No.", value: patientHeaderInfo.patientId },
                  { label: "Phone Number", value: patientHeaderInfo.phone },
                  { label: "Email", value: patientHeaderInfo.email },
                  { label: "Gender", value: patientHeaderInfo.gender },
                  { label: "Age", value: patientHeaderInfo.age },
                  { label: "Date of Birth", value: patientHeaderInfo.dob },
                  { label: "Registered Since", value: patientHeaderInfo.registeredSince },
                  { label: "Total Visits", value: patientHeaderInfo.totalVisits },
                  { label: "Outstanding Balance", value: patientHeaderInfo.outstandingBalance },
                  { label: "Last Appointment", value: patientHeaderInfo.lastAppointment },
                  { label: "Next Appointment", value: patientHeaderInfo.nextAppointment },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider">{f.label}</p>
                    <p className="font-bold text-on-surface mt-1 text-body-lg break-all">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary cards */}
          {active.summary && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md mb-lg">
              {active.summary.map((s) => (
                <div key={s.label} className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm">
                  <p className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider">{s.label}</p>
                  <p
                    className={`font-bold text-on-surface mt-1 break-all ${
                      s.label === "Phone" || s.label === "Email" ? "text-body-lg" : "text-headline-md"
                    }`}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Chart */}
          {active.chart.length > 0 && (
            <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm mb-lg">
              <h3 className="text-headline-md font-semibold mb-md">{activeLabel}</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={active.chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e1e2ed" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#737686" }} axisLine={{ stroke: "#e1e2ed" }} tickLine={false} interval={active.chart.length > 10 ? Math.ceil(active.chart.length / 10) : 0} />
                  <YAxis tick={{ fontSize: 11, fill: "#737686" }} axisLine={false} tickLine={false} width={48} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#c3c6d7", fontSize: 12 }} />
                  <Bar dataKey="value" fill="#006591" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="px-md py-sm border-b border-outline-variant/30 flex flex-wrap items-center justify-between gap-sm">
              <h3 className="font-bold text-on-surface">{activeLabel}</h3>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 leading-none text-outline text-[18px] pointer-events-none">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search this table…"
                  className="pl-8 pr-sm py-xs bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-md w-56"
                />
              </div>
            </div>
            <div className="overflow-x-auto overflow-y-auto max-h-150">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant/30 sticky top-0 z-1">
                  <tr>
                    {active.table.headers.map((h, i) => (
                      <th
                        key={h}
                        onClick={() => toggleSort(i)}
                        className="px-md py-sm font-label-md text-label-md text-outline uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-primary transition-colors"
                      >
                        <span className="inline-flex items-center gap-1">
                          {h}
                          {sortKey === i && (
                            <span className="material-symbols-outlined text-[16px]">{sortDir === "asc" ? "arrow_upward" : "arrow_downward"}</span>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {sortedRows.length === 0 ? (
                    <tr>
                      <td colSpan={active.table.headers.length} className="px-md py-xl text-center text-on-surface-variant">
                        {activeReport === "patient" && patientFilter === "All"
                          ? "Select a patient above to view their report."
                          : "No data for the selected filters."}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {sortedRows.map((row, i) => (
                        <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                          {row.map((cell, j) => (
                            <td key={j} className="px-md py-sm text-body-md whitespace-nowrap">
                              {typeof cell === "number" ? cell.toLocaleString() : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {mainTotalsRow && (
                        <tr className="bg-primary/5 font-bold border-t-2 border-primary/20">
                          {mainTotalsRow.map((cell, j) => (
                            <td key={j} className="px-md py-sm text-body-md text-on-surface whitespace-nowrap">
                              {typeof cell === "number" ? cell.toLocaleString() : cell}
                            </td>
                          ))}
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {sortedRows.length > 0 && (
              <div className="px-md py-sm bg-surface-container-low/30 border-t border-outline-variant/30">
                <p className="text-caption text-outline">{sortedRows.length} rows</p>
              </div>
            )}
          </div>

          {/* Extra data tables (e.g. full appointments / patients listing) */}
          {active.extraTables?.map((et) => {
            const etTotalsRow = computeTotalsRow(et.table.headers, et.table.rows);
            return (
            <div key={et.title} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden mt-lg">
              <div className="px-md py-sm border-b border-outline-variant/30">
                <h3 className="font-bold text-on-surface">{et.title}</h3>
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-150">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low border-b border-outline-variant/30 sticky top-0 z-1">
                    <tr>
                      {et.table.headers.map((h) => (
                        <th key={h} className="px-md py-sm font-label-md text-label-md text-outline uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {et.table.rows.length === 0 ? (
                      <tr>
                        <td colSpan={et.table.headers.length} className="px-md py-xl text-center text-on-surface-variant">
                          No data for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {et.table.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                            {row.map((cell, j) => (
                              <td key={j} className="px-md py-sm text-body-md whitespace-nowrap">
                                {typeof cell === "number" ? cell.toLocaleString() : cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {etTotalsRow && (
                          <tr className="bg-primary/5 font-bold border-t-2 border-primary/20">
                            {etTotalsRow.map((cell, j) => (
                              <td key={j} className="px-md py-sm text-body-md text-on-surface whitespace-nowrap">
                                {typeof cell === "number" ? cell.toLocaleString() : cell}
                              </td>
                            ))}
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              {et.table.rows.length > 0 && (
                <div className="px-md py-sm bg-surface-container-low/30 border-t border-outline-variant/30">
                  <p className="text-caption text-outline">{et.table.rows.length} rows</p>
                </div>
              )}
            </div>
            );
          })}
        </>
      )}
    </div>
  );
}
