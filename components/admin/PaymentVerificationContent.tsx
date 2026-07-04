"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";

type Status = "Pending" | "Verified" | "Rejected";
type Method = "JazzCash" | "Easypaisa" | "Stripe";

interface PaymentRow {
  id: string;
  name: string;
  phone: string;
  apt: string;
  method: Method;
  txn: string;
  amountNum: number;
  status: Status;
  date: string;
}

const SEED: PaymentRow[] = [
  { id: "1", name: "Ahmed Khan",   phone: "+92 300 1234567", apt: "#APT-9042", method: "JazzCash",  txn: "998234120", amountNum: 2500, status: "Pending",  date: "2026-07-01" },
  { id: "2", name: "Sara Malik",   phone: "+92 321 9876543", apt: "#APT-8921", method: "Easypaisa", txn: "881230041", amountNum: 3200, status: "Pending",  date: "2026-07-01" },
  { id: "3", name: "Zainab Bibi",  phone: "+92 333 4567890", apt: "#APT-8899", method: "JazzCash",  txn: "772134590", amountNum: 1500, status: "Pending",  date: "2026-06-30" },
  { id: "4", name: "Umar Farooq", phone: "+92 345 0001112", apt: "#APT-8876", method: "Easypaisa", txn: "554321098", amountNum: 4000, status: "Pending",  date: "2026-06-30" },
  { id: "5", name: "Hina Asif",   phone: "+92 322 1112233", apt: "#APT-8801", method: "Stripe",    txn: "cs_test_abc123", amountNum: 2500, status: "Verified", date: "2026-06-29" },
  { id: "6", name: "Bilal Ahmed",  phone: "+92 331 9988776", apt: "#APT-8755", method: "JazzCash",  txn: "331209876", amountNum: 3200, status: "Rejected", date: "2026-06-28" },
];

const METHOD_DOT: Record<Method, string> = {
  JazzCash:  "bg-[#f64c1c]",
  Easypaisa: "bg-[#1db04e]",
  Stripe:    "bg-primary",
};

const STATUS_STYLE: Record<Status, string> = {
  Pending:  "bg-[#EEF2FF] text-[#3730A3]",
  Verified: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
};

const summaryCards = [
  { icon: "pending_actions", color: "text-primary bg-primary/10",     label: "Pending",      key: "Pending"  },
  { icon: "verified",        color: "text-secondary bg-secondary/10", label: "Verified Today", key: "Verified" },
  { icon: "cancel",          color: "text-error bg-error/10",         label: "Rejected",     key: "Rejected" },
  { icon: "sync_alt",        color: "text-on-surface-variant bg-surface-variant", label: "Stripe (Auto)", key: "Stripe" },
];

