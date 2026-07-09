"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import UploadDropzone from "./UploadDropzone";
import FilePreviewGrid, { SelectedFile } from "./FilePreviewGrid";
import UploadProgress, { UploadState } from "./UploadProgress";
import { REPORT_CATEGORIES } from "./data";

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MOCK_APPOINTMENTS = [
  "None",
  "Jun 25 – Chughtai Medical Centre",
  "Jun 29 – Faisal Hospital (New Building)",
  "Jul 03 – United Hospital (Faisalabad)",
];

export default function UploadReportForm() {
  const router = useRouter();
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(REPORT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [appointment, setAppointment] = useState(MOCK_APPOINTMENTS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);

  const handleFilesSelected = (newFiles: File[]) => {
    const mapped: SelectedFile[] = newFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      type: file.type === "application/pdf" ? "pdf" : "image",
      size: formatSize(file.size),
      url: file.type === "application/pdf" ? "#" : URL.createObjectURL(file),
      thumbnail: file.type === "application/pdf" ? "" : URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...mapped]);
    setErrors((prev) => ({ ...prev, files: "" }));
  };

  const handleRemove = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Report title is required";
    if (files.length === 0) e.files = "Please add at least one file";
    setErrors(e);
    return e;
  };

  const runUpload = () => {
    setUploadState("uploading");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploadState("success");
          toast.success("Report uploaded successfully!");
          setTimeout(() => router.push("/patient/medical-records"), 1200);
          return 100;
        }
        return p + 20;
      });
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    const firstError = Object.values(validationErrors)[0];
    if (firstError) {
      toast.error(firstError);
      return;
    }
    runUpload();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-lg">
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md md:p-lg shadow-sm space-y-md">
        <h2 className="text-headline-md font-bold text-on-surface">Upload Files</h2>
        <UploadDropzone onFilesSelected={handleFilesSelected} />
        {errors.files && <p className="text-caption text-error">{errors.files}</p>}
        <FilePreviewGrid files={files} onRemove={handleRemove} onReorder={handleReorder} />
        <UploadProgress
          state={uploadState}
          progress={progress}
          onRetry={runUpload}
        />
      </section>

      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md md:p-lg shadow-sm space-y-md">
        <h2 className="text-headline-md font-bold text-on-surface">Report Details</h2>

        <div className="space-y-xs">
          <label className="text-label-md font-semibold text-on-surface-variant">
            Report Title <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
            placeholder="e.g. Complete Blood Count (CBC)"
            aria-invalid={!!errors.title}
            className={`w-full px-md py-sm rounded-lg border bg-surface-container-low text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.title ? "border-error" : "border-outline-variant/50"
            }`}
          />
          {errors.title && <p className="text-caption text-error">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-xs">
            <label className="text-label-md font-semibold text-on-surface-variant">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-md py-sm rounded-lg border border-outline-variant/50 bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {REPORT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-xs">
            <label className="text-label-md font-semibold text-on-surface-variant">
              Related Appointment <span className="text-caption text-outline">(Optional)</span>
            </label>
            <select
              value={appointment}
              onChange={(e) => setAppointment(e.target.value)}
              className="w-full px-md py-sm rounded-lg border border-outline-variant/50 bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {MOCK_APPOINTMENTS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-xs">
          <label className="text-label-md font-semibold text-on-surface-variant">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any relevant context for the doctor..."
            className="w-full px-md py-sm rounded-lg border border-outline-variant/50 bg-surface-container-low text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        </div>

        <div className="space-y-xs">
          <label className="text-label-md font-semibold text-on-surface-variant">
            Symptoms <span className="text-caption text-outline">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Briefly describe any symptoms related to this report..."
            className="w-full px-md py-sm rounded-lg border border-outline-variant/50 bg-surface-container-low text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        </div>
      </section>

      <div className="flex justify-end gap-sm">
        <button
          type="button"
          onClick={() => router.push("/patient/medical-records")}
          className="px-lg py-sm rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-all font-semibold text-label-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploadState === "uploading"}
          className="px-lg py-sm rounded-xl bg-primary text-on-primary font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-xs disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-body-lg">upload</span>
          {uploadState === "uploading" ? "Uploading…" : "Upload Report"}
        </button>
      </div>
    </form>
  );
}
