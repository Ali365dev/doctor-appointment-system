"use client";

import { useState, useMemo } from "react";

type PatientStatus = "Active" | "Follow-up" | "Critical" | "New";

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: "Male" | "Female";
  lastVisit: string;
  totalVisits: number;
  status: PatientStatus;
  condition: string;
}

const SEED: Patient[] = [
  { id: "#MC-9021", name: "Ahmed Khan", phone: "+92 300 1234567", age: 34, gender: "Male", lastVisit: "2026-06-28", totalVisits: 5, status: "Active", condition: "GERD" },
  { id: "#MC-7712", name: "Sara Malik", phone: "+92 321 9876543", age: 28, gender: "Female", lastVisit: "2026-06-25", totalVisits: 3, status: "Follow-up", condition: "Hepatitis C" },
  { id: "#MC-1104", name: "Zainab Bibi", phone: "+92 333 4567890", age: 52, gender: "Female", lastVisit: "2026-06-20", totalVisits: 12, status: "Critical", condition: "Liver Cirrhosis" },
  { id: "#MC-4409", name: "Umar Farooq", phone: "+92 345 0001112", age: 41, gender: "Male", lastVisit: "2026-06-30", totalVisits: 8, status: "Active", condition: "Colonoscopy Follow-up" },
  { id: "#MC-1288", name: "Hina Asif", phone: "+92 322 1112233", age: 23, gender: "Female", lastVisit: "—", totalVisits: 1, status: "New", condition: "Abdominal Pain" },
  { id: "#MC-3341", name: "Bilal Ahmed", phone: "+92 331 9988776", age: 45, gender: "Male", lastVisit: "2026-06-15", totalVisits: 6, status: "Active", condition: "Dyspepsia" },
  { id: "#MC-5502", name: "Fatima Akhtar", phone: "+92 311 2345678", age: 38, gender: "Female", lastVisit: "2026-06-18", totalVisits: 4, status: "Follow-up", condition: "Hepatitis B" },
];

const STATUS_COLORS: Record<PatientStatus, string> = {
  Active: "bg-secondary/10 text-secondary",
  "Follow-up": "bg-surface-container-highest text-on-surface-variant",
  Critical: "bg-error/10 text-error",
  New: "bg-primary/10 text-primary",
};

const PAGE_SIZE = 5;

export default function PatientsContent() {
  const [patients, setPatients] = useState<Patient[]>(SEED);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      patients.filter((p) => {
        const matchSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.id.toLowerCase().includes(search.toLowerCase()) ||
          p.phone.includes(search) ||
          p.condition.toLowerCase().includes(search.toLowerCase());
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
    Critical: patients.filter((p) => p.status === "Critical").length,
    New: patients.filter((p) => p.status === "New").length,
  };

  const deletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  const exportCSV = () => {
    const rows = [
      ["ID", "Name", "Phone", "Age", "Gender", "Last Visit", "Total Visits", "Status", "Condition"],
      ...filtered.map((p) => [p.id, p.name, p.phone, p.age, p.gender, p.lastVisit, p.totalVisits, p.status, p.condition]),
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
            {patients.length} registered patients · {counts.Critical} critical · {counts.New} new
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
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
          {["All", "Active", "Follow-up", "Critical", "New"].map((s) => (
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
            placeholder="Search name, ID, condition…"
            className="pl-10 pr-sm py-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50 border-b border-outline-variant">
              {["Patient", "ID", "Age / Gender", "Condition", "Last Visit", "Visits", "Status", "Actions"].map((h, i) => (
                <th key={h} className={`px-md py-md font-semibold text-label-md text-on-surface-variant ${i === 7 ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {pageItems.length === 0 ? (
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
                  <td className="px-md py-md text-body-md text-on-surface-variant">{p.id}</td>
                  <td className="px-md py-md text-body-md">{p.age}y · {p.gender}</td>
                  <td className="px-md py-md text-body-md text-on-surface-variant">{p.condition}</td>
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
                      <button
                        onClick={() => setDeleteId(p.id)}
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

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-lg shadow-2xl max-w-sm w-full mx-md">
            <h3 className="text-headline-md font-bold text-on-surface mb-sm">Remove Patient?</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">
              This will remove patient {deleteId} from the directory.
            </p>
            <div className="flex gap-sm justify-end">
              <button onClick={() => setDeleteId(null)}
                className="px-md py-xs rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-high">
                Cancel
              </button>
              <button onClick={() => deletePatient(deleteId)}
                className="px-md py-xs rounded-xl bg-error text-on-error font-semibold hover:opacity-90">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

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
                ["ID", viewPatient.id],
                ["Name", viewPatient.name],
                ["Phone", viewPatient.phone],
                ["Age", `${viewPatient.age} years`],
                ["Gender", viewPatient.gender],
                ["Condition", viewPatient.condition],
                ["Status", viewPatient.status],
                ["Last Visit", viewPatient.lastVisit],
                ["Total Visits", String(viewPatient.totalVisits)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center border-b border-outline-variant/20 pb-sm">
                  <span className="text-caption text-on-surface-variant uppercase tracking-wider">{label}</span>
                  <span className="text-body-md font-semibold text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
