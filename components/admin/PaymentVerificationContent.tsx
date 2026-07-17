"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import { createLetterheadPdf } from "@/lib/pdf/letterhead";

interface ApiPayment {
  _id: string;
  appointmentId: { _id: string; appointmentNumber: string; patientSnapshot: { fullName: string; phone: string } } | string;
  method: PaymentMethod;
  amountPkr: number;
  status: PaymentStatus;
  transactionRef?: string;
  receiptUrl?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
}

const METHOD_DOT: Record<PaymentMethod, string> = {
  jazzcash: "bg-[#f64c1c]",
  easypaisa: "bg-[#1db04e]",
  stripe: "bg-primary",
  reception: "bg-amber-500",
};

const METHOD_LABEL: Record<PaymentMethod, string> = {
  jazzcash: "JazzCash",
  easypaisa: "Easypaisa",
  stripe: "Stripe",
  reception: "Reception",
};

const STATUS_STYLE: Record<PaymentStatus, string> = {
  pending: "bg-[#EEF2FF] text-[#3730A3]",
  submitted: "bg-[#EEF2FF] text-[#3730A3]",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-surface-container-highest text-on-surface-variant",
};

function appointmentInfo(appointmentId: ApiPayment["appointmentId"]) {
  if (typeof appointmentId === "string") {
    return { number: appointmentId, name: "—", phone: "—" };
  }
  return {
    number: appointmentId?.appointmentNumber ?? "—",
    name: appointmentId?.patientSnapshot?.fullName ?? "—",
    phone: appointmentId?.patientSnapshot?.phone ?? "—",
  };
}

