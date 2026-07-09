"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";
import { ReportFile } from "./data";
import PdfPreviewCard from "./PdfPreviewCard";

export default function ReportGallery({ files }: { files: ReportFile[] }) {
  const [zoomFile, setZoomFile] = useState<ReportFile | null>(null);

  if (files.length === 0) return null;

  const handleDownload = (file: ReportFile) => {
    toast.success(`Downloading ${file.name}…`);
  };

  const handleShare = (file: ReportFile) => {
    navigator.clipboard.writeText(file.url).catch(() => null);
    toast.success(`Link to ${file.name} copied.`);
  };

  return (
    <div className="space-y-sm">
      <h2 className="text-headline-md font-bold text-on-surface">Files</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
        {files.map((file) =>
          file.type === "pdf" ? (
            <PdfPreviewCard key={file.id} file={file} />
          ) : (
            <div key={file.id} className="relative group aspect-square rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low">
              <Image src={file.thumbnail} alt={file.name} fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-xs opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setZoomFile(file)}
                  aria-label={`Zoom ${file.name}`}
                  className="w-8 h-8 rounded-full bg-white/90 text-on-surface flex items-center justify-center hover:bg-white transition-colors"
                >
                  <span className="material-symbols-outlined text-body-lg">zoom_in</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(file)}
                  aria-label={`Download ${file.name}`}
                  className="w-8 h-8 rounded-full bg-white/90 text-on-surface flex items-center justify-center hover:bg-white transition-colors"
                >
                  <span className="material-symbols-outlined text-body-lg">download</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(file)}
                  aria-label={`Share ${file.name}`}
                  className="w-8 h-8 rounded-full bg-white/90 text-on-surface flex items-center justify-center hover:bg-white transition-colors"
                >
                  <span className="material-symbols-outlined text-body-lg">share</span>
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {zoomFile && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-lg"
          onClick={() => setZoomFile(null)}
        >
          <div className="relative w-full max-w-2xl aspect-square">
            <Image src={zoomFile.thumbnail} alt={zoomFile.name} fill className="object-contain" unoptimized />
          </div>
          <button
            type="button"
            onClick={() => setZoomFile(null)}
            aria-label="Close fullscreen preview"
            className="absolute top-lg right-lg text-white hover:text-white/70 transition-colors"
          >
            <span className="material-symbols-outlined text-headline-lg">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
