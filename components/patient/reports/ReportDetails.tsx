"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Report, formatDate } from "./data";
import StatusBadge from "./StatusBadge";
import ReportGallery from "./ReportGallery";
import ReportTimeline from "./ReportTimeline";
import DoctorSummaryCard from "./DoctorSummaryCard";

export default function ReportDetails({ report }: { report: Report }) {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDownload = () => {
    if (report.files.length === 0) {
      toast.error("This report has no files to download.");
      return;
    }
    report.files.forEach((file) => window.open(file.url, "_blank", "noopener,noreferrer"));
    toast.success(`Opening ${report.files.length} file(s)…`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/medical-records/${report.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not delete report");
        return;
      }
      toast.success("Report deleted");
      router.push("/patient/medical-records");
    } catch {
      toast.error("Network error deleting report");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-lg pb-24">
      {/* Info Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md md:p-lg shadow-sm space-y-md">
        <div className="flex flex-wrap items-start justify-between gap-sm">
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">{report.title}</h1>
            <p className="text-body-md text-on-surface-variant mt-1">{report.description}</p>
          </div>
          <StatusBadge status={report.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-md pt-sm border-t border-outline-variant/20">
          <div>
            <p className="text-caption text-outline uppercase tracking-wider">Category</p>
            <p className="text-body-md font-semibold text-on-surface mt-0.5">{report.category}</p>
          </div>
          <div>
            <p className="text-caption text-outline uppercase tracking-wider">Uploaded</p>
            <p className="text-body-md font-semibold text-on-surface mt-0.5">{formatDate(report.createdAt)}</p>
          </div>
          <div>
            <p className="text-caption text-outline uppercase tracking-wider">Doctor</p>
            <p className="text-body-md font-semibold text-on-surface mt-0.5">{report.doctor?.name ?? "Not yet assigned"}</p>
          </div>
          <div>
            <p className="text-caption text-outline uppercase tracking-wider">Total Files</p>
            <p className="text-body-md font-semibold text-on-surface mt-0.5">{report.files.length}</p>
          </div>
        </div>

        {report.appointment && (
          <div className="flex items-center gap-2 text-body-md text-on-surface-variant bg-primary/5 rounded-lg px-sm py-xs">
            <span className="material-symbols-outlined text-primary text-body-lg">event</span>
            Related appointment: {formatDate(report.appointment.date)} at {report.appointment.clinic}
          </div>
        )}

        <ReportTimeline status={report.status} />
      </div>

      <ReportGallery files={report.files} />

      {report.doctorReview && report.doctor && (
        <DoctorSummaryCard doctor={report.doctor} review={report.doctorReview} />
      )}

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-surface border-t border-outline-variant/30 px-gutter py-sm flex items-center justify-end gap-sm z-30">
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="px-lg py-sm rounded-xl border border-error/20 text-error hover:bg-error/10 transition-all font-semibold text-label-md flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-body-lg">delete</span>
          Delete
        </button>
        <button
          type="button"
          onClick={() => router.push("/patient/medical-records/upload")}
          className="px-lg py-sm rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-all font-semibold text-label-md flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-body-lg">add</span>
          Upload More Files
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="px-lg py-sm rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-all font-semibold text-label-md flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-body-lg">download</span>
          Download
        </button>
        <Link
          href={`/patient/medical-records/${report.id}/discussion`}
          className="px-lg py-sm rounded-xl bg-primary text-on-primary font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-body-lg">chat</span>
          Discuss
        </Link>
      </div>

      {/* Delete confirm modal */}
      {confirmingDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-lg shadow-2xl max-w-sm w-full mx-md">
            <h3 className="text-headline-md font-bold text-on-surface mb-sm">Delete Report?</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">
              This will permanently delete <span className="font-semibold text-on-surface">{report.title}</span> and all its
              uploaded files. This action cannot be undone.
            </p>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => setConfirmingDelete(false)}
                className="px-md py-xs rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="px-md py-xs rounded-xl bg-error text-on-error font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
