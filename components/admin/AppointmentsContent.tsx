"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { doctor } from "@/lib/data";

type Status = "Confirmed" | "Pending" | "Completed" | "Cancelled";
type VisitType = "Consultation" | "Follow-up" | "Procedure";

interface Appointment {
  id: string;
  initials: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  clinic: string;
  type: VisitType;
  status: Status;
  fee: number;
}

const SEED: Appointment[] = [
  { id: "#APT-9042", initials: "AK", name: "Ahmed Khan", phone: "+92 300 1234567", date: "2026-07-01", time: "07:00 PM", clinic: doctor.practice_locations[1]?.name ?? "Faisal Hospital", type: "Consultation", status: "Confirmed", fee: 2000 },
  { id: "#APT-9041", initials: "SM", name: "Sara Malik", phone: "+92 321 9876543", date: "2026-07-01", time: "07:30 PM", clinic: doctor.practice_locations[1]?.name ?? "Faisal Hospital", type: "Follow-up", status: "Pending", fee: 2000 },
  { id: "#APT-9040", initials: "ZB", name: "Zainab Bibi", phone: "+92 333 4567890", date: "2026-07-02", time: "05:00 PM", clinic: doctor.practice_locations[0]?.name ?? "Chughtai", type: "Consultation", status: "Confirmed", fee: 2000 },
  { id: "#APT-9039", initials: "UF", name: "Umar Farooq", phone: "+92 345 0001112", date: "2026-07-02", time: "09:00 PM", clinic: doctor.practice_locations[2]?.name ?? "United Hospital", type: "Procedure", status: "Pending", fee: 1200 },
  { id: "#APT-9038", initials: "FA", name: "Fatima Akhtar", phone: "+92 311 2345678", date: "2026-06-30", time: "06:00 PM", clinic: doctor.practice_locations[0]?.name ?? "Chughtai", type: "Follow-up", status: "Completed", fee: 2000 },
  { id: "#APT-9037", initials: "MR", name: "Muhammad Raza", phone: "+92 303 8765432", date: "2026-06-30", time: "08:00 PM", clinic: doctor.practice_locations[1]?.name ?? "Faisal Hospital", type: "Consultation", status: "Completed", fee: 2000 },
  { id: "#APT-9036", initials: "HA", name: "Hina Asif", phone: "+92 322 1112233", date: "2026-06-29", time: "07:00 PM", clinic: doctor.practice_locations[1]?.name ?? "Faisal Hospital", type: "Consultation", status: "Cancelled", fee: 2000 },
  { id: "#APT-9035", initials: "BA", name: "Bilal Ahmed", phone: "+92 331 9988776", date: "2026-07-03", time: "05:30 PM", clinic: doctor.practice_locations[0]?.name ?? "Chughtai", type: "Follow-up", status: "Confirmed", fee: 2000 },
];

const STATUS_COLORS: Record<Status, string> = {
  Confirmed: "bg-secondary/10 text-secondary",
  Pending: "bg-amber-100 text-amber-700",
  Completed: "bg-surface-container-highest text-on-surface-variant",
  Cancelled: "bg-error/10 text-error",
};

const DOT_COLORS: Record<Status, string> = {
  Confirmed: "bg-emerald-500",
  Pending: "bg-amber-400",
  Completed: "bg-outline",
  Cancelled: "bg-error",
};

const PAGE_SIZE = 5;

