"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import type { AppointmentStatus, VisitType } from "@/types/appointment";

interface StatusHistoryEntry {
  status: AppointmentStatus;
  changedAt: string;
  changedBy: string;
  note?: string;
}

interface ApiAppointment {
  _id: string;
  appointmentNumber: string;
  clinicId: { _id: string; name: string } | string;
  visitType: VisitType;
  date: string;
  time: string;
  reason?: string;
  patientSnapshot: { fullName: string; phone: string };
  feeSnapshotPkr: number;
  paymentMethod?: string;
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

function clinicName(clinicId: ApiAppointment["clinicId"]): string {
  return typeof clinicId === "string" ? clinicId : clinicId?.name ?? "—";
}

export default function AppointmentVerificationContent() {
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<ApiAppointment | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/appointments");
        const data = await res.json();
        if (res.ok) setAppointments(data.appointments ?? []);
      } catch {
        // Search will simply return no results if this fails.
      }
    })();
  }, []);

  function handleSearch() {
    const term = searchTerm.trim().toLowerCase();
    const phoneTerm = phone.trim();
    if (!term && !phoneTerm) {
      toast.error("Enter an appointment ID, patient name, or phone number.");
      return;
    }
    const match = appointments.find((a) => {
      const matchesTerm =
        !term ||
        a.appointmentNumber.toLowerCase().includes(term) ||
        a.patientSnapshot.fullName.toLowerCase().includes(term);
      const matchesPhone = !phoneTerm || a.patientSnapshot.phone.includes(phoneTerm);
      return matchesTerm && matchesPhone;
    });
    if (!match) {
      setResult(null);
      setNotFound(true);
      return;
    }
    setNotFound(false);
    setResult(match);
  }

  async function updateStatus(status: AppointmentStatus) {
    if (!result) return;
    setBusy(true);
    try {
      const endpoint = status === "cancelled" ? `/api/appointments/${result._id}/cancel` : `/api/appointments/${result._id}`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: status === "cancelled" ? undefined : JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update appointment");
        return;
      }
      setResult(data.appointment);
      toast.success("Appointment updated");
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-gutter py-lg max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="mb-xl">
        <h2 className="text-headline-lg font-bold text-on-surface">Appointment Verification</h2>
        <p className="text-body-lg text-on-surface-variant">Search by Appointment ID, patient name, or phone number to verify a booking.</p>
      </div>

      {/* Search Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm max-w-2xl mb-xl">
        <div className="flex items-center gap-xs mb-md">
          <span className="material-symbols-outlined text-primary">search_check</span>
          <h3 className="text-headline-md font-semibold text-on-surface">Search Appointment</h3>
        </div>
        <div className="space-y-md">
          <div>
            <label className="block text-label-md text-on-surface-variant mb-xs">Appointment # or Patient Name</label>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-outline rounded-lg h-12 px-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body-md"
              placeholder="APT-260705-0001 or Ahmed Khan"
              type="text"
            />
          </div>
          <div>
            <label className="block text-label-md text-on-surface-variant mb-xs">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-outline rounded-lg h-12 px-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="+92 300 0000000"
              type="tel"
            />
          </div>
          <button
            onClick={handleSearch}
            className="w-full border border-primary text-primary text-label-md h-12 rounded-lg hover:bg-primary/5 transition-all"
          >
            Search Appointment
          </button>
        </div>
      </div>

      {notFound && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-md flex items-center gap-md mb-gutter max-w-2xl">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-body-md text-error">No appointment matched that search. Check the details and try again.</p>
        </div>
      )}

      {/* Verification Result */}
      {result && (
        <>
          {/* Success Banner */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-md flex items-center gap-md mb-gutter">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200 shrink-0">
              <span className="material-symbols-outlined text-white text-[28px]">check</span>
            </div>
            <div>
              <h4 className="text-headline-md text-green-900">Appointment Found</h4>
              <p className="text-body-md text-green-700">Reviewing details for {result.patientSnapshot.fullName}.</p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md overflow-hidden">
            <div className="p-lg grid grid-cols-1 lg:grid-cols-3 gap-xl">
              {/* Patient Identity */}
              <div className="lg:col-span-1 border-r border-outline-variant/50 pr-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-md border-4 border-surface-container shadow-sm text-headline-lg font-bold">
                    {result.patientSnapshot.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <h3 className="text-headline-md text-on-surface">{result.patientSnapshot.fullName}</h3>
                  <p className="text-body-md text-primary font-medium">{result.appointmentNumber}</p>
                  <div className="mt-md space-y-sm w-full">
                    {[
                      ["Date", result.date],
                      ["Time", result.time],
                      ["Clinic", clinicName(result.clinicId)],
                      ["Type", result.visitType === "online" ? "Online Consultation" : "In-Clinic Visit"],
                      ["Status", STATUS_LABEL[result.status]],
                      ["Fee", `Rs. ${result.feeSnapshotPkr.toLocaleString()}`],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-center text-caption py-xs border-b border-outline-variant/30 last:border-0">
                        <span className="text-on-surface-variant uppercase tracking-wider">{label}</span>
                        <span className="text-on-surface font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Journey */}
              <div className="lg:col-span-2">
                <h4 className="text-label-md text-on-surface-variant uppercase tracking-widest mb-md">Status History</h4>
                <div className="space-y-sm mb-xl">
                  {result.statusHistory.length === 0 ? (
                    <p className="text-body-md text-on-surface-variant">No history recorded yet.</p>
                  ) : (
                    result.statusHistory.map((entry, i) => (
                      <div key={i} className="flex items-center gap-sm p-sm bg-surface-container-low rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-body-md font-semibold text-on-surface">{STATUS_LABEL[entry.status]}</p>
                          <p className="text-caption text-on-surface-variant">
                            {new Date(entry.changedAt).toLocaleString()} · {entry.changedBy}
                            {entry.note ? ` · ${entry.note}` : ""}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {result.reason && (
                  <div className="p-md bg-surface-container-low rounded-lg border border-outline-variant/30 mb-xl">
                    <h5 className="text-label-md text-on-surface-variant mb-xs">Reason for Visit</h5>
                    <p className="text-body-md text-on-surface font-medium">{result.reason}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-sm">
                  {result.status === "confirmed" && (
                    <button
                      disabled={busy}
                      onClick={() => updateStatus("completed")}
                      className="bg-primary text-on-primary text-label-md h-12 px-lg rounded-lg shadow-sm hover:brightness-110 flex items-center gap-xs transition-all disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined">task_alt</span> Mark Completed
                    </button>
                  )}
                  {result.status !== "cancelled" && result.status !== "completed" && result.status !== "rejected" && (
                    <button
                      disabled={busy}
                      onClick={() => updateStatus("cancelled")}
                      className="border border-error text-error text-label-md h-12 px-md rounded-lg hover:bg-error/5 transition-all flex items-center gap-xs disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined">cancel</span> Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
