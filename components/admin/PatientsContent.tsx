"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import { createLetterheadPdf } from "@/lib/pdf/letterhead";

type PatientStatus = "Active" | "Follow-up" | "New";

interface Patient {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  lastVisit: string;
  totalVisits: number;
  status: PatientStatus;
  lastReason: string;
}

const STATUS_PILL: Record<PatientStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  "Follow-up": "bg-primary/10 text-primary",
  New: "bg-surface-variant text-outline",
};

/** Cycled per row purely for visual variety, matching the reference design's alternating avatar tints. */
const AVATAR_TINTS = [
  "bg-primary-fixed text-on-primary-fixed-variant",
  "bg-secondary-fixed text-on-secondary-fixed-variant",
  "bg-surface-container-highest text-on-surface-variant",
  "bg-tertiary-fixed text-on-tertiary-fixed-variant",
];

const PAGE_SIZE = 25;

function initialsOf(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

/** Windowed page numbers with ellipses, e.g. 1 2 3 … 125 for large result sets. */
function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export default function PatientsContent() {
  const doctor = useDoctorProfile();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [brokenAvatars, setBrokenAvatars] = useState<Set<string>>(new Set());

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
          p.id.toLowerCase().includes(search.toLowerCase()) ||
          p.lastReason.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "All" || p.status === statusFilter;
        const visitDate = p.lastVisit?.slice(0, 10);
        const matchFrom = !dateFrom || (visitDate && visitDate >= dateFrom);
        const matchTo = !dateTo || (visitDate && visitDate <= dateTo);
        return matchSearch && matchStatus && matchFrom && matchTo;
      }),
    [patients, search, statusFilter, dateFrom, dateTo]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportPDF = async () => {
    const { doc, headerHeight, renderTable, drawFooter } = await createLetterheadPdf(doctor, {
      title: "Patients Directory",
    });
    renderTable({
      startY: headerHeight + 6,
      headers: ["Name", "Patient ID", "Age/Gender", "Phone", "Email", "Last Visit", "Appointments", "Status"],
      rows: filtered.map((p) => [
        p.name,
        p.id,
        `${p.age ? `${p.age}y` : "—"} / ${p.gender ?? "—"}`,
        p.phone,
        p.email ?? "—",
        p.lastVisit || "—",
        p.totalVisits,
        p.status,
      ]),
      badgeColumns: ["Status"],
    });
    drawFooter();
    doc.save("patients.pdf");
  };

  return (
    <div className="max-w-container-max mx-auto px-gutter py-gutter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Patients Directory</h2>
          <p className="text-body-lg text-on-surface-variant">Manage and review your patient database</p>
        </div>
        <button
          onClick={exportPDF}
          className="flex items-center gap-xs px-md py-sm bg-surface-container-lowest border border-outline-variant/50 text-primary font-semibold text-label-md rounded-lg hover:bg-surface-container-low transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">ios_share</span> Export PDF
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm mb-lg border border-outline-variant/30 flex flex-wrap gap-md items-center">
        <div className="flex-1 min-w-60 relative">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 leading-none text-outline text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or patient ID…"
            className="w-full pl-10 pr-sm py-sm bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-xs">
          <label className="text-label-md text-outline">Last Visit</label>
          <div className="flex items-center bg-surface-container-low border border-outline-variant/30 rounded-lg px-xs">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="bg-transparent border-none py-sm text-body-md focus:ring-0"
            />
            <span className="text-outline mx-xs">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="bg-transparent border-none py-sm text-body-md focus:ring-0"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-sm py-sm bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-md text-on-surface"
        >
          {["All", "Active", "Follow-up", "New"].map((s) => (
            <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
          ))}
        </select>
      </div>

      {/* Patients Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-150">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant/30 sticky top-0 z-1">
              <tr>
                {["Patient Name", "Age/Gender", "Contact", "Last Visit", "Appointments", "Status", "Actions"].map((h, i, arr) => (
                  <th
                    key={h}
                    className={`px-md py-xs font-label-md text-label-md text-outline uppercase tracking-wider whitespace-nowrap ${
                      h === "Appointments" ? "text-center" : i === arr.length - 1 ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                    Loading patients…
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                    No patients match your search.
                  </td>
                </tr>
              ) : (
                pageItems.map((p, i) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-md py-xs">
                      <div className="flex items-center gap-sm">
                        {p.avatar && !brokenAvatars.has(p.id) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.avatar}
                            alt={p.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover shrink-0 border border-outline-variant/30"
                            onError={() => setBrokenAvatars((prev) => new Set(prev).add(p.id))}
                          />
                        ) : (
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold shrink-0 ${AVATAR_TINTS[i % AVATAR_TINTS.length]}`}>
                            {initialsOf(p.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-body-md text-on-surface truncate">{p.name}</p>
                          <p className="text-caption text-outline">ID: #{p.id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-md py-xs text-body-md whitespace-nowrap">
                      {p.age ? `${p.age}y` : "—"}, {p.gender ?? "—"}
                    </td>
                    <td className="px-md py-xs text-body-md">
                      <p className="text-on-surface whitespace-nowrap">{p.phone}</p>
                      {p.email && <p className="text-caption text-outline">{p.email}</p>}
                    </td>
                    <td className="px-md py-xs text-body-md whitespace-nowrap">{p.lastVisit || "—"}</td>
                    <td className="px-md py-xs text-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-surface-container-high text-on-surface-variant text-label-md font-semibold">
                        {p.totalVisits}
                      </span>
                    </td>
                    <td className="px-md py-xs">
                      <span className={`px-sm py-0.5 ${STATUS_PILL[p.status]} font-bold text-[11px] rounded-full uppercase tracking-tighter whitespace-nowrap`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-md py-xs text-right">
                      <div className="flex items-center justify-end gap-xs">
                        <div className="relative group/tip">
                          <button
                            onClick={() => router.push(`/admin/patients/${p.id}`)}
                            className="p-xs text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                            View Profile
                          </span>
                        </div>
                        <div className="relative group/tip">
                          {p.email ? (
                            <a
                              href={`mailto:${p.email}`}
                              className="p-xs text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-all block"
                            >
                              <span className="material-symbols-outlined text-[20px]">mail</span>
                            </a>
                          ) : (
                            <button disabled className="p-xs text-outline opacity-40 cursor-not-allowed rounded-lg">
                              <span className="material-symbols-outlined text-[20px]">mail</span>
                            </button>
                          )}
                          <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                            {p.email ? "Message" : "No email on file"}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-md py-md bg-surface-container-low/30 border-t border-outline-variant/30 flex items-center justify-between">
          <p className="text-caption text-outline">
            Showing {pageItems.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {(page - 1) * PAGE_SIZE + pageItems.length} of {filtered.length} patients
          </p>
          <div className="flex items-center gap-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded border border-outline-variant/30 text-outline hover:bg-surface-container-high disabled:opacity-30 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {pageWindow(page, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`e${i}`} className="text-outline px-xs">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 px-xs min-w-8 flex items-center justify-center rounded text-label-md font-semibold transition-colors ${
                    page === p ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded border border-outline-variant/30 text-outline hover:bg-surface-container-high disabled:opacity-30 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
