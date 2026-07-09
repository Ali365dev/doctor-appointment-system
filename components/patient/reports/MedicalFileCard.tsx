import Image from "next/image";
import { ReportFile } from "./data";
import PdfPreviewCard from "./PdfPreviewCard";

interface MedicalFileCardProps {
  file: Pick<ReportFile, "name" | "type" | "size" | "url" | "thumbnail">;
  onRemove?: () => void;
  onZoom?: () => void;
}

export default function MedicalFileCard({ file, onRemove, onZoom }: MedicalFileCardProps) {
  if (file.type === "pdf") {
    return <PdfPreviewCard file={file} onRemove={onRemove} />;
  }

  return (
    <div className="relative group aspect-square rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low">
      {file.thumbnail ? (
        <Image src={file.thumbnail} alt={file.name} fill className="object-cover" unoptimized />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-outline">
          <span className="material-symbols-outlined text-headline-lg">image</span>
        </div>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-xs opacity-0 group-hover:opacity-100">
        {onZoom && (
          <button
            type="button"
            onClick={onZoom}
            aria-label={`Zoom ${file.name}`}
            className="w-8 h-8 rounded-full bg-white/90 text-on-surface flex items-center justify-center hover:bg-white transition-colors"
          >
            <span className="material-symbols-outlined text-body-lg">zoom_in</span>
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${file.name}`}
            className="w-8 h-8 rounded-full bg-white/90 text-error flex items-center justify-center hover:bg-white transition-colors"
          >
            <span className="material-symbols-outlined text-body-lg">delete</span>
          </button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-xs py-1">
        <p className="text-caption text-white truncate">{file.name}</p>
      </div>
    </div>
  );
}
