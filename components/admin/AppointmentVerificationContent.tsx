"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { AppointmentStatus, VisitType } from "@/types/appointment";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";

interface ApiPayment {
  method: PaymentMethod;
  status: PaymentStatus;
}

interface ApiAppointment {
  _id: string;
  appointmentNumber: string;
  clinicId: { _id: string; name: string } | string;
  visitType: VisitType;
  date: string;
  time: string;
  patientSnapshot: { fullName: string; phone: string };
  paymentId?: ApiPayment | string;
  status: AppointmentStatus;
}

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

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  pending_payment: "bg-amber-100 text-amber-700",
  payment_submitted: "bg-amber-100 text-amber-700",
  payment_verification: "bg-amber-100 text-amber-700",
  confirmed: "bg-primary-container text-on-primary-container",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-error/10 text-error",
  rejected: "bg-error/10 text-error",
  rescheduled: "bg-primary/10 text-primary",
  no_show: "bg-gray-100 text-gray-700",
};

const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; badgeClass: string; icon: string }> = {
  pending: { label: "Pending", badgeClass: "bg-surface-container-high text-on-surface-variant", icon: "pending" },
  submitted: { label: "Under Review", badgeClass: "bg-amber-100 text-amber-700", icon: "hourglass_top" },
  verified: { label: "Paid", badgeClass: "bg-green-100 text-green-700", icon: "check_circle" },
  rejected: { label: "Rejected", badgeClass: "bg-error/10 text-error", icon: "cancel" },
  failed: { label: "Failed", badgeClass: "bg-error/10 text-error", icon: "error" },
  refunded: { label: "Refunded", badgeClass: "bg-purple-100 text-purple-700", icon: "undo" },
};

const PAGE_SIZE = 5;

function clinicName(clinicId: ApiAppointment["clinicId"]): string {
  return typeof clinicId === "string" ? clinicId : clinicId?.name ?? "—";
}

function getPayment(apt: ApiAppointment): ApiPayment | null {
  return apt.paymentId && typeof apt.paymentId === "object" ? apt.paymentId : null;
}

function initialsOf(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function AppointmentVerificationContent() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/appointments");
        const data = await res.json();
        if (res.ok) setAppointments(data.appointments ?? []);
      } catch {
        // List simply stays empty if this fails.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = !term
      ? appointments
      : appointments.filter(
          (a) =>
            a.appointmentNumber.toLowerCase().includes(term) ||
            a.patientSnapshot.fullName.toLowerCase().includes(term) ||
            a.patientSnapshot.phone.includes(term)
        );
    return [...list].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  }, [appointments, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function runSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  function goToDetails(id: string) {
    router.push(`/admin/appointments/verify/${id}`);
  }

  return (
    <div className="px-gutter py-lg max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-lg">
        <h2 className="text-headline-lg font-bold text-primary mb-xs">Appointment Verification</h2>
        <p className="text-body-md text-on-surface-variant">Verify patient identity and clinical appointments instantly.</p>
      </div>

      {/* Search Area */}
      <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant mb-lg">
        <div className="flex flex-col md:flex-row gap-md">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline pointer-events-none">
              search
            </span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Appointment ID, Patient Name, or Phone…"
              className="w-full pl-12 pr-md py-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-body-md"
            />
          </div>
          <button
            onClick={runSearch}
            className="px-lg bg-primary text-on-primary text-label-md rounded-lg flex items-center justify-center gap-xs hover:brightness-110 transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined">manage_search</span>
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm">
        <div className="flex flex-col gap-xs p-sm">
          {loading ? (
            <p className="text-center text-body-md text-on-surface-variant py-xl">Loading appointments…</p>
          ) : pageItems.length === 0 ? (
            <p className="text-center text-body-md text-on-surface-variant py-xl">
              No appointments matched that search.
            </p>
          ) : (
            pageItems.map((apt) => {
              const payment = getPayment(apt);
              const paymentMeta = payment ? PAYMENT_STATUS_META[payment.status] : null;
              return (
                <div
                  key={apt._id}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-sm shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-sm"
                >
                  {/* Identity */}
                  <div className="flex items-center gap-xs flex-1 w-full md:w-auto">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-caption">
                      {initialsOf(apt.patientSnapshot.fullName)}
                    </div>
                    <div>
                      <h3 className="text-label-md font-bold text-on-surface leading-tight">{apt.patientSnapshot.fullName}</h3>
                      <p className="text-caption text-outline leading-tight">ID: {apt.appointmentNumber}</p>
                      <p className="text-caption text-outline leading-tight">{apt.patientSnapshot.phone}</p>
                    </div>
                  </div>

                  {/* Schedule / location */}
                  <div className="flex flex-col gap-0.5 flex-[2] w-full md:w-auto md:border-l border-outline-variant/30 md:pl-md">
                    <div className="flex items-center gap-xs text-on-surface">
                      <span className="material-symbols-outlined text-primary text-[16px]">calendar_today</span>
                      <span className="text-caption font-medium">{apt.date} • {apt.time}</span>
                    </div>
                    <div className="flex items-center gap-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">
                        {apt.visitType === "online" ? "videocam" : "location_on"}
                      </span>
                      <span className="text-caption">
                        {apt.visitType === "online" ? "Remote Consultation" : clinicName(apt.clinicId)}
                      </span>
                    </div>
                  </div>

                  {/* Status + actions */}
                  <div className="flex flex-col items-end gap-xs shrink-0 w-full md:w-auto">
                    <div className="flex gap-xs flex-wrap justify-end">
                      {paymentMeta && (
                        <span className={`inline-flex items-center gap-1 px-xs py-0.5 rounded-full text-caption font-bold ${paymentMeta.badgeClass}`}>
                          <span className="material-symbols-outlined text-caption">{paymentMeta.icon}</span>
                          {paymentMeta.label}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-xs py-0.5 rounded-full text-caption font-bold ${STATUS_BADGE[apt.status]}`}>
                        {STATUS_LABEL[apt.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-xs">
                      <button
                        onClick={() => goToDetails(apt._id)}
                        className="px-md py-1 bg-primary text-on-primary text-caption font-semibold rounded-lg hover:brightness-110 transition-all shadow-sm active:scale-95"
                      >
                        Verify Appointment
                      </button>
                      <button
                        onClick={() => goToDetails(apt._id)}
                        title="View Details"
                        className="p-1 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-body-lg">visibility</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filtered.length > 0 && (
          <div className="bg-surface-container-low px-md py-sm flex items-center justify-between border-t border-outline-variant rounded-b-xl">
            <p className="text-caption text-on-surface-variant">
              Showing {pageItems.length} of {filtered.length} results
            </p>
            <div className="flex items-center gap-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-xs hover:bg-surface-container-highest rounded-lg transition-colors text-on-surface-variant disabled:opacity-50"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-caption font-label-md transition-colors ${
                    p === page ? "bg-primary text-on-primary" : "hover:bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-xs hover:bg-surface-container-highest rounded-lg transition-colors text-on-surface-variant disabled:opacity-50"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