export default function PaymentVerificationContent() {
  const [rows, setRows] = useState<PaymentRow[]>(SEED);
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]   = useState("");
  const [search, setSearch]   = useState("");
  const [verifyTarget, setVerifyTarget] = useState<PaymentRow | null>(null);
  const [notes, setNotes]     = useState("");
  const [approving, setApproving] = useState(false);

  const filtered = useMemo(() => rows.filter((r) => {
    if (methodFilter !== "All" && r.method !== methodFilter) return false;
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (dateFrom && r.date < dateFrom) return false;
    if (dateTo   && r.date > dateTo)   return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
        !r.apt.toLowerCase().includes(search.toLowerCase()) &&
        !r.txn.includes(search)) return false;
    return true;
  }), [rows, methodFilter, statusFilter, dateFrom, dateTo, search]);

  const counts = {
    Pending:  rows.filter((r) => r.status === "Pending").length,
    Verified: rows.filter((r) => r.status === "Verified").length,
    Rejected: rows.filter((r) => r.status === "Rejected").length,
    Stripe:   rows.filter((r) => r.method === "Stripe").length,
  };

  function handleApprove() {
    if (!verifyTarget) return;
    setApproving(true);
    setTimeout(() => {
      setRows((prev) => prev.map((r) => r.id === verifyTarget.id ? { ...r, status: "Verified" } : r));
      setApproving(false);
      setVerifyTarget(null);
      setNotes("");
      toast.success("Payment verified successfully");
    }, 1000);
  }

  function handleReject() {
    if (!verifyTarget) return;
    setRows((prev) => prev.map((r) => r.id === verifyTarget.id ? { ...r, status: "Rejected" } : r));
    setVerifyTarget(null);
    setNotes("");
    toast.info("Payment rejected");
  }

  function exportCSV() {
    const header = ["Name", "Phone", "Appointment", "Method", "TXN", "Amount (PKR)", "Status", "Date"];
    const csvRows = filtered.map((r) => [r.name, r.phone, r.apt, r.method, r.txn, r.amountNum, r.status, r.date]);
    const csv = [header, ...csvRows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const label = dateFrom && dateTo ? `${dateFrom}_to_${dateTo}` : "all";
    a.download = `payments_${label}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-gutter py-lg overflow-y-auto h-[calc(100vh-72px)]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Payment Verification</h2>
          <p className="text-body-md text-on-surface-variant">Review uploaded payment receipts and approve or reject payments.</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-xs px-md py-xs bg-primary text-on-primary rounded-xl text-label-md font-semibold hover:opacity-90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {summaryCards.map((c) => (
          <div key={c.label} className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-sm mb-xs">
              <span className={`material-symbols-outlined p-xs rounded-lg ${c.color}`}>{c.icon}</span>
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider">{c.label}</span>
            </div>
            <span className="text-3xl font-bold text-on-surface">
              {counts[c.key as keyof typeof counts]}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md mb-lg shadow-sm flex flex-wrap items-center gap-md">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, TXN, appointment…"
            className="pl-10 pr-sm py-xs w-full bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Method */}
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-sm py-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-all"
        >
          {["All", "JazzCash", "Easypaisa", "Stripe"].map((m) => (
            <option key={m} value={m}>{m === "All" ? "All Methods" : m}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-sm py-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-all"
        >
          {["All", "Pending", "Verified", "Rejected"].map((s) => (
            <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
          ))}
        </select>

        {/* Date range */}
        <div className="flex items-center gap-xs">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-sm py-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-all"
          />
          <span className="text-on-surface-variant text-body-md">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-sm py-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {(methodFilter !== "All" || statusFilter !== "All" || dateFrom || dateTo || search) && (
          <button
            onClick={() => { setMethodFilter("All"); setStatusFilter("All"); setDateFrom(""); setDateTo(""); setSearch(""); }}
            className="text-label-md text-primary hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/60 border-b border-outline-variant">
              {["Patient", "Phone Number", "Appointment", "ID / Method", "Amount", "Status", "Actions"].map((h) => (
                <th key={h} className="px-md py-md text-label-md font-semibold text-on-surface-variant uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                  No payments match your filters.
                </td>
              </tr>
            ) : filtered.map((row) => (
              <tr
                key={row.id}
                className={`transition-colors border-l-4 ${
                  verifyTarget?.id === row.id
                    ? "border-l-primary bg-primary/5"
                    : "border-l-transparent hover:bg-surface-container-low"
                }`}
              >
                <td className="px-md py-md font-bold text-body-md text-on-surface whitespace-nowrap">{row.name}</td>
                <td className="px-md py-md text-body-md text-on-surface-variant whitespace-nowrap">{row.phone}</td>
                <td className="px-md py-md text-body-md text-on-surface-variant">{row.apt}</td>
                <td className="px-md py-md">
                  <div className="flex items-center gap-xs font-semibold text-body-md text-on-surface">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${METHOD_DOT[row.method]}`} />
                    {row.method}
                  </div>
                  <div className="text-caption text-outline mt-[2px]">TXN: {row.txn}</div>
                </td>
                <td className="px-md py-md font-bold text-body-md text-on-surface whitespace-nowrap">
                  PKR {row.amountNum.toLocaleString()}
                </td>
                <td className="px-md py-md">
                  <span className={`px-sm py-[3px] rounded-full text-caption font-bold uppercase tracking-wide ${STATUS_STYLE[row.status]}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-md py-md">
                  <div className="flex items-center gap-xs">
                    {row.status === "Pending" ? (
                      <button
                        onClick={() => { setVerifyTarget(row); setNotes(""); }}
                        className="flex items-center gap-xs bg-primary text-on-primary text-label-md font-semibold px-sm py-xs rounded-lg hover:opacity-90 transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        Verify
                      </button>
                    ) : (
                      <span className={`text-label-md font-semibold ${row.status === "Verified" ? "text-green-600" : "text-error"}`}>
                        {row.status}
                      </span>
                    )}
                    <button className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-md py-sm border-t border-outline-variant/20">
          <p className="text-caption text-on-surface-variant">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""} · PKR{" "}
            {filtered.reduce((s, r) => s + r.amountNum, 0).toLocaleString()} total
          </p>
        </div>
      </div>

      {/* Verify Modal */}
      {verifyTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-md">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/30">
              <div>
                <h4 className="text-headline-md font-bold text-on-surface">Verify Payment</h4>
                <p className="text-body-md text-on-surface-variant">{verifyTarget.name} · {verifyTarget.apt}</p>
              </div>
              <button onClick={() => setVerifyTarget(null)} className="p-xs rounded-lg hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-lg py-md space-y-md">
              {/* Receipt image */}
              <div className="relative group bg-surface-container rounded-xl overflow-hidden border border-outline-variant h-64">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqwLSGa6-wiWL6JcLOTHFkzpqFP2PN6lui0n0el6Tf78h_lsyXZFBR3-MNUIRN17MR0SY6ezUMtfHzp87jUGdW7e52nmc63GHnCq-yxEPK-7dWX5v_wgG_foD0YHRnWJOP-Eglal4z2OOyCgN-fiFlimI_bFX5YchUQrS2nnrXmGQwMv-4Dg-WsaZRqF7YuEqEo3IGmLN3KCnACP_zFLiF8t_uW-Ve9-DdJx-HBu-FkYy30chpCLm0HRFE"
                  alt="Receipt" fill className="object-contain" unoptimized
                />
                <div className="absolute bottom-sm left-1/2 -translate-x-1/2 flex gap-xs bg-inverse-surface/80 backdrop-blur rounded-full p-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {["zoom_in", "fullscreen"].map((icon) => (
                    <button key={icon} className="p-xs text-on-primary hover:bg-white/20 rounded-full">
                      <span className="material-symbols-outlined">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-sm">
                <div className="p-sm bg-surface-container-low rounded-lg">
                  <p className="text-caption text-outline uppercase tracking-tight mb-[2px]">Transaction ID</p>
                  <p className="font-bold text-on-surface text-body-md">{verifyTarget.txn}</p>
                </div>
                <div className="p-sm bg-surface-container-low rounded-lg">
                  <p className="text-caption text-outline uppercase tracking-tight mb-[2px]">Amount</p>
                  <p className="font-bold text-primary text-body-lg">PKR {verifyTarget.amountNum.toLocaleString()}</p>
                </div>
                <div className="p-sm bg-surface-container-low rounded-lg">
                  <p className="text-caption text-outline uppercase tracking-tight mb-[2px]">Method</p>
                  <div className="flex items-center gap-xs font-semibold text-body-md">
                    <div className={`w-2 h-2 rounded-full ${METHOD_DOT[verifyTarget.method]}`} />
                    {verifyTarget.method}
                  </div>
                </div>
                <div className="p-sm bg-surface-container-low rounded-lg">
                  <p className="text-caption text-outline uppercase tracking-tight mb-[2px]">Date</p>
                  <p className="font-bold text-on-surface text-body-md">{verifyTarget.date}</p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-label-md text-on-surface block mb-xs">Internal Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 text-body-md p-sm resize-none outline-none"
                  placeholder="Add private notes…"
                  rows={2}
                />
              </div>
            </div>

            {/* Modal actions */}
            <div className="px-lg py-md border-t border-outline-variant/20 flex gap-sm">
              <button
                onClick={handleReject}
                className="flex-1 border border-error text-error font-bold py-sm rounded-xl hover:bg-error/5 transition-all flex items-center justify-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">block</span> Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex-1 bg-primary text-on-primary font-bold py-sm rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-xs disabled:opacity-70"
              >
                {approving
                  ? <><span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> Processing…</>
                  : <><span className="material-symbols-outlined text-[18px]">verified</span> Approve</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
