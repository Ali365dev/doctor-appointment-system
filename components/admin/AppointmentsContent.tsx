"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { APPOINTMENT_STATUSES, type AppointmentStatus, type AppointmentType, type VisitType } from "@/types/appointment";
import { PAYMENT_METHODS, PAYMENT_STATUSES, type PaymentMethod, type PaymentStatus } from "@/types/payment";
import { PAYMENT_METHOD_LABEL } from "@/lib/appointmentDisplay";
import { doctor } from "@/lib/data";

interface ApiPayment {
  _id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amountPkr: number;
  transactionRef?: string;
  receiptUrl?: string;
  receiptUploadedAt?: string;
}

interface ApiAppointment {
  _id: string;
  appointmentNumber: string;
  clinicId: { _id: string; name: string } | string;
  visitType: VisitType;
  date: string;
  time: string;
  reason?: string;
  patientSnapshot: { fullName: string; phone: string; email?: string; notes?: string };
  feeSnapshotPkr: number;
  paymentId?: ApiPayment | string;
  status: AppointmentStatus;
  appointmentType: AppointmentType;
  procedureNameSnapshot?: string;
  durationMinutes: number;
  referralDoctor?: string;
  medicalReportUrl?: string;
}

const APPOINTMENT_TYPE_LABEL: Record<AppointmentType, string> = {
  consultation: "Consultation",
  procedure: "Procedure",
  follow_up: "Follow Up",
};

