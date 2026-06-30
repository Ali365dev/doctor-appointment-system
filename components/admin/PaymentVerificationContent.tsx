"use client";

import Image from "next/image";
import { useState } from "react";

const queue = [
  { name: "Ahmed Khan", phone: "+92 300 1234567", apt: "#APT-9042", method: "JazzCash", methodDot: "bg-[#f64c1c]", txn: "998234120", amount: "PKR 2,500" },
  { name: "Sara Malik", phone: "+92 321 9876543", apt: "#APT-8921", method: "Easypaisa", methodDot: "bg-[#1db04e]", txn: "881230041", amount: "PKR 3,200" },
  { name: "Zainab Bibi", phone: "+92 333 4567890", apt: "#APT-8899", method: "JazzCash", methodDot: "bg-[#f64c1c]", txn: "772134590", amount: "PKR 1,500" },
  { name: "Umar Farooq", phone: "+92 345 0001112", apt: "#APT-8876", method: "Easypaisa", methodDot: "bg-[#1db04e]", txn: "554321098", amount: "PKR 4,000" },
];

const summaryCards = [
  { icon: "pending_actions", color: "text-primary bg-primary/10", label: "Pending", value: "8", sub: "+3 today", subCls: "text-error" },
  { icon: "verified", color: "text-secondary bg-secondary/10", label: "Verified Today", value: "24", sub: null, subCls: "" },
  { icon: "cancel", color: "text-error bg-error/10", label: "Rejected", value: "2", sub: null, subCls: "" },
  { icon: "sync_alt", color: "text-on-surface-variant bg-surface-variant", label: "Stripe (Auto)", value: "112", sub: null, subCls: "" },
];

