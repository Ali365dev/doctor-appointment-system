"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type { AppointmentStatus, VisitType } from "@/types/appointment";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";
import {
  toPatientAppointmentStatus,
  toPatientPaymentStatus,
  APPOINTMENT_STATUS_BADGE,
  PAYMENT_STATUS_BADGE,
  PAYMENT_METHOD_LABEL,
} from "@/lib/appointmentDisplay";
import { doctor } from "@/lib/data";

interface ApiPayment {
  _id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amountPkr: number;
  transactionRef?: string;
  receiptUrl?: string;
  stripePaymentIntentId?: string;
  rejectionReason?: string;
}

interface ApiAppointment {
  _id: string;
  appointmentNumber: string;
  clinicId: { _id: string; name: string; address?: string } | string;
  visitType: VisitType;
  date: string;
  time: string;
  reason?: string;
  patientSnapshot: {
    fullName: string;
    phone: string;
    age: number;
    gender: string;
    city: string;
    notes?: string;
  };
  feeSnapshotPkr: number;
  paymentId?: ApiPayment | string;
  status: AppointmentStatus;
  createdAt: string;
}

function clinicName(clinicId: ApiAppointment["clinicId"]): string {
  return typeof clinicId === "string" ? clinicId : clinicId?.name ?? "—";
}

function clinicAddress(clinicId: ApiAppointment["clinicId"]): string | undefined {
  return typeof clinicId === "string" ? undefined : clinicId?.address;
}

function getPayment(apt: ApiAppointment): ApiPayment | null {
  return apt.paymentId && typeof apt.paymentId === "object" ? apt.paymentId : null;
}

