"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { type AppointmentStatus, type VisitType } from "@/types/appointment";
import { type PaymentMethod, type PaymentStatus } from "@/types/payment";
import { PAYMENT_METHOD_LABEL } from "@/lib/appointmentDisplay";

const PAYMENT_STATUS_DROPDOWN_OPTIONS: PaymentStatus[] = ["pending", "verified", "rejected", "refunded"];

const APPOINTMENT_STATUS_DROPDOWN_OPTIONS: AppointmentStatus[] = [
  "pending_payment",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

interface StatusHistoryEntry {
  status: AppointmentStatus;
  changedAt: string;
  changedBy: string;
  note?: string;
}

interface ApiPayment {
  _id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amountPkr: number;
  transactionRef?: string;
  receiptUrl?: string;
  rejectionReason?: string;
  receiptUploadedAt?: string;
  verifiedAt?: string;
  refundedAt?: string;
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
    age?: number;
    gender?: string;
    city?: string;
    email?: string;
    condition?: string;
    notes?: string;
  };
  feeSnapshotPkr: number;
  paymentId?: ApiPayment | string;
  procedureNameSnapshot?: string;
  status: AppointmentStatus;
  statusHistory: StatusHistoryEntry[];
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
  confirmed: "bg-secondary-fixed text-on-secondary-fixed-variant",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-error/10 text-error",
  rejected: "bg-error/10 text-error",
  rescheduled: "bg-primary/10 text-primary",
  no_show: "bg-gray-100 text-gray-700",
};

const PAYMENT_STATUS_BADGE: Record<PaymentStatus, string> = {
  pending: "bg-surface-container-highest text-on-surface-variant",
  submitted: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-error/10 text-error",
  failed: "bg-error/10 text-error",
  refunded: "bg-purple-100 text-purple-700",
};

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pending",
  submitted: "Under Review",
  verified: "Paid",
  rejected: "Rejected",
  failed: "Failed",
  refunded: "Refunded",
};

const TIMELINE_ICON: Record<AppointmentStatus, string> = {
  pending_payment: "schedule",
  payment_submitted: "receipt_long",
  payment_verification: "pending",
  confirmed: "check",
  completed: "task_alt",
  cancelled: "cancel",
  rejected: "block",
  rescheduled: "event_repeat",
  no_show: "person_off",
};

interface TimelineEvent {
  label: string;
  changedAt: string;
  changedBy: string;
  note?: string;
  icon: string;
  iconBg: string;
}

