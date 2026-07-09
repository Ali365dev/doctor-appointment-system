"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import { Report, formatDate } from "./data";
import StatusBadge from "./StatusBadge";

interface ReportCardProps {
  report: Report;
  onDelete?: (id: string) => void;
}

export default function ReportCard({ report, onDelete }: ReportCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const thumbnail = report.files.find((f) => f.type === "image")?.thumbnail;
  const doctorReplied = report.status === "replied";

  const handleDownload = () => {
    toast.success(`Downloading ${report.files.length} file(s) from "${report.title}"…`);
    setMenuOpen(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/patient/medical-records/${report.id}`).catch(() => null);
    toast.success("Share link copied to clipboard.");
    setMenuOpen(false);
  };

  return (
    <div className="group bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      <Link href={`/patient/medical-records/${report.id}`} className="relative h-36 bg-surface-container-low block">
        {thumbnail ? (
          <Image src={thumbnail} alt={report.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-headline-lg">description</span>
          </div>
        )}
        {doctorReplied && (
          <span className="absolute top-xs right-xs bg-emerald-600 text-white text-caption font-bold px-sm py-[2px] rounded-full flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[14px]">mark_chat_read</span>
            Replied
          </span>
        )}
      </Link>

      <div className="p-md flex-1 flex flex-col gap-xs">
        <div className="flex items-start justify-between gap-xs">
          <Link href={`/patient/medical-records/${report.id}`} className="min-w-0">
            <h3 className="text-label-md font-bold text-on-surface truncate hover:text-primary transition-colors">
              {report.title}
            </h3>
          </Link>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More actions"
              className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-body-lg">more_vert</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-outline-variant/30 rounded-xl shadow-lg z-10 py-1 text-label-md">
                <Link href={`/patient/medical-records/${report.id}`} className="flex items-center gap-xs px-sm py-xs hover:bg-surface-container-high">
                  <span className="material-symbols-outlined text-body-lg">visibility</span> View
                </Link>
                <Link href={`/patient/medical-records/${report.id}/discussion`} className="flex items-center gap-xs px-sm py-xs hover:bg-surface-container-high">
                  <span className="material-symbols-outlined text-body-lg">chat</span> Discuss
                </Link>
                <button type="button" onClick={handleDownload} className="w-full flex items-center gap-xs px-sm py-xs hover:bg-surface-container-high text-left">
                  <span className="material-symbols-outlined text-body-lg">download</span> Download
                </button>
                <button type="button" onClick={handleShare} className="w-full flex items-center gap-xs px-sm py-xs hover:bg-surface-container-high text-left">
                  <span className="material-symbols-outlined text-body-lg">share</span> Share
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => { onDelete(report.id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-xs px-sm py-xs hover:bg-error/5 text-error text-left"
                  >
                    <span className="material-symbols-outlined text-body-lg">delete</span> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-caption text-on-surface-variant">{report.category}</p>

        <div className="flex items-center gap-sm text-caption text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            {formatDate(report.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">attach_file</span>
            {report.files.length} file{report.files.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center justify-between pt-xs mt-auto">
          <StatusBadge status={report.status} />
          <span className="text-caption text-outline">Updated {formatDate(report.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
