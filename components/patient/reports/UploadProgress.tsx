export type UploadState = "idle" | "uploading" | "success" | "error";

interface UploadProgressProps {
  state: UploadState;
  progress: number;
  onRetry?: () => void;
}

export default function UploadProgress({ state, progress, onRetry }: UploadProgressProps) {
  if (state === "idle") return null;

  if (state === "success") {
    return (
      <div className="flex items-center gap-sm p-md rounded-xl bg-emerald-50 border border-emerald-100">
        <span
          className="material-symbols-outlined text-emerald-600"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <p className="text-body-md font-semibold text-emerald-700">Report uploaded successfully.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex items-center justify-between gap-sm p-md rounded-xl bg-error/5 border border-error/20">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-body-md font-semibold text-error">Upload failed. Please try again.</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-label-md font-bold text-primary hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-xs">
      <div className="flex items-center justify-between text-caption text-on-surface-variant">
        <span>Uploading…</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
