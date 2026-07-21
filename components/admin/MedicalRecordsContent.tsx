"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  STATUS_CONFIG,
  formatDate,
  formatDateTime,
  type Report,
  type ReportStatus,
  type Message,
} from "@/components/patient/reports/data";
import MedicalFileCard from "@/components/patient/reports/MedicalFileCard";
import PdfPreviewCard from "@/components/patient/reports/PdfPreviewCard";

interface AdminReport extends Report {
  patientName: string;
}

const FILTER_TABS: (ReportStatus | "all")[] = ["all", "pending", "reviewing", "replied", "closed"];

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function MedicalRecordsContent() {
  const searchParams = useSearchParams();
  const linkedReportId = searchParams.get("id");
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ReportStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusComposer, setFocusComposer] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [summary, setSummary] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [medicineChanges, setMedicineChanges] = useState<string[]>([]);
  const [recommendationDraft, setRecommendationDraft] = useState("");
  const [medicineDraft, setMedicineDraft] = useState("");
  const [replyText, setReplyText] = useState("");

  const composerRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadReports = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/medical-records");
      const data = await res.json();
      if (res.ok) setReports(data.reports ?? []);
      else if (!silent) toast.error(data.error ?? "Could not load medical records");
    } catch {
      if (!silent) toast.error("Network error loading medical records");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    const interval = setInterval(() => loadReports(true), 20000);
    return () => clearInterval(interval);
  }, []);

  // Deep-link support: /admin/medical-records?id=<reportId> opens that report
  // directly (e.g. from the Patient Details page's Uploaded Reports list).
  useEffect(() => {
    if (linkedReportId && reports.some((r) => r.id === linkedReportId)) {
      setSelectedId(linkedReportId);
    }
  }, [linkedReportId, reports]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: reports.length };
    for (const s of FILTER_TABS) {
      if (s === "all") continue;
      base[s] = reports.filter((r) => r.status === s).length;
    }
    return base;
  }, [reports]);

  const filtered = useMemo(() => {
    let list = reports;
    if (tab !== "all") list = list.filter((r) => r.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.title.toLowerCase().includes(q) || r.patientName.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reports, tab, search]);

  const selected = reports.find((r) => r.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) return;
    setSummary(selected.doctorReview?.summary ?? "");
    setRecommendations(selected.doctorReview?.recommendations ?? []);
    setMedicineChanges(selected.doctorReview?.medicineChanges ?? []);
  }, [selected?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.conversation.length]);

  useEffect(() => {
    if (focusComposer && selected) {
      composerRef.current?.focus();
      composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setFocusComposer(false);
    }
  }, [focusComposer, selected]);

  const openDetail = (id: string, jumpToComposer = false) => {
    setSelectedId(id);
    setFocusComposer(jumpToComposer);
  };

  const updateReportInState = (updated: Report) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/medical-records/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not delete report");
        return;
      }
      setReports((prev) => prev.filter((r) => r.id !== deleteId));
      if (selectedId === deleteId) setSelectedId(null);
      setDeleteId(null);
      toast.success("Report deleted");
    } catch {
      toast.error("Network error deleting report");
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (status: ReportStatus) => {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/medical-records/${selected.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update status");
        return;
      }
      updateReportInState(data.report);
      toast.success("Status updated");
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  const handleSendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("message", replyText.trim());
      const res = await fetch(`/api/medical-records/${selected.id}/messages`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not send message");
        return;
      }
      updateReportInState(data.report);
      setReplyText("");
      toast.success("Reply sent to patient");
    } catch {
      toast.error("Network error sending message");
    } finally {
      setBusy(false);
    }
  };

  const addRecommendation = () => {
    if (!recommendationDraft.trim()) return;
    setRecommendations((prev) => [...prev, recommendationDraft.trim()]);
    setRecommendationDraft("");
  };

  const addMedicineChange = () => {
    if (!medicineDraft.trim()) return;
    setMedicineChanges((prev) => [...prev, medicineDraft.trim()]);
    setMedicineDraft("");
  };

  const handleSaveReview = async () => {
    if (!selected || !summary.trim()) {
      toast.error("A clinical summary is required");
      return;
    }
    // Commit any text still sitting in the "add recommendation/medicine change"
    // inputs — otherwise clicking Save without first pressing Enter or "+"
    // silently drops it instead of saving it with the review.
    const finalRecommendations = recommendationDraft.trim()
      ? [...recommendations, recommendationDraft.trim()]
      : recommendations;
    const finalMedicineChanges = medicineDraft.trim() ? [...medicineChanges, medicineDraft.trim()] : medicineChanges;

    setBusy(true);
    try {
      const res = await fetch(`/api/medical-records/${selected.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: summary.trim(),
          recommendations: finalRecommendations,
          medicineChanges: finalMedicineChanges,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save review");
        return;
      }
      updateReportInState(data.report);
      setRecommendations(finalRecommendations);
      setMedicineChanges(finalMedicineChanges);
      setRecommendationDraft("");
      setMedicineDraft("");
      toast.success("Review saved and patient marked as replied");
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-gutter py-lg max-w-[1280px] mx-auto">
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Patient Medical Records</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Review uploaded reports, reply to patients, and log clinical recommendations.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg">
        {(["pending", "reviewing", "replied", "closed"] as ReportStatus[]).map((s) => (
          <div key={s} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md">
            <p className="text-caption text-on-surface-variant uppercase tracking-wider">{STATUS_CONFIG[s].label}</p>
            <p className="text-headline-md font-bold mt-1" style={{ color: "inherit" }}>
              {counts[s] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-2xl p-sm mb-md shadow-sm border border-outline-variant/30 flex flex-wrap items-center gap-sm">
        {FILTER_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-md py-xs rounded-full text-label-md font-semibold transition-colors ${
              tab === s ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {s === "all" ? `All (${counts.all ?? 0})` : `${STATUS_CONFIG[s].label} (${counts[s] ?? 0})`}
          </button>
        ))}
        <div className="relative ml-auto">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports or patients..."
            className="pl-10 pr-sm py-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-150">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-1">
              <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                {["Patient", "Report", "Category", "Files", "Submitted", "Status", "Actions"].map((h, i, arr) => (
                  <th key={h} className={`px-md py-xs text-label-md text-on-surface-variant ${i === arr.length - 1 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                    Loading medical records…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                    No medical records match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const meta = STATUS_CONFIG[r.status];
                  return (
                    <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-md py-xs whitespace-nowrap">
                        <div className="flex items-center gap-sm">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-caption shrink-0">
                            {initials(r.patientName)}
                          </div>
                          <span className="font-semibold">{r.patientName}</span>
                        </div>
                      </td>
                      <td className="px-md py-xs">{r.title}</td>
                      <td className="px-md py-xs text-on-surface-variant whitespace-nowrap">{r.category}</td>
                      <td className="px-md py-xs text-on-surface-variant whitespace-nowrap">
                        {r.files.length} file{r.files.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-md py-xs text-on-surface-variant whitespace-nowrap">{formatDate(r.createdAt)}</td>
                      <td className="px-md py-xs whitespace-nowrap">
                        <span className={`px-sm py-1 rounded-full ${meta.className} text-caption font-bold flex items-center gap-1 w-fit`}>
                          <span className="material-symbols-outlined text-[14px]">{meta.icon}</span>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-md py-xs text-right">
                        <div className="flex items-center justify-end gap-xs">
                          <div className="relative group/tip">
                            <button
                              onClick={() => openDetail(r.id, true)}
                              className="p-xs rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">chat</span>
                            </button>
                            <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                              Message patient
                            </span>
                          </div>
                          <button
                            onClick={() => openDetail(r.id)}
                            className={
                              r.status === "pending" || r.status === "reviewing"
                                ? "px-md py-1.5 rounded-lg bg-primary text-on-primary text-label-md font-semibold hover:opacity-90 transition-all"
                                : "px-md py-1.5 rounded-lg border border-outline-variant text-on-surface-variant text-label-md font-semibold hover:bg-surface-container-high transition-all"
                            }
                          >
                            {r.status === "pending" || r.status === "reviewing" ? "Review" : "View"}
                          </button>
                          <div className="relative group/tip">
                            <button
                              onClick={() => setDeleteId(r.id)}
                              className="p-xs rounded-lg border border-error/20 text-error hover:bg-error/10 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                            <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                              Delete report
                            </span>
                          </div>
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

      {/* Detail slide-over */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setSelectedId(null)}>
          <div className="w-full max-w-2xl h-full bg-surface flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/30 shrink-0">
              <div className="flex items-center gap-sm">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  {initials(selected.patientName)}
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">{selected.patientName}</h3>
                  <p className="text-caption text-on-surface-variant">
                    {selected.title} · {selected.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-xs">
                <button
                  onClick={() => setDeleteId(selected.id)}
                  title="Delete report"
                  className="p-xs rounded-lg border border-error/20 text-error hover:bg-error/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
                <button onClick={() => setSelectedId(null)} className="p-xs rounded-lg hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-lg space-y-lg">
              {/* Status changer */}
              <div className="flex items-center justify-between bg-surface-container-low rounded-xl p-sm">
                <span className="text-label-md font-semibold text-on-surface-variant">Report Status</span>
                <div className="flex items-center gap-xs">
                  <select
                    value={selected.status}
                    disabled={busy}
                    onChange={(e) => handleStatusChange(e.target.value as ReportStatus)}
                    className="bg-surface border border-outline-variant/50 rounded-lg px-sm py-xs text-label-md font-semibold"
                  >
                    {(["pending", "reviewing", "replied", "closed"] as ReportStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s].label}
                      </option>
                    ))}
                  </select>
                  {selected.status !== "closed" && (
                    <button
                      onClick={() => handleStatusChange("closed")}
                      disabled={busy}
                      title="Close this report"
                      className="flex items-center gap-1 px-sm py-xs rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors text-label-md font-semibold disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[18px]">task_alt</span>
                      Close Report
                    </button>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selected.description && (
                <div>
                  <h4 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wide mb-xs">Patient Notes</h4>
                  <p className="text-body-md text-on-surface-variant whitespace-pre-line">{selected.description}</p>
                </div>
              )}

              {/* Files */}
              <div>
                <h4 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wide mb-xs">
                  Uploaded Files ({selected.files.length})
                </h4>
                {selected.files.length === 0 ? (
                  <p className="text-caption text-on-surface-variant">No files uploaded.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-sm">
                    {selected.files.map((f) => (
                      <MedicalFileCard key={f.id} file={f} />
                    ))}
                  </div>
                )}
              </div>

              {/* Conversation */}
              <div>
                <h4 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wide mb-xs">Conversation</h4>
                <div className="space-y-sm">
                  {selected.conversation.length === 0 ? (
                    <p className="text-caption text-on-surface-variant">No messages yet.</p>
                  ) : (
                    selected.conversation.map((m: Message) => {
                      if (m.sender === "system") {
                        return (
                          <div key={m.id} className="flex justify-center">
                            <span className="text-caption text-on-surface-variant bg-surface-container-high px-sm py-1 rounded-full">
                              {m.message}
                            </span>
                          </div>
                        );
                      }
                      const isDoctor = m.sender === "doctor";
                      return (
                        <div key={m.id} className={`flex ${isDoctor ? "justify-end" : "justify-start"}`}>
                          <div className="max-w-[75%]">
                            <div
                              className={`rounded-2xl p-sm shadow-sm border ${
                                isDoctor
                                  ? "bg-primary text-on-primary border-primary rounded-tr-none"
                                  : "bg-surface-container-low border-outline-variant/30 rounded-tl-none"
                              }`}
                            >
                              <p className="text-body-md">{m.message}</p>
                              {m.attachments.length > 0 && (
                                <div className="grid grid-cols-2 gap-xs mt-xs">
                                  {m.attachments.map((a) =>
                                    a.type === "pdf" ? (
                                      <PdfPreviewCard key={a.id} file={a} />
                                    ) : (
                                      <a
                                        key={a.id}
                                        href={a.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative w-24 h-24 rounded-lg overflow-hidden border border-outline-variant/30 block"
                                      >
                                        <Image src={a.thumbnail} alt={a.name} fill className="object-cover" unoptimized />
                                      </a>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="text-caption text-on-surface-variant mt-1 block px-1">{formatDateTime(m.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>

              {/* Doctor Review form */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-md space-y-sm">
                <h4 className="text-label-md font-bold text-primary uppercase tracking-wide">Doctor Review &amp; Recommendations</h4>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  placeholder="Clinical summary..."
                  className="w-full px-sm py-xs rounded-lg border border-outline-variant/50 bg-surface text-body-md resize-none"
                />

                <div className="space-y-xs">
                  <p className="text-caption font-semibold text-on-surface-variant">Recommendations</p>
                  {recommendations.map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-xs bg-surface rounded-lg px-sm py-xs">
                      <span className="text-caption">{r}</span>
                      <button onClick={() => setRecommendations((prev) => prev.filter((_, idx) => idx !== i))} className="text-outline hover:text-error">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-xs">
                    <input
                      type="text"
                      value={recommendationDraft}
                      onChange={(e) => setRecommendationDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRecommendation(); } }}
                      placeholder="e.g. Continue omeprazole 20mg for 2 more weeks"
                      className="flex-1 px-sm py-1.5 rounded-lg border border-outline-variant/50 bg-surface text-body-md"
                    />
                    <button onClick={addRecommendation} className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-xs">
                  <p className="text-caption font-semibold text-on-surface-variant">Medicine Changes</p>
                  {medicineChanges.map((m, i) => (
                    <div key={i} className="flex items-center justify-between gap-xs bg-surface rounded-lg px-sm py-xs">
                      <span className="text-caption">{m}</span>
                      <button onClick={() => setMedicineChanges((prev) => prev.filter((_, idx) => idx !== i))} className="text-outline hover:text-error">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-xs">
                    <input
                      type="text"
                      value={medicineDraft}
                      onChange={(e) => setMedicineDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMedicineChange(); } }}
                      placeholder="e.g. Increase dosage to 40mg"
                      className="flex-1 px-sm py-1.5 rounded-lg border border-outline-variant/50 bg-surface text-body-md"
                    />
                    <button onClick={addMedicineChange} className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSaveReview}
                  disabled={busy}
                  className="w-full py-sm rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all disabled:opacity-60"
                >
                  Save Review &amp; Mark as Replied
                </button>
              </div>
            </div>

            {/* Reply composer */}
            <div className="border-t border-outline-variant/30 bg-surface p-md flex items-end gap-xs shrink-0">
              <textarea
                ref={composerRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                rows={1}
                placeholder="Reply to patient…"
                className="flex-1 resize-none max-h-32 px-sm py-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                onClick={handleSendReply}
                disabled={busy || !replyText.trim()}
                className="p-sm rounded-full bg-primary text-on-primary hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 shrink-0"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-surface rounded-2xl p-lg shadow-2xl max-w-sm w-full mx-md">
            <h3 className="text-headline-md font-bold text-on-surface mb-sm">Delete Report?</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">
              This will permanently delete{" "}
              <span className="font-semibold text-on-surface">{reports.find((r) => r.id === deleteId)?.title}</span> and all its
              uploaded files. This action cannot be undone.
            </p>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-md py-xs rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                onClick={handleDelete}
                className="px-md py-xs rounded-xl bg-error text-on-error font-semibold hover:opacity-90 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