export default function AppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>(SEED);
  const [tab, setTab] = useState<"All" | Status>("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<Status>("Confirmed");

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const matchTab = tab === "All" || a.status === tab;
      const matchSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.phone.includes(search);
      const matchType = typeFilter === "All" || a.type === typeFilter;
      return matchTab && matchSearch && matchType;
    });
  }, [appointments, tab, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(() => ({
    All: appointments.length,
    Confirmed: appointments.filter((a) => a.status === "Confirmed").length,
    Pending: appointments.filter((a) => a.status === "Pending").length,
    Completed: appointments.filter((a) => a.status === "Completed").length,
    Cancelled: appointments.filter((a) => a.status === "Cancelled").length,
  }), [appointments]);

  const changeStatus = (id: string, status: Status) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const deleteAppt = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    setDeleteId(null);
  };

  const exportCSV = () => {
    const rows = [
      ["ID", "Patient", "Phone", "Date", "Time", "Clinic", "Type", "Status", "Fee (Rs.)"],
      ...filtered.map((a) => [a.id, a.name, a.phone, a.date, a.time, a.clinic, a.type, a.status, a.fee]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "appointments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTabChange = (t: typeof tab) => { setTab(t); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleTypeFilter = (v: string) => { setTypeFilter(v); setPage(1); };

  return (
    <div className="px-gutter py-lg max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Appointments Management</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {counts.All} total · {counts.Pending} pending · {counts.Confirmed} confirmed
          </p>
        </div>
        <div className="flex gap-sm">
          <button
            onClick={exportCSV}
            className="flex items-center gap-xs px-md py-xs rounded-xl border border-outline-variant text-on-surface-variant font-semibold hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">download</span> Export CSV
          </button>
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
          {/* Tab pills */}
          <div className="flex bg-surface-container-low p-xs rounded-xl">
            {(["All", "Confirmed", "Pending", "Completed", "Cancelled"] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={`px-md py-xs rounded-lg text-label-md font-bold transition-all ${
                  tab === t
                    ? "bg-surface-container-lowest shadow-sm text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t} {counts[t] > 0 && <span className="ml-xs text-caption opacity-70">({counts[t]})</span>}
              </button>
            ))}
          </div>

          {/* Type select */}
          <select
            value={typeFilter}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="bg-surface-container-low border-none rounded-xl pl-md pr-10 py-xs text-label-md font-medium focus:ring-primary/20 cursor-pointer"
          >
            {["All", "Consultation", "Follow-up", "Procedure"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

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
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                {["Patient", "Date & Time", "Clinic", "Visit Type", "Status", "Fee", "Actions"].map((h, i) => (
                  <th key={h} className={`px-md py-md text-label-md text-on-surface-variant ${i === 6 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                    No appointments match your filters.
                  </td>
                </tr>
              ) : (
                pageItems.map((apt) => (
                  <tr key={apt.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-md py-md">
                      <div className="flex items-center gap-sm">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {apt.initials}
                        </div>
                        <div>
                          <p className="text-body-md font-semibold">{apt.name}</p>
                          <p className="text-caption text-on-surface-variant">{apt.id} · {apt.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-md py-md">
                      <p className="text-body-md font-medium">{apt.date}</p>
                      <p className="text-caption text-on-surface-variant">{apt.time}</p>
                    </td>
                    <td className="px-md py-md">
                      <p className="text-body-md text-on-surface-variant max-w-[180px] truncate">{apt.clinic}</p>
                    </td>
                    <td className="px-md py-md">
                      <span className="px-sm py-xs rounded-full bg-surface-container text-caption font-bold border border-outline-variant/30">
                        {apt.type}
                      </span>
                    </td>
                    <td className="px-md py-md">
                      <div className="flex items-center gap-xs">
                        <div className={`w-2 h-2 rounded-full ${DOT_COLORS[apt.status]}`} />
                        <span className={`px-sm py-[2px] rounded-full ${STATUS_COLORS[apt.status]} text-caption font-bold`}>
                          {apt.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-md py-md text-body-md font-semibold text-primary">
                      Rs. {apt.fee.toLocaleString()}
                    </td>
                    <td className="px-md py-md text-right">
                      <div className="flex items-center justify-end gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {apt.status === "Pending" && (
                          <>
                            <button
                              onClick={() => changeStatus(apt.id, "Confirmed")}
                              className="p-xs rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                              title="Confirm"
                            >
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            </button>
                            <button
                              onClick={() => changeStatus(apt.id, "Cancelled")}
                              className="p-xs rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
                              title="Cancel"
                            >
                              <span className="material-symbols-outlined text-[18px]">cancel</span>
                            </button>
                          </>
                        )}
                        {apt.status === "Confirmed" && (
                          <button
                            onClick={() => changeStatus(apt.id, "Completed")}
                            className="p-xs rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors"
                            title="Mark Completed"
                          >
                            <span className="material-symbols-outlined text-[18px]">task_alt</span>
                          </button>
                        )}
                        <button
                          onClick={() => { setEditId(apt.id); setEditStatus(apt.status); }}
                          className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteId(apt.id)}
                          className="p-xs rounded-lg border border-error/20 text-error hover:bg-error/10 transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-md py-sm border-t border-outline-variant/20 flex items-center justify-between">
          <p className="text-caption text-on-surface-variant">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
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

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-lg shadow-2xl max-w-sm w-full mx-md">
            <h3 className="text-headline-md font-bold text-on-surface mb-sm">Delete Appointment?</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">
              This will permanently remove appointment {deleteId}. This action cannot be undone.
            </p>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-md py-xs rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteAppt(deleteId)}
                className="px-md py-xs rounded-xl bg-error text-on-error font-semibold hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit status modal */}
      {editId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-lg shadow-2xl max-w-sm w-full mx-md">
            <h3 className="text-headline-md font-bold text-on-surface mb-sm">Update Status</h3>
            <p className="text-caption text-on-surface-variant mb-md">{editId}</p>
            <div className="space-y-sm mb-lg">
              {(["Confirmed", "Pending", "Completed", "Cancelled"] as const).map((s) => (
                <label key={s} className="flex items-center gap-sm cursor-pointer">
                  <input
                    type="radio"
                    name="edit-status"
                    checked={editStatus === s}
                    onChange={() => setEditStatus(s)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className={`px-sm py-xs rounded-full ${STATUS_COLORS[s]} text-caption font-bold`}>{s}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => setEditId(null)}
                className="px-md py-xs rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                onClick={() => { changeStatus(editId, editStatus); setEditId(null); }}
                className="px-md py-xs rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
