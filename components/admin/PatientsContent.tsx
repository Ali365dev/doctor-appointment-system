"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";

type PatientStatus = "Active" | "Follow-up" | "New";

interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  lastVisit: string;
  totalVisits: number;
  status: PatientStatus;
  lastReason: string;
}

const STATUS_COLORS: Record<PatientStatus, string> = {
  Active: "bg-secondary/10 text-secondary",
  "Follow-up": "bg-primary/10 text-primary",
  New: "bg-surface-container-highest text-on-surface-variant",
};

const PAGE_SIZE = 5;

export default function PatientsContent() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/patients");
        const data = await res.json();
        if (res.ok) setPatients(data.patients ?? []);
        else toast.error(data.error ?? "Could not load patients");
      } catch {
        toast.error("Network error loading patients");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(
    () =>
      patients.filter((p) => {
        const matchSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.phone.includes(search) ||
          p.lastReason.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "All" || p.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [patients, search, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    Active: patients.filter((p) => p.status === "Active").length,
    "Follow-up": patients.filter((p) => p.status === "Follow-up").length,
    New: patients.filter((p) => p.status === "New").length,
  };

  const exportCSV = () => {
    const rows = [
      ["Name", "Phone", "Email", "Age", "Gender", "Last Visit", "Total Visits", "Status", "Last Reason for Visit"],
      ...filtered.map((p) => [p.name, p.phone, p.email ?? "", p.age ?? "", p.gender ?? "", p.lastVisit, p.totalVisits, p.status, p.lastReason]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patients.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewPatient = patients.find((p) => p.id === viewId);

  return (
    <div className="max-w-[1440px] mx-auto px-gutter py-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Patient Directory</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {patients.length} registered patients · {counts["Follow-up"]} follow-up · {counts.New} new
          </p>
        </div>
        <div className="flex gap-sm">
          <button
            onClick={exportCSV}
            className="flex items-center gap-xs px-md py-xs border border-outline-variant rounded-xl text-label-md hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">download</span> Export
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-xl">
        {(Object.entries(counts) as [PatientStatus, number][]).map(([label, value]) => (
          <div key={label} className="bg-surface-container-lowest p-md rounded-2xl border border-outline-variant shadow-sm flex items-center gap-md">
            <div className={`w-10 h-10 rounded-xl ${STATUS_COLORS[label]} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[20px]">person</span>
            </div>
            <div>
              <p className="text-caption font-semibold text-on-surface-variant uppercase tracking-wider">{label}</p>
              <p className="text-headline-md font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-2xl p-md mb-xl shadow-sm border border-outline-variant/30 flex flex-wrap items-center gap-md justify-between">
        <div className="flex bg-surface-container-low p-xs rounded-xl">
          {["All", "Active", "Follow-up", "New"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-md py-xs rounded-lg text-label-md font-bold transition-all ${
                statusFilter === s
                  ? "bg-surface-container-lowest shadow-sm text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, phone, reason…"
            className="pl-10 pr-sm py-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50 border-b border-outline-variant">
              {["Patient", "Phone", "Age / Gender", "Last Reason for Visit", "Last Visit", "Visits", "Status", "Actions"].map((h, i) => (
                <th key={h} className={`px-md py-md font-semibold text-label-md text-on-surface-variant ${i === 7 ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-md py-xl text-center text-on-surface-variant">
                  Loading patients…
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-md py-xl text-center text-on-surface-variant">
                  No patients match your search.
                </td>
              </tr>
            ) : (
              pageItems.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-md py-md">
                    <div className="flex items-center gap-sm">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-semibold text-body-md">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-md py-md text-body-md text-on-surface-variant">{p.phone}</td>
                  <td className="px-md py-md text-body-md">{p.age ? `${p.age}y` : "—"} · {p.gender ?? "—"}</td>
                  <td className="px-md py-md text-body-md text-on-surface-variant max-w-[220px] truncate">{p.lastReason}</td>
                  <td className="px-md py-md text-body-md">{p.lastVisit}</td>
                  <td className="px-md py-md text-body-md">{p.totalVisits}</td>
                  <td className="px-md py-md">
                    <span className={`px-sm py-xs ${STATUS_COLORS[p.status]} text-caption font-bold rounded-full`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-md py-md text-right">
                    <div className="flex items-center justify-end gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setViewId(p.id)}
                        className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
                        title="View Profile"
                      >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-md py-sm border-t border-outline-variant/20 flex items-center justify-between">
          <p className="text-caption text-on-surface-variant">
            {filtered.length} patient{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-xs">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-30">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`px-sm py-xs rounded-lg text-caption font-bold ${page === n ? "bg-primary text-on-primary" : "hover:bg-surface-container-high"}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-30">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Profile modal */}
      {viewPatient && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-lg shadow-2xl max-w-md w-full mx-md">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-headline-md font-bold text-on-surface">Patient Profile</h3>
              <button onClick={() => setViewId(null)}
                className="p-xs rounded-lg hover:bg-surface-container-high">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-sm">
              {[
                ["Name", viewPatient.name],
                ["Phone", viewPatient.phone],
                ["Email", viewPatient.email ?? "—"],
                ["Age", viewPatient.age ? `${viewPatient.age} years` : "—"],
                ["Gender", viewPatient.gender ?? "—"],
                ["Status", viewPatient.status],
                ["Last Visit", viewPatient.lastVisit],
                ["Total Visits", String(viewPatient.totalVisits)],
                ["Last Reason for Visit", viewPatient.lastReason],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center border-b border-outline-variant/20 pb-sm">
                  <span className="text-caption text-on-surface-variant uppercase tracking-wider">{label}</span>
                  <span className="text-body-md font-semibold text-on-surface text-right max-w-[60%] truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
