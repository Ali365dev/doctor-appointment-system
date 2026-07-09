"use client";

import { useRef, useState, DragEvent } from "react";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

export default function UploadDropzone({
  onFilesSelected,
  accept = ".jpg,.jpeg,.png,.pdf",
  multiple = true,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onFilesSelected(Array.from(fileList));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      className={`rounded-2xl border-2 border-dashed px-lg py-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-outline-variant hover:border-primary/50 hover:bg-surface-container-low"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
      />
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-md">
        <span className="material-symbols-outlined text-headline-lg text-primary">cloud_upload</span>
      </div>
      <p className="text-body-lg font-semibold text-on-surface mb-1">
        Drag &amp; drop or click to upload
      </p>
      <p className="text-caption text-on-surface-variant">
        JPG, PNG or PDF · Multiple files supported · Max 10 MB each
      </p>
    </div>
  );
}