export default function PaymentVerificationContent() {
  const [selectedRow, setSelectedRow] = useState(0);
  const [notes, setNotes] = useState("");
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  function handleApprove() {
    setApproving(true);
    setTimeout(() => {
      setApproving(false);
      setApproved(true);
      setTimeout(() => setApproved(false), 3000);
    }, 1200);
  }

  const selected = queue[selectedRow];

  return (
    <div className="px-gutter py-lg overflow-y-auto h-[calc(100vh-72px)]">
      {/* Page Header */}
      <div className="mb-lg">
        <h2 className="text-headline-lg font-bold text-on-surface">Payment Verification</h2>
        <p className="text-body-md text-on-surface-variant">Review uploaded payment receipts and approve or reject payments.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-xl">
        {summaryCards.map((c) => (
          <div key={c.label} className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-sm mb-xs">
              <span className={`material-symbols-outlined p-xs rounded-lg ${c.color}`}>{c.icon}</span>
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider">{c.label}</span>
            </div>
            <div className="flex items-baseline gap-xs">
              <span className="text-3xl font-bold text-on-surface">{c.value}</span>
              {c.sub && <span className={`text-sm font-medium ${c.subCls}`}>{c.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-12 gap-gutter items-start">
        {/* Queue Table */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm h-[600px] flex flex-col">
          <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright/50">
            <h3 className="text-headline-md font-semibold text-on-surface">Verification Queue</h3>
            <button className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-sm">filter_list</span>
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-low/80 backdrop-blur text-on-surface-variant text-label-md uppercase">
                <tr>
                  {["Patient","Phone","Appointment","ID / Method","Amount","Status","Action"].map((h) => (
                    <th key={h} className="px-md py-sm">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {queue.map((row, idx) => (
                  <tr
                    key={row.txn}
                    onClick={() => setSelectedRow(idx)}
                    className={`cursor-pointer transition-colors ${selectedRow === idx ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-surface-container-low"}`}
                  >
                    <td className="px-md py-md font-bold text-on-surface">{row.name}</td>
                    <td className="px-md py-md text-body-md text-on-surface">{row.phone}</td>
                    <td className="px-md py-md text-caption text-on-surface-variant">{row.apt}</td>
                    <td className="px-md py-md">
                      <div className="flex items-center gap-xs font-medium">
                        <div className={`w-2 h-2 rounded-full ${row.methodDot}`} />
                        {row.method}
                      </div>
                      <div className="text-caption text-outline">TXN: {row.txn}</div>
                    </td>
                    <td className="px-md py-md font-bold">{row.amount}</td>
                    <td className="px-md py-md">
                      <span className="px-xs py-[2px] rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-caption font-bold">PENDING</span>
                    </td>
                    <td className="px-md py-md">
                      <div className="flex items-center gap-xs">
                        <button className="p-xs rounded-lg text-green-600 hover:bg-primary/10 transition-colors" title="Approve">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                        </button>
                        <button className="p-xs rounded-lg text-error hover:bg-error/10 transition-colors" title="Reject">
                          <span className="material-symbols-outlined text-sm">cancel</span>
                        </button>
                        <button className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" title="More">
                          <span className="material-symbols-outlined text-sm">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Receipt Review Panel */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-md">
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-md">
            <div className="flex justify-between items-start mb-md">
              <div>
                <h4 className="text-headline-md font-semibold text-on-surface">Verification Details</h4>
                <p className="text-sm text-on-surface-variant">Patient: {selected.name} • May 14, 2024</p>
              </div>
              <span className="px-sm py-xs bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">Selected</span>
            </div>

            {/* Receipt Image */}
            <div className="relative group bg-surface-container rounded-lg overflow-hidden border border-outline-variant mb-md h-80">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqwLSGa6-wiWL6JcLOTHFkzpqFP2PN6lui0n0el6Tf78h_lsyXZFBR3-MNUIRN17MR0SY6ezUMtfHzp87jUGdW7e52nmc63GHnCq-yxEPK-7dWX5v_wgG_foD0YHRnWJOP-Eglal4z2OOyCgN-fiFlimI_bFX5YchUQrS2nnrXmGQwMv-4Dg-WsaZRqF7YuEqEo3IGmLN3KCnACP_zFLiF8t_uW-Ve9-DdJx-HBu-FkYy30chpCLm0HRFE"
                  alt="Payment Receipt" fill className="object-contain transition-transform duration-300" unoptimized
                />
              </div>
              <div className="absolute bottom-md left-1/2 -translate-x-1/2 flex gap-xs bg-inverse-surface/80 backdrop-blur rounded-full p-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {["zoom_in","rotate_right","fullscreen"].map((icon) => (
                  <button key={icon} className="p-xs text-on-primary hover:bg-white/20 rounded-full transition-colors">
                    <span className="material-symbols-outlined">{icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-sm mb-md">
              <div className="p-sm bg-surface-container-low rounded-lg">
                <p className="text-caption text-outline font-medium uppercase tracking-tight">Transaction ID</p>
                <p className="font-bold text-on-surface">{selected.txn}</p>
              </div>
              <div className="p-sm bg-surface-container-low rounded-lg">
                <p className="text-caption text-outline font-medium uppercase tracking-tight">Amount To Verify</p>
                <p className="font-bold text-primary text-lg">{selected.amount}</p>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="mb-lg">
              <label className="text-label-md text-on-surface block mb-xs">Admin Internal Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-outline p-sm resize-none outline-none"
                placeholder="Add private notes for the records..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-sm">
              <button
                onClick={handleApprove}
                disabled={approving}
                className={`w-full font-bold py-sm px-md rounded-xl shadow-lg transition-all flex items-center justify-center gap-xs ${approved ? "bg-secondary text-on-secondary" : "bg-primary text-on-primary hover:bg-primary-container shadow-primary/20"} disabled:opacity-70`}
              >
                {approving
                  ? <><span className="material-symbols-outlined animate-spin">refresh</span> Processing...</>
                  : approved
                    ? <><span className="material-symbols-outlined">check_circle</span> Verified</>
                    : <><span className="material-symbols-outlined">check_circle</span> Approve Payment</>
                }
              </button>
              <div className="grid grid-cols-2 gap-sm">
                <button className="bg-surface-container-lowest border border-error text-error hover:bg-error-container/50 font-bold py-sm px-md rounded-xl transition-all flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined text-sm">block</span> Cancel / Reject
                </button>
                <button className="bg-surface-container-lowest border border-outline text-on-surface-variant hover:bg-surface-container-low font-bold py-sm px-md rounded-xl transition-all flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined text-sm">refresh</span> Request New Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {approved && (
        <div className="fixed bottom-xl right-xl bg-inverse-surface text-on-primary-fixed-variant px-md py-sm rounded-xl shadow-2xl flex items-center gap-sm z-50">
          <span className="material-symbols-outlined text-primary-fixed-dim">verified_user</span>
          <span className="text-label-md">Payment Verified Successfully</span>
        </div>
      )}
    </div>
  );
}