export default function PaymentVerificationContent() {
  const doctor = useDoctorProfile();
  const [rows, setRows] = useState<ApiPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [verifyTarget, setVerifyTarget] = useState<ApiPayment | null>(null);
  const [notes, setNotes] = useState("");
  const [approving, setApproving] = useState(false);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [deletingReceipt, setDeletingReceipt] = useState(false);

  const loadPayments = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (res.ok) setRows(data.payments ?? []);
      else if (!silent) toast.error(data.error ?? "Could not load payments");
    } catch {
      if (!silent) toast.error("Network error loading payments");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadPayments();
    })();
    // Polls so newly-submitted receipts and Stripe confirmations show up
    // without the admin needing to manually refresh.
    const interval = setInterval(() => loadPayments(true), 20000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    if (methodFilter !== "All" && r.method !== methodFilter) return false;
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    const date = r.createdAt?.slice(0, 10);
    if (dateFrom && date < dateFrom) return false;
    if (dateTo && date > dateTo) return false;
    if (search) {
      const info = appointmentInfo(r.appointmentId);
      const haystack = `${info.name} ${info.number} ${r.transactionRef ?? ""}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  }), [rows, methodFilter, statusFilter, dateFrom, dateTo, search]);

  const counts = {
    Pending: rows.filter((r) => r.status === "pending" || r.status === "submitted").length,
    Verified: rows.filter((r) => r.status === "verified").length,
    Rejected: rows.filter((r) => r.status === "rejected").length,
    Stripe: rows.filter((r) => r.method === "stripe").length,
  };

  const summaryCards = [
    { icon: "pending_actions", color: "text-primary bg-primary/10", label: "Pending", key: "Pending" },
    { icon: "verified", color: "text-secondary bg-secondary/10", label: "Verified", key: "Verified" },
    { icon: "cancel", color: "text-error bg-error/10", label: "Rejected", key: "Rejected" },
    { icon: "sync_alt", color: "text-on-surface-variant bg-surface-variant", label: "Stripe (Auto)", key: "Stripe" },
  ];

  async function handleApprove() {
    if (!verifyTarget) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/payments/${verifyTarget._id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not verify payment");
        return;
      }
      setRows((prev) => prev.map((r) => (r._id === verifyTarget._id ? { ...r, status: "verified" } : r)));
      setVerifyTarget(null);
      setNotes("");
      toast.success("Payment verified successfully");
    } catch {
      toast.error("Network error");
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    if (!verifyTarget) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/payments/${verifyTarget._id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve: false, rejectionReason: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not reject payment");
        return;
      }
      setRows((prev) => prev.map((r) => (r._id === verifyTarget._id ? { ...r, status: "rejected" } : r)));
      setVerifyTarget(null);
      setNotes("");
      toast.info("Payment rejected");
    } catch {
      toast.error("Network error");
    } finally {
      setApproving(false);
    }
  }

  async function handleRefund(paymentId: string) {
    setRefundingId(paymentId);
    try {
      const res = await fetch(`/api/payments/${paymentId}/refund`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not process refund");
        return;
      }
      setRows((prev) => prev.map((r) => (r._id === paymentId ? { ...r, status: "refunded" } : r)));
      toast.success("Payment refunded");
    } catch {
      toast.error("Network error");
    } finally {
      setRefundingId(null);
    }
  }

  async function handleDeleteReceipt() {
    if (!verifyTarget) return;
    setDeletingReceipt(true);
    try {
      const res = await fetch(`/api/payments/${verifyTarget._id}/receipt`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not delete receipt");
        return;
      }
      setRows((prev) => prev.map((r) => (r._id === verifyTarget._id ? { ...r, receiptUrl: undefined } : r)));
      setVerifyTarget((prev) => (prev ? { ...prev, receiptUrl: undefined } : prev));
      toast.success("Receipt deleted");
    } catch {
      toast.error("Network error");
    } finally {
      setDeletingReceipt(false);
    }
  }

  async function exportPDF() {
    const header = ["Patient", "Phone", "Appointment", "Method", "Ref/TXN", "Amount (PKR)", "Status", "Date"];
    const bodyRows = filtered.map((r) => {
      const info = appointmentInfo(r.appointmentId);
      return [info.name, info.phone, info.number, METHOD_LABEL[r.method], r.transactionRef ?? "—", r.amountPkr.toLocaleString(), r.status, r.createdAt?.slice(0, 10) ?? "—"];
    });
    const { doc, headerHeight, renderTable, drawFooter } = await createLetterheadPdf(doctor, { title: "Payments" });
    renderTable({ startY: headerHeight + 6, headers: header, rows: bodyRows, badgeColumns: ["Status"] });
    drawFooter();
    const label = dateFrom && dateTo ? `${dateFrom}_to_${dateTo}` : "all";
    doc.save(`payments_${label}.pdf`);
  }

  const verifyInfo = verifyTarget ? appointmentInfo(verifyTarget.appointmentId) : null;
  const isImageReceipt = verifyTarget?.receiptUrl && !/\.pdf($|\?)/i.test(verifyTarget.receiptUrl);
  const canVerifyTarget =
    !!verifyTarget &&
    ((verifyTarget.status === "submitted" && verifyTarget.method !== "stripe") ||
      (verifyTarget.status === "pending" && verifyTarget.method === "reception"));

  return (
    <div className="px-gutter py-lg overflow-y-auto h-[calc(100vh-72px)]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Payment Verification</h2>
          <p className="text-body-md text-on-surface-variant">Review uploaded payment receipts and approve or reject payments.</p>
        </div>
        <button
          onClick={exportPDF}
          className="flex items-center gap-xs px-md py-xs bg-primary text-on-primary rounded-xl text-label-md font-semibold hover:opacity-90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export PDF
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
          {["All", "jazzcash", "easypaisa", "stripe", "reception"].map((m) => (
            <option key={m} value={m}>{m === "All" ? "All Methods" : METHOD_LABEL[m as PaymentMethod]}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-sm py-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-all"
        >
          {["All", "pending", "submitted", "verified", "rejected", "failed", "refunded"].map((s) => (
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
            {loading ? (
              <tr>
                <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                  Loading payments…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                  No payments match your filters.
                </td>
              </tr>
            ) : filtered.map((row) => {
              const info = appointmentInfo(row.appointmentId);
              const canVerify =
                (row.status === "submitted" && row.method !== "stripe") ||
                (row.status === "pending" && row.method === "reception");
              const canRefund = row.status === "verified" && row.method === "stripe";
              return (
                <tr
                  key={row._id}
                  className={`transition-colors border-l-4 ${
                    verifyTarget?._id === row._id
                      ? "border-l-primary bg-primary/5"
                      : "border-l-transparent hover:bg-surface-container-low"
                  }`}
                >
                  <td className="px-md py-md font-bold text-body-md text-on-surface whitespace-nowrap">{info.name}</td>
                  <td className="px-md py-md text-body-md text-on-surface-variant whitespace-nowrap">{info.phone}</td>
                  <td className="px-md py-md text-body-md text-on-surface-variant">{info.number}</td>
                  <td className="px-md py-md">
                    <div className="flex items-center gap-xs font-semibold text-body-md text-on-surface">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${METHOD_DOT[row.method]}`} />
                      {METHOD_LABEL[row.method]}
                    </div>
                    {row.transactionRef && <div className="text-caption text-outline mt-[2px]">TXN: {row.transactionRef}</div>}
                  </td>
                  <td className="px-md py-md font-bold text-body-md text-on-surface whitespace-nowrap">
                    PKR {row.amountPkr.toLocaleString()}
                  </td>
                  <td className="px-md py-md">
                    <span className={`px-sm py-[3px] rounded-full text-caption font-bold uppercase tracking-wide ${STATUS_STYLE[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-md py-md">
                    <div className="flex items-center gap-xs">
                      {canVerify ? (
                        <button
                          onClick={() => { setVerifyTarget(row); setNotes(""); }}
                          className="flex items-center gap-xs bg-primary text-on-primary text-label-md font-semibold px-sm py-xs rounded-lg hover:opacity-90 transition-all shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          {row.method === "reception" ? "Mark as Paid" : "Verify"}
                        </button>
                      ) : canRefund ? (
                        <button
                          disabled={refundingId === row._id}
                          onClick={() => handleRefund(row._id)}
                          className="flex items-center gap-xs border border-error text-error text-label-md font-semibold px-sm py-xs rounded-lg hover:bg-error/5 transition-all disabled:opacity-60"
                        >
                          <span className="material-symbols-outlined text-[16px]">undo</span>
                          {refundingId === row._id ? "Refunding…" : "Refund"}
                        </button>
                      ) : (
                        <span className={`text-label-md font-semibold ${row.status === "verified" ? "text-green-600" : row.status === "rejected" || row.status === "failed" ? "text-error" : "text-on-surface-variant"}`}>
                          {row.status === "pending" ? "Awaiting Payment" : row.status}
                        </span>
                      )}
                      {!canVerify && row.method !== "stripe" && row.method !== "reception" && row.receiptUrl && (
                        <button
                          onClick={() => { setVerifyTarget(row); setNotes(""); }}
                          className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                          title="View Receipt"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-md py-sm border-t border-outline-variant/20">
          <p className="text-caption text-on-surface-variant">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""} · PKR{" "}
            {filtered.reduce((s, r) => s + r.amountPkr, 0).toLocaleString()} total
          </p>
        </div>
      </div>

      {/* Verify Modal */}
      {verifyTarget && verifyInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-md">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/30">
              <div>
                <h4 className="text-headline-md font-bold text-on-surface">
                  {verifyTarget.method === "reception" ? "Mark Payment as Paid" : "Verify Payment"}
                </h4>
                <p className="text-body-md text-on-surface-variant">{verifyInfo.name} · {verifyInfo.number}</p>
              </div>
              <button onClick={() => setVerifyTarget(null)} className="p-xs rounded-lg hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-lg py-md space-y-md">
              {/* Receipt image (JazzCash/Easypaisa only — reception has no receipt) */}
              {verifyTarget.method !== "reception" && (
                verifyTarget.receiptUrl ? (
                  isImageReceipt ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={verifyTarget.receiptUrl}
                      alt="Payment receipt"
                      className="w-full h-64 object-contain bg-surface-container rounded-xl border border-outline-variant"
                    />
                  ) : (
                    <a
                      href={verifyTarget.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-xs h-64 bg-surface-container rounded-xl border border-outline-variant text-primary font-semibold hover:underline"
                    >
                      <span className="material-symbols-outlined">picture_as_pdf</span>
                      Open Receipt (PDF)
                    </a>
                  )
                ) : (
                  <div className="flex items-center justify-center h-64 bg-surface-container rounded-xl border border-outline-variant text-on-surface-variant">
                    No receipt on file
                  </div>
                )
              )}

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                <div className="p-sm bg-surface-container-low rounded-lg">
                  <p className="text-caption text-outline uppercase tracking-tight mb-[2px]">Transaction Ref</p>
                  <p className="font-bold text-on-surface text-body-md">{verifyTarget.transactionRef || "—"}</p>
                </div>
                <div className="p-sm bg-surface-container-low rounded-lg">
                  <p className="text-caption text-outline uppercase tracking-tight mb-[2px]">Amount</p>
                  <p className="font-bold text-primary text-body-lg">PKR {verifyTarget.amountPkr.toLocaleString()}</p>
                </div>
                <div className="p-sm bg-surface-container-low rounded-lg">
                  <p className="text-caption text-outline uppercase tracking-tight mb-[2px]">Method</p>
                  <div className="flex items-center gap-xs font-semibold text-body-md">
                    <div className={`w-2 h-2 rounded-full ${METHOD_DOT[verifyTarget.method]}`} />
                    {METHOD_LABEL[verifyTarget.method]}
                  </div>
                </div>
                <div className="p-sm bg-surface-container-low rounded-lg">
                  <p className="text-caption text-outline uppercase tracking-tight mb-[2px]">Date</p>
                  <p className="font-bold text-on-surface text-body-md">{verifyTarget.createdAt?.slice(0, 10)}</p>
                </div>
              </div>

              {/* Notes (rejection isn't applicable to reception — payment either was collected or wasn't) */}
              {canVerifyTarget && verifyTarget.method !== "reception" && (
                <div>
                  <label className="text-label-md text-on-surface block mb-xs">Rejection reason / notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 text-body-md p-sm resize-none outline-none"
                    placeholder="Add private notes…"
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div className="px-lg py-md border-t border-outline-variant/20 flex gap-sm">
              {canVerifyTarget ? (
                <>
                  {verifyTarget.method !== "reception" && (
                    <button
                      onClick={handleReject}
                      disabled={approving}
                      className="flex-1 border border-error text-error font-bold py-sm rounded-xl hover:bg-error/5 transition-all flex items-center justify-center gap-xs disabled:opacity-70"
                    >
                      <span className="material-symbols-outlined text-[18px]">block</span> Reject
                    </button>
                  )}
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex-1 bg-primary text-on-primary font-bold py-sm rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-xs disabled:opacity-70"
                  >
                    {approving
                      ? <><span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> Processing…</>
                      : <><span className="material-symbols-outlined text-[18px]">verified</span> {verifyTarget.method === "reception" ? "Mark as Paid" : "Approve"}</>
                    }
                  </button>
                </>
              ) : (
                verifyTarget.receiptUrl && (
                  <button
                    onClick={handleDeleteReceipt}
                    disabled={deletingReceipt}
                    className="flex-1 border border-error text-error font-bold py-sm rounded-xl hover:bg-error/5 transition-all flex items-center justify-center gap-xs disabled:opacity-70"
                  >
                    {deletingReceipt
                      ? <><span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> Deleting…</>
                      : <><span className="material-symbols-outlined text-[18px]">delete</span> Delete Receipt</>
                    }
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