function printSlip(apt: ApiAppointment, payment: ApiPayment | null) {
  const win = window.open("", "_blank", "width=480,height=640");
  if (!win) return;
  const rows = [
    ["Appointment #", apt.appointmentNumber],
    ["Patient", apt.patientSnapshot.fullName],
    ["Doctor", doctor.name],
    ["Clinic", clinicName(apt.clinicId)],
    ["Date", apt.date],
    ["Time", apt.time],
    ["Visit Type", apt.visitType === "online" ? "Online" : "In-Clinic"],
    ["Fee", `Rs. ${apt.feeSnapshotPkr.toLocaleString()}`],
    ["Payment Type", payment ? PAYMENT_METHOD_LABEL[payment.method] : "—"],
    ["Appointment Status", toPatientAppointmentStatus(apt.status)],
  ];
  win.document.write(`
    <html>
      <head><title>Appointment Slip — ${apt.appointmentNumber}</title></head>
      <body style="font-family: sans-serif; padding: 24px;">
        <h2>Appointment Slip</h2>
        <table style="border-collapse: collapse; width: 100%;">
          ${rows
            .map(
              ([label, value]) =>
                `<tr><td style="padding:6px 12px 6px 0;color:#555;">${label}</td><td style="padding:6px 0;font-weight:bold;">${value}</td></tr>`
            )
            .join("")}
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

type Props = { limit?: number; showSearch?: boolean };

export default function AppointmentTable({ limit, showSearch = false }: Props) {
  const router = useRouter();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | AppointmentStatus>("all");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (res.ok) setAppointments(data.appointments ?? []);
      else toast.error(data.error ?? "Could not load appointments");
    } catch {
      toast.error("Network error loading appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadAppointments();
    })();
    // Lightweight polling so payment/admin updates made elsewhere (Stripe
    // redirect, admin approval) show up here without a manual refresh.
    const interval = setInterval(loadAppointments, 20000);
    return () => clearInterval(interval);
  }, [loadAppointments]);

  const filtered = appointments
    .filter((a) => filter === "all" || a.status === filter)
    .filter(
      (a) =>
        !search ||
        clinicName(a.clinicId).toLowerCase().includes(search.toLowerCase()) ||
        a.date.toLowerCase().includes(search.toLowerCase()) ||
        a.appointmentNumber.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, limit);

  async function confirmCancel() {
    if (!cancelId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/appointments/${cancelId}/cancel`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not cancel appointment");
        return;
      }
      setAppointments((prev) => prev.map((a) => (a._id === cancelId ? { ...a, status: "cancelled" } : a)));
      setCancelId(null);
      toast.success("Appointment cancelled");
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function retryStripePayment(apt: ApiAppointment) {
    setBusy(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: apt.feeSnapshotPkr,
          description: `Consultation – ${clinicName(apt.clinicId)} · ${apt.date}`,
          appointmentId: apt._id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Could not start payment. Try again.");
        return;
      }
      window.open(data.url, "_self");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const detail = appointments.find((a) => a._id === detailId);
  const detailPayment = detail ? getPayment(detail) : null;

  const filterOptions: { value: "all" | AppointmentStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-md">
      {showSearch && (
        <div className="flex flex-col sm:flex-row gap-sm">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search appointments..."
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-sm pl-10 pr-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md"
            />
          </div>
          <div className="flex gap-xs flex-wrap">
            {filterOptions.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-md py-xs rounded-full text-label-md transition-all ${
                  filter === f.value
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="px-md py-sm text-label-md text-on-surface-variant whitespace-nowrap">Date &amp; Time</th>
                <th className="px-md py-sm text-label-md text-on-surface-variant whitespace-nowrap">Doctor</th>
                <th className="px-md py-sm text-label-md text-on-surface-variant">Clinic</th>
                <th className="px-md py-sm text-label-md text-on-surface-variant whitespace-nowrap">Payment Type</th>
                <th className="px-md py-sm text-label-md text-on-surface-variant whitespace-nowrap">Payment Status</th>
                <th className="px-md py-sm text-label-md text-on-surface-variant whitespace-nowrap">Appointment Status</th>
                <th className="px-md py-sm text-label-md text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-body-md">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                    Loading appointments…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => {
                  const patientStatus = toPatientAppointmentStatus(appt.status);
                  const payment = getPayment(appt);
                  const paymentStatus = payment ? toPatientPaymentStatus(payment.status) : "Pending";
                  const canCancel = patientStatus === "Pending" || patientStatus === "Confirmed";
                  const canRetryStripe = payment?.method === "stripe" && payment.status === "failed";
                  const canReupload =
                    payment &&
                    (payment.method === "jazzcash" || payment.method === "easypaisa") &&
                    payment.status === "rejected";

                  return (
                    <tr key={appt._id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-md py-md">
                        <div className="font-bold">{appt.date}</div>
                        <div className="text-caption text-on-surface-variant">{appt.time}</div>
                      </td>
                      <td className="px-md py-md text-on-surface whitespace-nowrap">{doctor.name}</td>
                      <td className="px-md py-md text-on-surface">{clinicName(appt.clinicId)}</td>
                      <td className="px-md py-md text-on-surface whitespace-nowrap">
                        {payment ? PAYMENT_METHOD_LABEL[payment.method] : "—"}
                      </td>
                      <td className="px-md py-md">
                        <span className={`text-[12px] font-bold px-sm py-1 rounded-full ${PAYMENT_STATUS_BADGE[paymentStatus]}`}>
                          {paymentStatus}
                        </span>
                      </td>
                      <td className="px-md py-md">
                        <span className={`text-[12px] font-bold px-sm py-1 rounded-full ${APPOINTMENT_STATUS_BADGE[patientStatus]}`}>
                          {patientStatus}
                        </span>
                      </td>
                      <td className="px-md py-md text-right">
                        <div className="flex items-center justify-end gap-xs">
                          <button
                            onClick={() => setDetailId(appt._id)}
                            className="text-primary hover:bg-primary/10 p-xs rounded transition-colors"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          {canRetryStripe && (
                            <button
                              disabled={busy}
                              onClick={() => retryStripePayment(appt)}
                              className="text-primary hover:bg-primary/10 p-xs rounded transition-colors"
                              title="Retry Payment"
                            >
                              <span className="material-symbols-outlined text-[20px]">refresh</span>
                            </button>
                          )}
                          {canReupload && (
                            <button
                              onClick={() => router.push(`/book-appointment/upload-receipt?appointmentId=${appt._id}&method=${payment!.method}`)}
                              className="text-primary hover:bg-primary/10 p-xs rounded transition-colors"
                              title="Upload New Receipt"
                            >
                              <span className="material-symbols-outlined text-[20px]">upload_file</span>
                            </button>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => setCancelId(appt._id)}
                              className="text-error hover:bg-error/10 p-xs rounded transition-colors"
                              title="Cancel"
                            >
                              <span className="material-symbols-outlined text-[20px]">cancel</span>
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
      </div>

      {/* Cancel Confirmation Dialog */}
      {cancelId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-md">
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-xl max-w-sm w-full border border-outline-variant">
            <div className="flex items-center gap-sm mb-md">
              <span className="material-symbols-outlined text-error text-[32px]">warning</span>
              <h3 className="text-headline-md font-bold text-on-surface">Cancel Appointment?</h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-lg">
              This action cannot be undone. Are you sure you want to cancel this appointment?
            </p>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => setCancelId(null)}
                className="px-md py-sm border border-outline-variant rounded-lg text-on-surface font-bold hover:bg-surface-container-low transition-colors"
              >
                Keep Appointment
              </button>
              <button
                disabled={busy}
                onClick={confirmCancel}
                className="px-md py-sm bg-error text-on-error rounded-lg font-bold hover:bg-error/90 transition-colors disabled:opacity-60"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-md"
          onClick={() => setDetailId(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-xl p-lg shadow-xl max-w-lg w-full border border-outline-variant max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-headline-md font-bold text-on-surface">Appointment Details</h3>
              <button
                onClick={() => setDetailId(null)}
                className="text-on-surface-variant hover:text-on-surface p-xs rounded hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-sm text-body-md">
              {[
                ["Appointment #", detail.appointmentNumber],
                ["Booking Date", new Date(detail.createdAt).toLocaleDateString()],
                ["Doctor", doctor.name],
                ["Specialization", doctor.specialization.join(" & ")],
                ["Clinic", clinicName(detail.clinicId)],
                ...(clinicAddress(detail.clinicId) ? [["Clinic Address", clinicAddress(detail.clinicId) as string]] : []),
                ["Appointment Date", detail.date],
                ["Appointment Time", detail.time],
                ["Visit Type", detail.visitType === "online" ? "Online" : "In-Clinic"],
                ["Patient", detail.patientSnapshot.fullName],
                ["Phone", detail.patientSnapshot.phone],
                ["Reason for Visit", detail.reason || "—"],
                ...(detail.patientSnapshot.notes ? [["Notes", detail.patientSnapshot.notes]] : []),
                ["Fee", `Rs. ${detail.feeSnapshotPkr.toLocaleString()}`],
                ["Payment Type", detailPayment ? PAYMENT_METHOD_LABEL[detailPayment.method] : "—"],
                ["Payment Status", detailPayment ? toPatientPaymentStatus(detailPayment.status) : "Pending"],
                ["Appointment Status", toPatientAppointmentStatus(detail.status)],
                ...(detailPayment?.stripePaymentIntentId
                  ? [["Stripe Transaction ID", detailPayment.stripePaymentIntentId]]
                  : []),
                ...(detailPayment?.rejectionReason ? [["Rejection Reason", detailPayment.rejectionReason]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-md border-b border-outline-variant/20 pb-xs">
                  <span className="text-on-surface-variant text-label-md shrink-0">{label}</span>
                  <span className="font-semibold text-on-surface text-right break-words">{value}</span>
                </div>
              ))}
            </div>

            {detailPayment?.receiptUrl && (
              <div className="mt-md">
                <p className="text-label-md text-on-surface-variant mb-xs">Receipt</p>
                <a
                  href={detailPayment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold hover:underline flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download Receipt
                </a>
              </div>
            )}

            <div className="mt-lg flex flex-wrap gap-sm">
              <button
                onClick={() => printSlip(detail, detailPayment)}
                className="flex-1 py-sm rounded-lg border border-outline-variant text-on-surface font-bold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                Print Slip
              </button>
              <button
                onClick={() => setDetailId(null)}
                className="flex-1 py-sm bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
