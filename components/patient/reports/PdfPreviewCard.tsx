import { ReportFile } from "./data";

interface PdfPreviewCardProps {
  file: Pick<ReportFile, "name" | "url"> & { size?: string };
  onRemove?: () => void;
}

export default function PdfPreviewCard({ file, onRemove }: PdfPreviewCardProps) {
  return (
    <div className="relative group bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-sm flex items-center gap-sm">
      <div className="w-10 h-10 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined">picture_as_pdf</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-label-md font-semibold text-on-surface truncate">{file.name}</p>
        <p className="text-caption text-on-surface-variant">{file.size}</p>
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
          className="text-outline hover:text-error transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-body-lg">close</span>
        </button>
      ) : (
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${file.name}`}
          className="text-outline hover:text-primary transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-body-lg">open_in_new</span>
        </a>
      )}
    </div>
  );
}