/** Merges appointment status history with payment milestones into one chronological timeline. */
function buildTimeline(appointment: ApiAppointment, payment: ApiPayment | null): TimelineEvent[] {
  const events: TimelineEvent[] = appointment.statusHistory.map((entry) => ({
    label: STATUS_LABEL[entry.status],
    changedAt: entry.changedAt,
    changedBy: entry.changedBy,
    note: entry.note,
    icon: TIMELINE_ICON[entry.status],
    iconBg: "bg-primary-container",
  }));

  if (payment?.receiptUploadedAt) {
    events.push({
      label: "Receipt Uploaded by Patient",
      changedAt: payment.receiptUploadedAt,
      changedBy: "patient",
      icon: "description",
      iconBg: "bg-tertiary-container",
    });
  }
  if (payment?.status === "verified" && payment.verifiedAt) {
    events.push({
      label: "Payment Verified",
      changedAt: payment.verifiedAt,
      changedBy: "admin",
      icon: "check_circle",
      iconBg: "bg-green-600",
    });
  }
  if (payment?.status === "rejected" && payment.rejectionReason) {
    events.push({
      label: "Payment Rejected",
      changedAt: payment.verifiedAt ?? appointment.statusHistory.at(-1)?.changedAt ?? "",
      changedBy: "admin",
      note: payment.rejectionReason,
      icon: "cancel",
      iconBg: "bg-error",
    });
  }
  if (payment?.status === "refunded" && payment.refundedAt) {
    events.push({
      label: "Payment Refunded",
      changedAt: payment.refundedAt,
      changedBy: "admin",
      icon: "undo",
      iconBg: "bg-purple-600",
    });
  }

  return events
    .filter((e) => e.changedAt)
    .sort((a, b) => (a.changedAt < b.changedAt ? 1 : -1));
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

function initialsOf(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function AppointmentVerificationDetailContent({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [appointment, setAppointment] = useState<ApiAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusDraft, setStatusDraft] = useState<AppointmentStatus>("pending_payment");
  const [paymentStatusDraft, setPaymentStatusDraft] = useState<PaymentStatus | "">("");
  const [noteDraft, setNoteDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [paymentActionBusy, setPaymentActionBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not load appointment");
        return;
      }
      setAppointment(data.appointment);
      setStatusDraft(data.appointment.status);
      const p = getPayment(data.appointment);
      setPaymentStatusDraft(p?.status ?? "");
    } catch {
      toast.error("Network error loading appointment");
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveChanges() {
    if (!appointment) return;
    setSaving(true);
    try {
      const payment = getPayment(appointment);
      if (payment && paymentStatusDraft && paymentStatusDraft !== payment.status) {
        const payRes = await fetch(`/api/payments/${payment._id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: paymentStatusDraft }),
        });
        const payData = await payRes.json();
        if (!payRes.ok) {
          toast.error(payData.error ?? "Could not update payment status");
          return;
        }
      }

      const res = await fetch(`/api/appointments/${appointment._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusDraft, note: noteDraft || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update appointment");
        return;
      }
      setNoteDraft("");
      await load();
      toast.success("Record updated and patient notified");
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function verifyPayment(approve: boolean) {
    const payment = appointment ? getPayment(appointment) : null;
    if (!payment) return;
    const rejectionReason = approve ? undefined : window.prompt("Reason for rejection (optional):") ?? undefined;
    setPaymentActionBusy(true);
    try {
      const res = await fetch(`/api/payments/${payment._id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve, rejectionReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update payment");
        return;
      }
      toast.success(approve ? "Payment verified" : "Payment rejected");
      await load();
    } catch {
      toast.error("Network error");
    } finally {
      setPaymentActionBusy(false);
    }
  }

  if (loading) {
    return <div className="px-gutter py-lg max-w-[1400px] mx-auto text-body-md text-on-surface-variant">Loading appointment…</div>;
  }

  if (!appointment) {
    return (
      <div className="px-gutter py-lg max-w-[1400px] mx-auto">
        <p className="text-body-md text-error">Appointment not found.</p>
        <button onClick={() => router.push("/admin/appointments/verify")} className="mt-md text-primary font-semibold hover:underline">
          ← Back to Search
        </button>
      </div>
    );
  }

  const payment = getPayment(appointment);
  const canVerifyPayment =
    !!payment && (payment.status === "submitted" || (payment.status === "pending" && payment.method === "reception"));
  const timeline = buildTimeline(appointment, payment);

  return (
    <div className="px-gutter py-lg max-w-[1400px] mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-md mb-lg">
        <button
          onClick={() => router.push("/admin/appointments/verify")}
          className="flex items-center gap-xs text-primary hover:bg-primary/5 px-sm py-xs rounded-lg transition-colors font-label-md"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Search
        </button>
        <div className="h-6 w-px bg-outline-variant" />
        <h2 className="text-headline-md text-on-surface font-bold">Appointment Details</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-md">
          {/* Patient Profile */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
            <div className="flex items-center gap-md mb-md">
              <div className="w-16 h-16 bg-primary/10 text-primary border-2 border-primary/20 rounded-full flex items-center justify-center font-bold text-headline-md shrink-0">
                {initialsOf(appointment.patientSnapshot.fullName)}
              </div>
              <div>
                <h3 className="text-headline-md text-on-surface font-bold">{appointment.patientSnapshot.fullName}</h3>
                <div className="flex items-center gap-xs mt-1 flex-wrap">
                  <span className="bg-surface-container text-on-surface-variant px-xs py-0.5 rounded text-caption font-semibold">
                    ID: {appointment.appointmentNumber}
                  </span>
                  {(appointment.patientSnapshot.age || appointment.patientSnapshot.gender) && (
                    <>
                      <span className="text-on-surface-variant text-caption">•</span>
                      <span className="text-on-surface-variant text-caption">
                        {[appointment.patientSnapshot.age ? `${appointment.patientSnapshot.age} Years` : null, appointment.patientSnapshot.gender]
                          .filter(Boolean)
                          .join(" • ")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md border-t border-outline-variant pt-md">
              <div>
                <p className="text-caption text-on-surface-variant uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-body-md">{appointment.patientSnapshot.email || "—"}</p>
              </div>
              <div>
                <p className="text-caption text-on-surface-variant uppercase tracking-wider mb-1">Phone Number</p>
                <p className="text-body-md">{appointment.patientSnapshot.phone}</p>
              </div>
              <div>
                <p className="text-caption text-on-surface-variant uppercase tracking-wider mb-1">City</p>
                <p className="text-body-md">{appointment.patientSnapshot.city || "—"}</p>
              </div>
            </div>
          </section>

          {/* Appointment Information */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
            <h4 className="text-label-md text-on-surface-variant uppercase tracking-widest mb-md">Appointment Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <div className="space-y-1">
                <p className="text-caption text-on-surface-variant">Schedule</p>
                <p className="text-body-md font-semibold text-on-surface">{appointment.date}</p>
                <p className="text-caption text-on-surface-variant">{appointment.time}</p>
              </div>
              <div className="space-y-1">
                <p className="text-caption text-on-surface-variant">Visit Type</p>
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    {appointment.visitType === "online" ? "videocam" : "clinical_notes"}
                  </span>
                  <p className="text-body-md font-semibold text-on-surface">
                    {appointment.procedureNameSnapshot ?? (appointment.visitType === "online" ? "Online Consultation" : "Clinic Consultation")}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-caption text-on-surface-variant">Status</p>
                <span className={`inline-flex items-center px-sm py-0.5 rounded-full text-caption font-semibold ${STATUS_BADGE[appointment.status]}`}>
                  {STATUS_LABEL[appointment.status]}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-caption text-on-surface-variant">Clinic Location</p>
                <p className="text-body-md font-semibold text-on-surface">{clinicName(appointment.clinicId)}</p>
                {clinicAddress(appointment.clinicId) && (
                  <p className="text-caption text-on-surface-variant">{clinicAddress(appointment.clinicId)}</p>
                )}
              </div>
            </div>
            {appointment.reason && (
              <div className="mt-md pt-md border-t border-outline-variant/50">
                <p className="text-caption text-on-surface-variant mb-1">Reason for Visit</p>
                <p className="text-body-md text-on-surface">{appointment.reason}</p>
              </div>
            )}
          </section>

          {/* Payment Verification */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <h4 className="text-label-md text-on-surface-variant uppercase tracking-widest">Payment Verification</h4>
              {payment && (
                <span className={`px-sm py-xs rounded-full text-caption font-bold uppercase tracking-wide ${PAYMENT_STATUS_BADGE[payment.status]}`}>
                  {payment.status}
                </span>
              )}
            </div>

            {!payment ? (
              <p className="text-body-md text-on-surface-variant">No payment recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div className="space-y-md">
                  <div className="p-md bg-surface-container-low rounded-lg border border-outline-variant/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-on-surface-variant text-body-md">Payment Method</span>
                      <span className="font-semibold text-on-surface">{PAYMENT_METHOD_LABEL[payment.method]}</span>
                    </div>
                    {payment.transactionRef && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-on-surface-variant text-body-md">Transaction ID</span>
                        <span className="font-mono text-on-surface">{payment.transactionRef}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-outline-variant">
                      <span className="text-on-surface font-bold">Total Amount</span>
                      <span className="text-headline-md font-bold text-primary">Rs. {payment.amountPkr.toLocaleString()}</span>
                    </div>
                  </div>
                  {payment.rejectionReason && (
                    <p className="text-caption text-error">Rejection reason: {payment.rejectionReason}</p>
                  )}
                  {canVerifyPayment && (
                    <div className="flex gap-xs">
                      <button
                        disabled={paymentActionBusy}
                        onClick={() => verifyPayment(true)}
                        className="flex-1 py-xs px-md rounded-lg bg-primary text-on-primary font-semibold hover:brightness-110 transition-all disabled:opacity-60"
                      >
                        Verify
                      </button>
                      <button
                        disabled={paymentActionBusy}
                        onClick={() => verifyPayment(false)}
                        className="flex-1 py-xs px-md rounded-lg border border-error text-error font-semibold hover:bg-error/5 transition-all disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-caption text-on-surface-variant mb-xs">Uploaded Receipt</p>
                  {payment.receiptUrl ? (
                    <a
                      href={payment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group block cursor-zoom-in overflow-hidden rounded-xl border-2 border-outline-variant hover:border-primary transition-all h-48 bg-surface-container-low flex items-center justify-center"
                    >
                      {/\.pdf($|\?)/i.test(payment.receiptUrl) ? (
                        <span className="material-symbols-outlined text-primary text-[48px]">picture_as_pdf</span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={payment.receiptUrl} alt="Payment receipt" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 text-headline-lg">fullscreen</span>
                      </div>
                    </a>
                  ) : (
                    <div className="h-48 rounded-xl border-2 border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant text-caption">
                      No receipt uploaded
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-md">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm lg:sticky lg:top-24">
            <h4 className="text-label-md text-on-surface-variant uppercase tracking-widest mb-md">Administrative Actions</h4>
            <div className="space-y-md">
              <div className="space-y-1.5">
                <label className="text-label-md text-on-surface block">Update Appointment Status</label>
                <select
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value as AppointmentStatus)}
                  className="w-full h-11 px-sm bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  {APPOINTMENT_STATUS_DROPDOWN_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                  {!APPOINTMENT_STATUS_DROPDOWN_OPTIONS.includes(statusDraft) && (
                    <option value={statusDraft}>{STATUS_LABEL[statusDraft]}</option>
                  )}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-label-md text-on-surface block">Update Payment Status</label>
                <select
                  value={paymentStatusDraft}
                  disabled={!payment}
                  onChange={(e) => setPaymentStatusDraft(e.target.value as PaymentStatus)}
                  className="w-full h-11 px-sm bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {!payment && <option value="">No payment recorded</option>}
                  {payment && PAYMENT_STATUS_DROPDOWN_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {PAYMENT_STATUS_LABEL[s]}
                    </option>
                  ))}
                  {payment && !PAYMENT_STATUS_DROPDOWN_OPTIONS.includes(payment.status) && (
                    <option value={payment.status}>{PAYMENT_STATUS_LABEL[payment.status]}</option>
                  )}
                </select>
              </div>
              <button
                disabled={saving}
                onClick={saveChanges}
                className="w-full py-sm bg-primary text-on-primary font-bold rounded-lg shadow-md hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>

            <div className="mt-lg pt-lg border-t border-outline-variant">
              <h5 className="text-label-md text-on-surface-variant uppercase tracking-widest mb-md">Modification Timeline</h5>
              {timeline.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">No history recorded yet.</p>
              ) : (
                <div className="relative pl-8 space-y-md">
                  <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-surface-container-highest" />
                  {timeline.map((event, i) => (
                    <div key={i} className="relative flex gap-sm">
                      <span
                        className={`absolute -left-8 w-6 h-6 ${event.iconBg} rounded-full flex items-center justify-center z-10 border-4 border-surface-container-lowest shrink-0`}
                      >
                        <span className="material-symbols-outlined text-[12px] text-white">{event.icon}</span>
                      </span>
                      <span className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-[11px] font-bold shrink-0">
                        {event.changedBy.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-label-md text-on-surface">{event.label}</p>
                        <p className="text-caption text-on-surface-variant">
                          {new Date(event.changedAt).toLocaleString()} · {event.changedBy}
                          {event.note ? ` · ${event.note}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
