"use client";

import { useRef, useState } from "react";

type RequestType = "stop" | "dosage" | "alternative" | "side-effects";

const REQUEST_TYPES: { key: RequestType; label: string; icon: string }[] = [
  { key: "stop", label: "Stop Medicine", icon: "block" },
  { key: "dosage", label: "Change Dosage", icon: "tune" },
  { key: "alternative", label: "Alternative Medicine", icon: "sync_alt" },
  { key: "side-effects", label: "Report Side Effects", icon: "warning" },
];

interface MedicineRequestCardProps {
  onSubmit: (message: string, photo: File | null) => void;
}

export default function MedicineRequestCard({ onSubmit }: MedicineRequestCardProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<RequestType | null>(null);
  const [details, setDetails] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!type) return;
    const label = REQUEST_TYPES.find((t) => t.key === type)?.label;
    const message = `Medicine Request — ${label}${details.trim() ? `: ${details.trim()}` : ""}`;
    onSubmit(message, photo);
    setOpen(false);
    setType(null);
    setDetails("");
    setPhoto(null);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-xs px-md py-sm rounded-xl border-2 border-dashed border-secondary/40 text-secondary font-semibold hover:bg-secondary/5 transition-all"
      >
        <span className="material-symbols-outlined text-body-lg">medication</span>
        Request a Medicine Change
      </button>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md space-y-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-label-md font-bold text-on-surface">Medicine Change Request</h3>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-outline hover:text-error">
          <span className="material-symbols-outlined text-body-lg">close</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-xs">
        {REQUEST_TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            className={`flex items-center gap-xs px-sm py-xs rounded-lg border text-label-md font-semibold transition-all ${
              type === t.key
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-outline-variant text-on-surface-variant hover:border-secondary/40"
            }`}
          >
            <span className="material-symbols-outlined text-body-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        rows={2}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Add details (optional)…"
        className="w-full px-sm py-xs rounded-lg border border-outline-variant/50 bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
      />

      <div className="flex items-center gap-xs">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-xs text-label-md text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-body-lg">add_a_photo</span>
          {photo ? photo.name : "Attach medicine photo"}
        </button>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!type}
        className="w-full py-sm rounded-xl bg-secondary text-on-secondary font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
      >
        Send Request to Doctor
      </button>
    </div>
  );
}
