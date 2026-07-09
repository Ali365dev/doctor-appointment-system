"use client";

import MedicalFileCard from "./MedicalFileCard";
import { FileKind } from "./data";

export interface SelectedFile {
  id: string;
  name: string;
  type: FileKind;
  size: string;
  url: string;
  thumbnail: string;
}

interface FilePreviewGridProps {
  files: SelectedFile[];
  onRemove: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export default function FilePreviewGrid({ files, onRemove, onReorder }: FilePreviewGridProps) {
  if (files.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-sm">
      {files.map((file, index) => (
        <div key={file.id} className="space-y-xs">
          <MedicalFileCard file={file} onRemove={() => onRemove(file.id)} />
          <div className="flex justify-center gap-xs">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onReorder(index, index - 1)}
              aria-label="Move up in order"
              className="text-outline hover:text-primary disabled:opacity-30 disabled:hover:text-outline transition-colors"
            >
              <span className="material-symbols-outlined text-body-lg">chevron_left</span>
            </button>
            <button
              type="button"
              disabled={index === files.length - 1}
              onClick={() => onReorder(index, index + 1)}
              aria-label="Move down in order"
              className="text-outline hover:text-primary disabled:opacity-30 disabled:hover:text-outline transition-colors"
            >
              <span className="material-symbols-outlined text-body-lg">chevron_right</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
