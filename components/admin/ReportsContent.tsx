"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { AppointmentStatus, AppointmentType, VisitType } from "@/types/appointment";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";

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
  patientSnapshot: { fullName: string };
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
const PATIENT_GROUPS: PatientGroup[] = ["Active", "Follow-up", "New"];

type Granularity = "daily" | "monthly" | "yearly";
type ReportKey = "overall" | "procedure" | "location" | "patientCount" | "group" | "clinicSummary";

/** Data-driven tab list — add a new entry + a computeXxx() branch below to add a report type. */
const REPORT_TABS: { key: ReportKey; label: string; icon: string }[] = [
  { key: "overall", label: "Overall Report", icon: "dashboard" },
  { key: "procedure", label: "Procedure / Service", icon: "medical_services" },
  { key: "location", label: "Location-wise", icon: "location_on" },
  { key: "patientCount", label: "Patient Count", icon: "groups" },
  { key: "group", label: "Group Report", icon: "category" },
  { key: "clinicSummary", label: "Clinic Summary", icon: "storefront" },
];

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
function bucketOf(dateIso: string, granularity: Granularity): { key: string; label: string } {
  const d = new Date(dateIso);
  if (granularity === "yearly") {
    const y = String(d.getFullYear());
    return { key: y, label: y };
  }
  if (granularity === "monthly") {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { key, label: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }) };
  }
  return { key: isoDay(dateIso), label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
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
}

/* ============================================================
   Component
   ============================================================ */

export default function ReportsContent() {
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [clinics, setClinics] = useState<ApiClinic[]>([]);
  const [patients, setPatients] = useState<ApiPatient[]>([]);
  const [loading, setLoading] = useState(true);

  const todayIso = new Date().toISOString().slice(0, 10);
  const monthAgoIso = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState(monthAgoIso);
  const [dateTo, setDateTo] = useState(todayIso);
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [clinicFilter, setClinicFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [groupFilter, setGroupFilter] = useState<"All" | PatientGroup>("All");
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
  }, [activeReport, dateFrom, dateTo, clinicFilter, locationFilter, groupFilter, granularity]);

  const clinicMap = useMemo(() => new Map(clinics.map((c) => [c._id, c])), [clinics]);
  const locations = useMemo(() => [...new Set(clinics.map((c) => c.city))].sort(), [clinics]);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((a) => {
        if (dateFrom && a.date < dateFrom) return false;
        if (dateTo && a.date > dateTo) return false;
        const clinic = clinicOf(a);
        if (clinicFilter !== "All" && clinic?.id !== clinicFilter) return false;
        if (locationFilter !== "All" && clinicMap.get(clinic?.id ?? "")?.city !== locationFilter) return false;
        return true;
      }),
    [appointments, dateFrom, dateTo, clinicFilter, locationFilter, clinicMap]
  );

  const filteredPatients = useMemo(
    () =>
      patients.filter((p) => {
        if (groupFilter !== "All" && p.status !== groupFilter) return false;
        const day = isoDay(p.createdAt);
        if (dateFrom && day < dateFrom) return false;
        if (dateTo && day > dateTo) return false;
        return true;
      }),
    [patients, groupFilter, dateFrom, dateTo]
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
      { label: "Completed", value: completed },
      { label: "Pending", value: pending },
      { label: "Cancelled", value: cancelled },
      { label: "Revenue", value: `Rs. ${revenue.toLocaleString()}` },
    ];

    const chart = paymentSummary.map((g) => ({ label: g.status, value: g.amount }));
    return { table, chart, summary };
  }, [filteredAppointments]);

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

  const patientCountReport: ComputedReport = useMemo(() => {
    const buckets = new Map<string, { label: string; count: number }>();
    for (const p of filteredPatients) {
      const { key, label } = bucketOf(p.createdAt, granularity);
      const entry = buckets.get(key) ?? { label, count: 0 };
      entry.count += 1;
      buckets.set(key, entry);
    }
    const rows = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
    const unitLabel = granularity === "yearly" ? "Year" : granularity === "monthly" ? "Month" : "Day";

    return {
      table: { headers: [unitLabel, "New Patients"], rows: rows.map((r) => [r.label, r.count]) },
      chart: rows.map((r) => ({ label: r.label, value: r.count })),
      summary: [
        { label: "New Patients in Range", value: filteredPatients.length },
        { label: "Buckets", value: rows.length },
      ],
    };
  }, [filteredPatients, granularity]);

  const groupReport: ComputedReport = useMemo(() => {
    const rows = PATIENT_GROUPS.map((g) => {
      const groupPatients = patients.filter((p) => {
        if (p.status !== g) return false;
        const day = isoDay(p.createdAt);
        if (dateFrom && day < dateFrom) return false;
        if (dateTo && day > dateTo) return false;
        return true;
      });
      const ids = new Set(groupPatients.map((p) => p.id));
      const apts = filteredAppointments.filter((a) => a.patientId && ids.has(a.patientId));
      const revenue = apts.reduce((sum, a) => {
        const p = getPayment(a);
        return p?.status === "verified" ? sum + p.amountPkr : sum;
      }, 0);
      return { group: g, patients: ids.size, appointments: apts.length, revenue };
    });

    return {
      table: {
        headers: ["Group", "Patients", "Appointments", "Revenue (Rs.)"],
        rows: rows.map((r) => [r.group, r.patients, r.appointments, r.revenue]),
      },
      chart: rows.map((r) => ({ label: r.group, value: r.patients })),
    };
  }, [patients, filteredAppointments, dateFrom, dateTo]);

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

  const reportByKey: Record<ReportKey, ComputedReport> = {
    overall,
    procedure: procedureReport,
    location: locationReport,
    patientCount: patientCountReport,
    group: groupReport,
    clinicSummary: clinicSummaryReport,
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
    groupFilter === "All" ? null : `Group: ${groupFilter}`,
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
      doc.setFontSize(14);
      doc.text(activeLabel, 14, 14);
      doc.setFontSize(9);
      doc.text(filterSummary, 14, 20);
      autoTable(doc, { startY: 26, head: [active.table.headers], body: sortedRows, styles: { fontSize: 8 } });
      doc.save(`${activeReport}-report.pdf`);
    } finally {
      setExporting(false);
      setExportOpen(false);
    }
  }

  function exportCSV() {
    const rows = [active.table.headers, ...sortedRows];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
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
      const ws = XLSX.utils.aoa_to_sheet([active.table.headers, ...sortedRows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, activeLabel.slice(0, 28));
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
    setGroupFilter("All");
    setGranularity("daily");
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
          <label className="text-caption text-outline">Granularity</label>
          <select value={granularity} onChange={(e) => setGranularity(e.target.value as Granularity)} className="px-sm py-xs bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-md">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
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
          <label className="text-caption text-outline">Patient Group</label>
          <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value as typeof groupFilter)} className="px-sm py-xs bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-md">
            <option value="All">All Groups</option>
            {PATIENT_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
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
          {/* Summary cards */}
          {active.summary && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md mb-lg">
              {active.summary.map((s) => (
                <div key={s.label} className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm">
                  <p className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider">{s.label}</p>
                  <p className="text-headline-md font-bold text-on-surface mt-1">{s.value}</p>
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
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low/50 border-b border-outline-variant/30">
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
                        No data for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    sortedRows.map((row, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                        {row.map((cell, j) => (
                          <td key={j} className="px-md py-sm text-body-md whitespace-nowrap">
                            {typeof cell === "number" ? cell.toLocaleString() : cell}
                          </td>
                        ))}
                      </tr>
                    ))
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
        </>
      )}
    </div>
  );
}