// Labels/colors per the admin spec: Pending=Orange, Confirmed=Green, Rejected=Red, Refunded=Purple.
// "submitted"/"failed" aren't in the spec's 4-item dropdown but are real states the
// system can be in (receipt awaiting review / Stripe failure) — kept visible, not hidden.
const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; badgeClass: string }> = {
  pending: { label: "Pending", badgeClass: "bg-orange-100 text-orange-700" },
  submitted: { label: "Submitted", badgeClass: "bg-amber-100 text-amber-700" },
  verified: { label: "Confirmed", badgeClass: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", badgeClass: "bg-error/10 text-error" },
  failed: { label: "Failed", badgeClass: "bg-error/10 text-error" },
  refunded: { label: "Refunded", badgeClass: "bg-purple-100 text-purple-700" },
};

// The spec's 4-item Payment Status dropdown (Pending/Confirmed/Rejected/Refunded).
const PAYMENT_STATUS_DROPDOWN_OPTIONS: PaymentStatus[] = ["pending", "verified", "rejected", "refunded"];

function getPayment(apt: ApiAppointment): ApiPayment | null {
  return apt.paymentId && typeof apt.paymentId === "object" ? apt.paymentId : null;
}

// Colors per the admin spec: Pending=Yellow, Confirmed=Green, Completed=Blue, Cancelled=Red, No Show=Gray.
const STATUS_META: Record<AppointmentStatus, { label: string; badgeClass: string; dotClass: string }> = {
  pending_payment: { label: "Pending Payment", badgeClass: "bg-amber-100 text-amber-700", dotClass: "bg-amber-400" },
  payment_submitted: { label: "Payment Submitted", badgeClass: "bg-amber-100 text-amber-700", dotClass: "bg-amber-400" },
  payment_verification: { label: "Payment Verification", badgeClass: "bg-amber-100 text-amber-700", dotClass: "bg-amber-400" },
  confirmed: { label: "Confirmed", badgeClass: "bg-green-100 text-green-700", dotClass: "bg-emerald-500" },
  completed: { label: "Completed", badgeClass: "bg-blue-100 text-blue-700", dotClass: "bg-blue-500" },
  cancelled: { label: "Cancelled", badgeClass: "bg-error/10 text-error", dotClass: "bg-error" },
  rejected: { label: "Rejected", badgeClass: "bg-error/10 text-error", dotClass: "bg-error" },
  rescheduled: { label: "Rescheduled", badgeClass: "bg-primary/10 text-primary", dotClass: "bg-primary" },
  no_show: { label: "No Show", badgeClass: "bg-gray-100 text-gray-700", dotClass: "bg-gray-400" },
};

// The spec's 5-item Appointment Status dropdown (Pending/Confirmed/Completed/Cancelled/No Show).
const APPOINTMENT_STATUS_DROPDOWN_OPTIONS: AppointmentStatus[] = [
  "pending_payment",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

function isImageUrl(url: string): boolean {
  return !/\.pdf($|\?)/i.test(url);
}

const FILTER_TABS: (AppointmentStatus | "All")[] = [
  "All",
  "pending_payment",
  "payment_verification",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
];

const PAGE_SIZE = 5;

function clinicName(clinicId: ApiAppointment["clinicId"]): string {
  return typeof clinicId === "string" ? clinicId : clinicId?.name ?? "—";
}

export default function AppointmentsContent() {
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [clinics, setClinics] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AppointmentStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [visitTypeFilter, setVisitTypeFilter] = useState("All");
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState<AppointmentType | "All">("All");
  const [clinicFilter, setClinicFilter] = useState("All");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<AppointmentStatus>("confirmed");
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus | null>(null);
  const [confirmingPaymentChange, setConfirmingPaymentChange] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadAppointments = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (res.ok) setAppointments(data.appointments ?? []);
      else if (!silent) toast.error(data.error ?? "Could not load appointments");
    } catch {
      if (!silent) toast.error("Network error loading appointments");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadAppointments();
      try {
        const res = await fetch("/api/clinics");
        const data = await res.json();
        if (res.ok) setClinics(data.clinics ?? []);
      } catch {
        // Clinic filter just won't populate — not fatal.
      }
    })();
    // Polls so appointments created/paid elsewhere show up without a manual refresh.
    const interval = setInterval(() => loadAppointments(true), 20000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const matchTab = tab === "All" || a.status === tab;
      const matchSearch =
        !search ||
        a.patientSnapshot.fullName.toLowerCase().includes(search.toLowerCase()) ||
        a.appointmentNumber.toLowerCase().includes(search.toLowerCase()) ||
        a.patientSnapshot.phone.includes(search);
      const matchType = visitTypeFilter === "All" || a.visitType === visitTypeFilter;
      const matchAppointmentType =
        appointmentTypeFilter === "All" || (a.appointmentType ?? "consultation") === appointmentTypeFilter;
      const aClinicId = typeof a.clinicId === "string" ? a.clinicId : a.clinicId?._id;
      const matchClinic = clinicFilter === "All" || aClinicId === clinicFilter;
      const matchDateFrom = !dateFrom || a.date >= dateFrom;
      const matchDateTo = !dateTo || a.date <= dateTo;
      const payment = getPayment(a);
      const matchPaymentType = paymentTypeFilter === "All" || payment?.method === paymentTypeFilter;
      const matchPaymentStatus = paymentStatusFilter === "All" || payment?.status === paymentStatusFilter;
      return (
        matchTab && matchSearch && matchType && matchAppointmentType && matchClinic && matchDateFrom && matchDateTo &&
        matchPaymentType && matchPaymentStatus
      );
    });
  }, [appointments, tab, search, visitTypeFilter, appointmentTypeFilter, clinicFilter, dateFrom, dateTo, paymentTypeFilter, paymentStatusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(() => {
    const base: Record<string, number> = { All: appointments.length };
    for (const s of FILTER_TABS) {
      if (s === "All") continue;
      base[s] = appointments.filter((a) => a.status === s).length;
    }
    return base;
  }, [appointments]);

  async function changeStatus(id: string, status: AppointmentStatus, opts?: { silent?: boolean }): Promise<boolean> {
    setBusy(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update appointment");
        return false;
      }
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
      if (!opts?.silent) toast.success("Appointment updated");
      return true;
    } catch {
      toast.error("Network error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  // Routes a Payment Status change through the endpoint that matches the
  // business rule for that method: manual receipts (JazzCash/Easypaisa)
  // approve/reject via /verify (which also cascades the appointment status);
  // Stripe refunds always go through /refund; everything else (including a
  // manual admin override on a Stripe payment, or resetting to "pending") is
  // a plain status set via /status, which never touches the appointment.
  async function savePaymentStatus(payment: ApiPayment, newStatus: PaymentStatus, opts?: { silent?: boolean }): Promise<boolean> {
    try {
      let res: Response;
      if (newStatus === "refunded") {
        res = await fetch(`/api/payments/${payment._id}/refund`, { method: "POST" });
      } else if (payment.method !== "stripe" && newStatus === "verified") {
        res = await fetch(`/api/payments/${payment._id}/verify`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approve: true }),
        });
      } else if (payment.method !== "stripe" && newStatus === "rejected") {
        res = await fetch(`/api/payments/${payment._id}/verify`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approve: false }),
        });
      } else {
        res = await fetch(`/api/payments/${payment._id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update payment status");
        return false;
      }
      if (!opts?.silent) toast.success("Payment status updated");
      return true;
    } catch {
      toast.error("Network error");
      return false;
    }
  }

  function openDetails(apt: ApiAppointment) {
    setEditId(apt._id);
    setEditStatus(apt.status);
    setEditPaymentStatus(getPayment(apt)?.status ?? null);
    setConfirmingPaymentChange(false);
  }

  async function handleSaveDetails() {
    if (!editId) return;
    const apt = appointments.find((a) => a._id === editId);
    if (!apt) return;
    const payment = getPayment(apt);

    const paymentChanged = !!payment && editPaymentStatus !== null && editPaymentStatus !== payment.status;
    const appointmentChanged = editStatus !== apt.status;

    if (!paymentChanged && !appointmentChanged) {
      setEditId(null);
      return;
    }

    // Payment status changes require an explicit confirmation step first.
    if (paymentChanged && !confirmingPaymentChange) {
      setConfirmingPaymentChange(true);
      return;
    }

    setBusy(true);
    try {
      let ok = true;
      if (paymentChanged && payment) {
        ok = await savePaymentStatus(payment, editPaymentStatus!, { silent: true });
      }
      if (ok && appointmentChanged) {
        ok = await changeStatus(editId, editStatus, { silent: true });
      }
      if (ok) {
        toast.success("Changes saved successfully");
        setEditId(null);
        setConfirmingPaymentChange(false);
        await loadAppointments(true);
      }
    } finally {
      setBusy(false);
    }
  }

  async function cancelAppointment(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not cancel appointment");
        return;
      }
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status: "cancelled" } : a)));
      setCancelId(null);
      toast.success("Appointment cancelled");
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  const exportCSV = () => {
    const rows = [
      ["Appointment #", "Patient", "Phone", "Date", "Time", "Clinic", "Visit Type", "Appointment Type", "Payment Type", "Payment Status", "Status", "Fee (Rs.)"],
      ...filtered.map((a) => {
        const payment = getPayment(a);
        return [
          a.appointmentNumber,
          a.patientSnapshot.fullName,
          a.patientSnapshot.phone,
          a.date,
          a.time,
          clinicName(a.clinicId),
          a.visitType,
          APPOINTMENT_TYPE_LABEL[a.appointmentType ?? "consultation"],
          payment ? PAYMENT_METHOD_LABEL[payment.method] : "",
          payment ? PAYMENT_STATUS_META[payment.status].label : "",
          STATUS_META[a.status].label,
          a.feeSnapshotPkr,
        ];
      }),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "appointments.csv";
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Appointments", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["Appointment #", "Patient", "Phone", "Date", "Time", "Clinic", "Visit Type", "Appointment Type", "Payment Type", "Payment Status", "Status", "Fee (Rs.)"]],
      body: filtered.map((a) => {
        const payment = getPayment(a);
        return [
          a.appointmentNumber,
          a.patientSnapshot.fullName,
          a.patientSnapshot.phone,
          a.date,
          a.time,
          clinicName(a.clinicId),
          a.visitType,
          APPOINTMENT_TYPE_LABEL[a.appointmentType ?? "consultation"],
          payment ? PAYMENT_METHOD_LABEL[payment.method] : "—",
          payment ? PAYMENT_STATUS_META[payment.status].label : "—",
          STATUS_META[a.status].label,
          a.feeSnapshotPkr.toLocaleString(),
        ];
      }),
      styles: { fontSize: 8 },
    });
    doc.save("appointments.pdf");
    setExportMenuOpen(false);
  };

  const handleTabChange = (t: typeof tab) => { setTab(t); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleTypeFilter = (v: string) => { setVisitTypeFilter(v); setPage(1); };

  return (
    <div className="px-gutter py-lg max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Appointments Management</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {counts.All} total · {counts.payment_verification ?? 0} awaiting verification · {counts.confirmed ?? 0} confirmed
          </p>
        </div>
        <div className="flex gap-sm">
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen((v) => !v)}
              className="flex items-center gap-xs px-md py-xs rounded-xl border border-outline-variant text-on-surface-variant font-semibold hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">download</span> Export
            </button>
            {exportMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportMenuOpen(false)} />
                <div className="absolute right-0 mt-xs w-44 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={exportPDF}
                    className="w-full flex items-center gap-xs px-md py-sm text-left text-body-md text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Download as PDF
                  </button>
                  <button
                    onClick={exportCSV}
                    className="w-full flex items-center gap-xs px-md py-sm text-left text-body-md text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">table_view</span> Download as CSV
                  </button>
                </div>
              </>
            )}
          </div>
          <Link
            href="/admin/appointments/verify"
            className="flex items-center gap-xs px-md py-xs rounded-xl bg-primary text-on-primary font-semibold hover:shadow-lg transition-all"
          >
            <span className="material-symbols-outlined">qr_code_scanner</span> Verify
          </Link>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-md mb-xl shadow-sm border border-outline-variant/30 flex flex-wrap items-center justify-between gap-md">
      
        <div className="flex items-center gap-md flex-wrap">
           {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search patient, ID, phone…"
            className="pl-10 pr-sm py-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-64"
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

   {/* Date range */}
          <div className="flex items-center gap-xs">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="px-sm py-xs bg-surface-container-low border-none rounded-xl text-label-md font-medium focus:ring-primary/20"
            />
            <span className="text-on-surface-variant text-label-md">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="px-sm py-xs bg-surface-container-low border-none rounded-xl text-label-md font-medium focus:ring-primary/20"
            />
          </div>

          {/* Visit type select */}
          <select
            value={visitTypeFilter}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="bg-surface-container-low border-none rounded-xl pl-md pr-10 py-xs text-label-md font-medium focus:ring-primary/20 cursor-pointer"
          >
            {["All", "clinic", "online"].map((o) => (
              <option key={o} value={o}>{o === "All" ? "All Visit Types" : o === "clinic" ? "In-Clinic" : "Online"}</option>
            ))}
          </select>

          {/* Appointment type select */}
          <select
            value={appointmentTypeFilter}
            onChange={(e) => { setAppointmentTypeFilter(e.target.value as AppointmentType | "All"); setPage(1); }}
            className="bg-surface-container-low border-none rounded-xl pl-md pr-10 py-xs text-label-md font-medium focus:ring-primary/20 cursor-pointer"
          >
            <option value="All">All Appointment Types</option>
            <option value="consultation">Consultation</option>
            <option value="procedure">Procedure</option>
            <option value="follow_up">Follow Up</option>
          </select>

          {/* Payment type select */}
          <select
            value={paymentTypeFilter}
            onChange={(e) => { setPaymentTypeFilter(e.target.value); setPage(1); }}
            className="bg-surface-container-low border-none rounded-xl pl-md pr-10 py-xs text-label-md font-medium focus:ring-primary/20 cursor-pointer"
          >
            <option value="All">All Payment Types</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{PAYMENT_METHOD_LABEL[m]}</option>
            ))}
          </select>

          {/* Payment status select */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(1); }}
            className="bg-surface-container-low border-none rounded-xl pl-md pr-10 py-xs text-label-md font-medium focus:ring-primary/20 cursor-pointer"
          >
            <option value="All">All Payment Statuses</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{PAYMENT_STATUS_META[s].label}</option>
            ))}
          </select>

          {/* Clinic select */}
          <select
            value={clinicFilter}
            onChange={(e) => { setClinicFilter(e.target.value); setPage(1); }}
            className="bg-surface-container-low border-none rounded-xl pl-md pr-10 py-xs text-label-md font-medium focus:ring-primary/20 cursor-pointer"
          >
            <option value="All">All Clinics</option>
            {clinics.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

       
        </div>

      
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                {["Patient", "Appointment ID", "Phone", "Date & Time", "Clinic", "Visit Type", "Appointment Type", "Payment Type", "Payment Status", "Status", "Fee", "Actions"].map((h, i, arr) => (
                  <th
                    key={h}
                    className={`px-md py-md text-label-md text-on-surface-variant ${i === arr.length - 1 ? "text-right" : ""} ${h === "Clinic" ? "w-45" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-md py-xl text-center text-on-surface-variant">
                    Loading appointments…
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-md py-xl text-center text-on-surface-variant">
                    No appointments match your filters.
                  </td>
                </tr>
              ) : (
                pageItems.map((apt) => {
                  const meta = STATUS_META[apt.status];
                  const payment = getPayment(apt);
                  const initials = apt.patientSnapshot.fullName
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const canCancel = apt.status !== "cancelled" && apt.status !== "completed" && apt.status !== "rejected";

                  return (
                    <tr key={apt._id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-md py-md whitespace-nowrap">
                        <div className="flex items-center gap-sm">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-body-md font-semibold truncate max-w-40">{apt.patientSnapshot.fullName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-md py-md whitespace-nowrap text-body-md text-on-surface-variant">
                        {apt.appointmentNumber}
                      </td>
                      <td className="px-md py-md whitespace-nowrap text-body-md text-on-surface-variant">
                        {apt.patientSnapshot.phone}
                      </td>
                      <td className="px-md py-md whitespace-nowrap">
                        <p className="text-body-md font-medium">{apt.date}</p>
                        <p className="text-caption text-on-surface-variant">{apt.time}</p>
                      </td>
                      <td className="px-md py-md whitespace-nowrap w-45">
                        <p className="text-body-md text-on-surface-variant max-w-45 truncate" title={clinicName(apt.clinicId)}>
                          {clinicName(apt.clinicId)}
                        </p>
                      </td>
                      <td className="px-md py-md whitespace-nowrap">
                        <span className="px-sm py-xs rounded-full bg-surface-container text-caption font-bold border border-outline-variant/30 capitalize">
                          {apt.visitType}
                        </span>
                      </td>
                      <td className="px-md py-md whitespace-nowrap">
                        <span className="px-sm py-xs rounded-full bg-primary/10 text-primary text-caption font-bold">
                          {APPOINTMENT_TYPE_LABEL[apt.appointmentType ?? "consultation"]}
                        </span>
                      </td>
                      <td className="px-md py-md text-body-md text-on-surface-variant whitespace-nowrap">
                        {payment ? PAYMENT_METHOD_LABEL[payment.method] : "—"}
                      </td>
                      <td className="px-md py-md whitespace-nowrap">
                        {payment ? (
                          <span className={`px-sm py-[2px] rounded-full ${PAYMENT_STATUS_META[payment.status].badgeClass} text-caption font-bold`}>
                            {PAYMENT_STATUS_META[payment.status].label}
                          </span>
                        ) : (
                          <span className="text-caption text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="px-md py-md whitespace-nowrap">
                        <div className="flex items-center gap-xs">
                          <div className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
                          <span className={`px-sm py-[2px] rounded-full ${meta.badgeClass} text-caption font-bold`}>
                            {meta.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-md py-md text-body-md font-semibold text-primary whitespace-nowrap">
                        Rs. {apt.feeSnapshotPkr.toLocaleString()}
                      </td>
                      <td className="px-md py-md text-right sticky right-0 bg-surface-container-lowest group-hover:bg-surface-container-low transition-colors">
                        <div className="flex items-center justify-end gap-xs">
                          {(apt.status === "pending_payment" || apt.status === "payment_verification") && (
                            <button
                              disabled={busy}
                              onClick={() => changeStatus(apt._id, "confirmed")}
                              className="p-xs rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                              title="Confirm"
                            >
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            </button>
                          )}
                          {apt.status === "confirmed" && (
                            <button
                              disabled={busy}
                              onClick={() => changeStatus(apt._id, "completed")}
                              className="p-xs rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors"
                              title="Mark Completed"
                            >
                              <span className="material-symbols-outlined text-[18px]">task_alt</span>
                            </button>
                          )}
                          <button
                            onClick={() => openDetails(apt)}
                            className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
                            title="View Receipt"
                          >
                            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                          </button>
                          {canCancel && (
                            <button
                              onClick={() => setCancelId(apt._id)}
                              className="p-xs rounded-lg border border-error/20 text-error hover:bg-error/10 transition-colors"
                              title="Cancel"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-md py-sm border-t border-outline-variant/20 flex items-center justify-between">
          <p className="text-caption text-on-surface-variant">
            Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-sm py-xs rounded-lg text-caption font-bold ${
                  page === p ? "bg-primary text-on-primary" : "hover:bg-surface-container-high"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cancel confirm modal */}
      {cancelId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-lg shadow-2xl max-w-sm w-full mx-md">
            <h3 className="text-headline-md font-bold text-on-surface mb-sm">Cancel Appointment?</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">
              This will cancel appointment {appointments.find((a) => a._id === cancelId)?.appointmentNumber}. This action cannot be undone.
            </p>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => setCancelId(null)}
                className="px-md py-xs rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-high"
              >
                Keep Appointment
              </button>
              <button
                disabled={busy}
                onClick={() => cancelAppointment(cancelId)}
                className="px-md py-xs rounded-xl bg-error text-on-error font-semibold hover:opacity-90"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details modal */}
      {editId && (() => {
        const detailApt = appointments.find((a) => a._id === editId);
        if (!detailApt) return null;
        const detailPayment = getPayment(detailApt);

        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-md">
            <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full mx-md max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/30 sticky top-0 bg-surface z-10">
                <div>
                  <h3 className="text-headline-md font-bold text-on-surface">Appointment Details</h3>
                  <p className="text-caption text-on-surface-variant">{detailApt.appointmentNumber}</p>
                </div>
                <button
                  onClick={() => setEditId(null)}
                  className="p-xs rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-lg space-y-lg">
                {/* Patient Information */}
                <section>
                  <h4 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wide mb-sm">Patient Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
                    {[
                      ["Full Name", detailApt.patientSnapshot.fullName],
                      ["Phone Number", detailApt.patientSnapshot.phone],
                      ["Email", detailApt.patientSnapshot.email || "—"],
                    ].map(([label, value]) => (
                      <div key={label} className="p-sm bg-surface-container-low rounded-lg">
                        <p className="text-caption text-outline uppercase tracking-tight mb-[2px]">{label}</p>
                        <p className="font-bold text-on-surface text-body-md break-words">{value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Appointment Information */}
                <section>
                  <h4 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wide mb-sm">Appointment Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
                    {[
                      ["Appointment ID", detailApt.appointmentNumber],
                      ["Type", APPOINTMENT_TYPE_LABEL[detailApt.appointmentType ?? "consultation"]],
                      ["Doctor", doctor.name],
                      ...(detailApt.procedureNameSnapshot ? [["Procedure", detailApt.procedureNameSnapshot]] : []),
                      ["Clinic", clinicName(detailApt.clinicId)],
                      ["Date", detailApt.date],
                      ["Time", detailApt.time],
                      ...(detailApt.durationMinutes ? [["Duration", `${detailApt.durationMinutes} min`]] : []),
                      ["Reason for Visit", detailApt.reason || "—"],
                      ...(detailApt.patientSnapshot.notes ? [["Notes", detailApt.patientSnapshot.notes]] : []),
                      ...(detailApt.referralDoctor ? [["Referral Doctor", detailApt.referralDoctor]] : []),
                    ].map(([label, value]) => (
                      <div key={label} className="p-sm bg-surface-container-low rounded-lg">
                        <p className="text-caption text-outline uppercase tracking-tight mb-[2px]">{label}</p>
                        <p className="font-bold text-on-surface text-body-md break-words">{value}</p>
                      </div>
                    ))}
                  </div>
                  {detailApt.medicalReportUrl && (
                    <a
                      href={detailApt.medicalReportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-xs mt-sm text-label-md font-semibold text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-[18px]">description</span>
                      View Medical Report
                    </a>
                  )}
                </section>

                {/* Payment Information + Receipt Viewer */}
                <section>
                  <h4 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wide mb-sm">Payment Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm mb-md">
                    <div className="p-sm bg-surface-container-low rounded-lg">
                      <p className="text-caption text-outline uppercase tracking-tight mb-[2px]">Payment Type</p>
                      <p className="font-bold text-on-surface text-body-md">{detailPayment ? PAYMENT_METHOD_LABEL[detailPayment.method] : "—"}</p>
                    </div>
                    <div className="p-sm bg-surface-container-low rounded-lg">
                      <p className="text-caption text-outline uppercase tracking-tight mb-[2px]">Payment Status</p>
                      <p className="font-bold text-on-surface text-body-md">{detailPayment ? PAYMENT_STATUS_META[detailPayment.status].label : "—"}</p>
                    </div>
                    <div className="p-sm bg-surface-container-low rounded-lg">
                      <p className="text-caption text-outline uppercase tracking-tight mb-[2px]">Amount</p>
                      <p className="font-bold text-primary text-body-md">Rs. {detailApt.feeSnapshotPkr.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Receipt */}
                  {detailPayment?.receiptUrl ? (
                    <div className="space-y-sm">
                      {isImageUrl(detailPayment.receiptUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={detailPayment.receiptUrl}
                          alt="Payment receipt"
                          className="w-full max-h-80 object-contain bg-surface-container rounded-xl border border-outline-variant"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-40 bg-surface-container rounded-xl border border-outline-variant">
                          <span className="material-symbols-outlined text-primary text-[40px]">picture_as_pdf</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-caption text-on-surface-variant">
                        <span>
                          Uploaded {detailPayment.receiptUploadedAt ? new Date(detailPayment.receiptUploadedAt).toLocaleString() : "—"}
                        </span>
                        <a
                          href={detailPayment.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-semibold hover:underline flex items-center gap-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                          Open Full Size
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-24 bg-surface-container-low rounded-xl border border-dashed border-outline-variant text-on-surface-variant text-body-md">
                      No Receipt Uploaded
                    </div>
                  )}
                </section>

                {/* Admin Actions */}
                <section>
                  <h4 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wide mb-sm">Admin Actions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-xs">Payment Status</label>
                      <select
                        value={editPaymentStatus ?? ""}
                        disabled={!detailPayment}
                        onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-sm px-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md disabled:opacity-60"
                      >
                        {!detailPayment && <option value="">No payment yet</option>}
                        {PAYMENT_STATUS_DROPDOWN_OPTIONS.map((s) => (
                          <option key={s} value={s}>{PAYMENT_STATUS_META[s].label}</option>
                        ))}
                        {/* Keep the current value selectable even if it's outside the 4 primary options (e.g. "submitted"/"failed"). */}
                        {detailPayment && !PAYMENT_STATUS_DROPDOWN_OPTIONS.includes(detailPayment.status) && (
                          <option value={detailPayment.status}>{PAYMENT_STATUS_META[detailPayment.status].label}</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-xs">Appointment Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as AppointmentStatus)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-sm px-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md"
                      >
                        {APPOINTMENT_STATUS_DROPDOWN_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_META[s].label}</option>
                        ))}
                        {!APPOINTMENT_STATUS_DROPDOWN_OPTIONS.includes(detailApt.status) && (
                          <option value={detailApt.status}>{STATUS_META[detailApt.status].label}</option>
                        )}
                      </select>
                    </div>
                  </div>
                </section>

                {/* Confirmation step for payment status change */}
                {confirmingPaymentChange && detailPayment && (
                  <div className="p-md bg-warning/10 border border-warning/30 rounded-xl space-y-sm">
                    <p className="text-body-md text-on-surface font-semibold">
                      Change payment status to &ldquo;{PAYMENT_STATUS_META[editPaymentStatus ?? detailPayment.status].label}&rdquo;?
                    </p>
                    <p className="text-caption text-on-surface-variant">This may also update the appointment status depending on the payment method.</p>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="px-lg py-md border-t border-outline-variant/20 flex gap-sm sticky bottom-0 bg-surface">
                <button
                  onClick={() => { setEditId(null); setConfirmingPaymentChange(false); }}
                  className="flex-1 px-md py-sm rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  disabled={busy}
                  onClick={handleSaveDetails}
                  className="flex-1 px-md py-sm rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-xs"
                >
                  {busy ? (
                    <><span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> Saving…</>
                  ) : confirmingPaymentChange ? (
                    "Confirm & Save"
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
