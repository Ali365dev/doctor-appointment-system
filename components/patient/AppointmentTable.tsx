"use client";

import { useState } from "react";

export type Appointment = {
  id: string;
  date: string;
  time: string;
  type: string;
  status: "upcoming" | "completed" | "cancelled" | "pending";
  payment: string;
  paymentStatus: "paid" | "pending" | "unpaid";
  amount?: string;
};

const appointments: Appointment[] = [
  {
    id: "APT-001",
    date: "Oct 24, 2024",
    time: "10:30 AM — 11:15 AM",
    type: "Dermatology Check-up",
    status: "upcoming",
    payment: "Pending",
    paymentStatus: "pending",
  },
  {
    id: "APT-002",
    date: "Oct 12, 2024",
    time: "02:00 PM — 02:30 PM",
    type: "General Follow-up",
    status: "completed",
    payment: "$150.00 (Paid)",
    paymentStatus: "paid",
    amount: "$150.00",
  },
  {
    id: "APT-003",
    date: "Sep 18, 2024",
    time: "11:00 AM — 11:45 AM",
    type: "Cardiology Consultation",
    status: "completed",
    payment: "$220.00 (Paid)",
    paymentStatus: "paid",
    amount: "$220.00",
  },
  {
    id: "APT-004",
    date: "Aug 30, 2024",
    time: "09:00 AM — 09:30 AM",
    type: "Lab Results Review",
    status: "cancelled",
    payment: "Refunded",
    paymentStatus: "unpaid",
  },
];

const statusConfig: Record<
  Appointment["status"],
  { label: string; cls: string }
> = {
  upcoming: { label: "Upcoming", cls: "bg-primary/10 text-primary" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-600" },
  cancelled: { label: "Cancelled", cls: "bg-error/10 text-error" },
  pending: { label: "Pending", cls: "bg-warning/10 text-warning" },
};

type Props = { limit?: number; showSearch?: boolean };

export default function AppointmentTable({ limit, showSearch = false }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Appointment["status"]>("all");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = appointments
    .filter((a) => filter === "all" || a.status === filter)
    .filter(
      (a) =>
        !search ||
        a.type.toLowerCase().includes(search.toLowerCase()) ||
        a.date.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, limit);

  function confirmCancel() {
    if (cancelId) {
      setCancelledIds((prev) => new Set([...prev, cancelId]));
      setCancelId(null);
    }
  }

  const detail = appointments.find((a) => a.id === detailId);

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
            {(["all", "upcoming", "completed", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-md py-xs rounded-full text-label-md capitalize transition-all ${
                  filter === f
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {f}
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
                <th className="px-md py-sm text-label-md text-on-surface-variant">Date &amp; Time</th>
                <th className="px-md py-sm text-label-md text-on-surface-variant">Consultation Type</th>
                <th className="px-md py-sm text-label-md text-on-surface-variant">Status</th>
                <th className="px-md py-sm text-label-md text-on-surface-variant">Payment</th>
                <th className="px-md py-sm text-label-md text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-body-md">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-md py-xl text-center text-on-surface-variant">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => {
                  const isCancelled = cancelledIds.has(appt.id) || appt.status === "cancelled";
                  const effectiveStatus: Appointment["status"] = isCancelled ? "cancelled" : appt.status;
                  const statusInfo = statusConfig[effectiveStatus];

                  return (
                    <tr
                      key={appt.id}
                      className="hover:bg-surface-container-low transition-colors group"
                    >
                      <td className="px-md py-md">
                        <div className="font-bold">{appt.date}</div>
                        <div className="text-caption text-on-surface-variant">{appt.time}</div>
                      </td>
                      <td className="px-md py-md text-on-surface">{appt.type}</td>
                      <td className="px-md py-md">
                        <span className={`text-[12px] font-bold px-sm py-1 rounded-full ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-md py-md">
                        <span
                          className={
                            appt.paymentStatus === "paid"
                              ? "text-emerald-600 font-bold"
                              : "text-on-surface-variant"
                          }
                        >
                          {isCancelled && appt.paymentStatus === "unpaid" ? "Refunded" : appt.payment}
                        </span>
                      </td>
                      <td className="px-md py-md text-right">
                        <div className="flex items-center justify-end gap-xs">
                          <button
                            onClick={() => setDetailId(appt.id)}
                            className="text-primary hover:bg-primary/10 p-xs rounded transition-colors"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          {effectiveStatus === "upcoming" && (
                            <>
                              <button
                                className="text-on-surface-variant hover:bg-surface-container-high p-xs rounded transition-colors"
                                title="Reschedule"
                              >
                                <span className="material-symbols-outlined text-[20px]">event_repeat</span>
                              </button>
                              {appt.paymentStatus === "pending" && (
                                <button
                                  className="text-primary hover:bg-primary/10 p-xs rounded transition-colors"
                                  title="Continue Payment"
                                >
                                  <span className="material-symbols-outlined text-[20px]">payments</span>
                                </button>
                              )}
                              <button
                                onClick={() => setCancelId(appt.id)}
                                className="text-error hover:bg-error/10 p-xs rounded transition-colors"
                                title="Cancel"
                              >
                                <span className="material-symbols-outlined text-[20px]">cancel</span>
                              </button>
                            </>
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
                onClick={confirmCancel}
                className="px-md py-sm bg-error text-on-error rounded-lg font-bold hover:bg-error/90 transition-colors"
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
            className="bg-surface-container-lowest rounded-xl p-lg shadow-xl max-w-md w-full border border-outline-variant"
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
                ["ID", detail.id],
                ["Date", detail.date],
                ["Time", detail.time],
                ["Type", detail.type],
                ["Status", statusConfig[detail.status].label],
                ["Payment", detail.payment],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-outline-variant/20 pb-xs">
                  <span className="text-on-surface-variant text-label-md">{label}</span>
                  <span className="font-semibold text-on-surface">{value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setDetailId(null)}
              className="mt-lg w-full py-sm bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
