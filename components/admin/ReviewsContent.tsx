"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import { REVIEW_STATUS_META, type Review, type ReviewStatus } from "@/types/review";

const FILTER_TABS: (ReviewStatus | "all")[] = ["all", "pending", "approved", "rejected"];

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[1px] text-tertiary">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="material-symbols-outlined text-[16px]"
          style={i <= rating ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function ReviewsContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ReviewStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const loadReviews = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      if (res.ok) setReviews(data.reviews ?? []);
      else if (!silent) toast.error(data.error ?? "Could not load reviews");
    } catch {
      if (!silent) toast.error("Network error loading reviews");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    const interval = setInterval(() => loadReviews(true), 20000);
    return () => clearInterval(interval);
  }, []);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: reviews.length };
    for (const s of FILTER_TABS) {
      if (s === "all") continue;
      base[s] = reviews.filter((r) => r.status === s).length;
    }
    return base;
  }, [reviews]);

  const filtered = useMemo(() => {
    let list = reviews;
    if (tab !== "all") list = list.filter((r) => r.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.patientName.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q) || r.appointmentNumber.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reviews, tab, search]);

  const averageRating = useMemo(() => {
    const approved = reviews.filter((r) => r.status === "approved");
    if (approved.length === 0) return 0;
    return approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
  }, [reviews]);

  async function moderate(id: string, status: ReviewStatus) {
    setBusy(true);
    try {
      const res = await fetch(`/api/reviews/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update review");
        return;
      }
      setReviews((prev) => prev.map((r) => (r.id === id ? data.review : r)));
      toast.success(status === "approved" ? "Review approved" : "Review rejected");
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/reviews/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not delete review");
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== deleteId));
      setDeleteId(null);
      toast.success("Review deleted");
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  function openReply(review: Review) {
    setReplyId(review.id);
    setReplyText(review.doctorReply?.message ?? "");
  }

  async function handleSaveReply() {
    if (!replyId || !replyText.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/reviews/${replyId}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save reply");
        return;
      }
      setReviews((prev) => prev.map((r) => (r.id === replyId ? data.review : r)));
      setReplyId(null);
      setReplyText("");
      toast.success("Reply saved");
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  const replyTarget = reviews.find((r) => r.id === replyId) ?? null;

  return (
    <div className="px-gutter py-lg max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Patient Reviews</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {counts.all} total · {counts.pending ?? 0} awaiting moderation · {averageRating ? averageRating.toFixed(1) : "—"} ★ average
          </p>
        </div>
      </div>

      {/* Filter tabs + search */}
      <div className="bg-surface-container-lowest rounded-2xl p-md mb-xl shadow-sm border border-outline-variant/30 flex flex-wrap items-center justify-between gap-md">
        <div className="flex gap-xs flex-wrap">
          {FILTER_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-md py-xs rounded-full text-label-md font-semibold transition-all capitalize ${
                tab === t ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {t === "all" ? "All" : REVIEW_STATUS_META[t].label} ({counts[t] ?? 0})
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, comment, appointment…"
            className="pl-10 pr-sm py-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-150">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-1">
              <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                {["Patient", "Appointment", "Rating", "Comment", "Status", "Submitted", "Actions"].map((h, i, arr) => (
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
                    Loading reviews…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                    No reviews match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const meta = REVIEW_STATUS_META[r.status];
                  return (
                    <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-md py-xs whitespace-nowrap">
                        <div className="flex items-center gap-sm">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-caption shrink-0">
                            {initials(r.patientName)}
                          </div>
                          <span className="font-semibold text-body-md">{r.patientName}</span>
                        </div>
                      </td>
                      <td className="px-md py-xs whitespace-nowrap text-body-md text-on-surface-variant">
                        {r.appointmentNumber || "—"}
                      </td>
                      <td className="px-md py-xs whitespace-nowrap">
                        <StarRating rating={r.rating} />
                      </td>
                      <td className="px-md py-xs text-body-md text-on-surface-variant max-w-[280px] truncate" title={r.comment}>
                        {r.comment}
                        {r.doctorReply && (
                          <span className="ml-xs inline-flex items-center gap-1 text-caption text-primary font-semibold">
                            <span className="material-symbols-outlined text-[14px]">reply</span>
                            Replied
                          </span>
                        )}
                      </td>
                      <td className="px-md py-xs whitespace-nowrap">
                        <span className={`px-sm py-[2px] rounded-full ${meta.badgeClass} text-caption font-bold`}>{meta.label}</span>
                      </td>
                      <td className="px-md py-xs whitespace-nowrap text-caption text-on-surface-variant">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-md py-xs text-right">
                        <div className="flex items-center justify-end gap-xs">
                          {r.status === "pending" && (
                            <>
                              <div className="relative group/tip">
                                <button
                                  disabled={busy}
                                  onClick={() => moderate(r.id, "approved")}
                                  className="p-xs rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                </button>
                                <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                                  Approve
                                </span>
                              </div>
                              <div className="relative group/tip">
                                <button
                                  disabled={busy}
                                  onClick={() => moderate(r.id, "rejected")}
                                  className="p-xs rounded-full bg-error/10 text-error hover:bg-error/20 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                                </button>
                                <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                                  Reject
                                </span>
                              </div>
                            </>
                          )}
                          <div className="relative group/tip">
                            <button
                              onClick={() => openReply(r)}
                              className="p-xs rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">chat</span>
                            </button>
                            <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                              {r.doctorReply ? "Edit Reply" : "Reply"}
                            </span>
                          </div>
                          <div className="relative group/tip">
                            <button
                              onClick={() => setDeleteId(r.id)}
                              className="p-xs rounded-full border border-error/20 text-error hover:bg-error/10 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                            <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                              Delete
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

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-md">
          <div className="bg-surface rounded-2xl p-lg shadow-2xl max-w-md w-full mx-md">
            <h3 className="text-headline-md font-bold text-on-surface mb-sm">Delete Review?</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">
              This will permanently remove this review. This action cannot be undone.
            </p>
            <div className="flex gap-sm">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-md py-sm rounded-xl border border-outline-variant text-on-surface font-semibold text-label-md whitespace-nowrap hover:bg-surface-container-high transition-colors"
              >
                Keep Review
              </button>
              <button
                disabled={busy}
                onClick={handleDelete}
                className="flex-1 px-md py-sm rounded-xl bg-error text-on-error font-semibold text-label-md whitespace-nowrap hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply modal */}
      {replyTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-md">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-lg w-full mx-md">
            <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/30">
              <h3 className="text-headline-md font-bold text-on-surface">Reply to Review</h3>
              <button
                onClick={() => setReplyId(null)}
                className="p-xs rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-md">
              <div className="p-md bg-surface-container-low rounded-xl">
                <div className="flex items-center justify-between mb-xs">
                  <span className="font-semibold text-body-md">{replyTarget.patientName}</span>
                  <StarRating rating={replyTarget.rating} />
                </div>
                <p className="text-body-md text-on-surface-variant">{replyTarget.comment}</p>
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Your Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  placeholder="Thank the patient or address their feedback…"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md resize-none"
                />
              </div>
            </div>
            <div className="px-lg py-md border-t border-outline-variant/20 flex gap-sm">
              <button
                onClick={() => setReplyId(null)}
                className="flex-1 px-md py-sm rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                disabled={busy || !replyText.trim()}
                onClick={handleSaveReply}
                className="flex-1 px-md py-sm rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 disabled:opacity-60"
              >
                Save Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
