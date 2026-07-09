"use client";

import { useRef, useState } from "react";

interface ChatComposerProps {
  onSend: (text: string) => void;
  onAttach: (files: File[]) => void;
}

export default function ChatComposer({ onSend, onAttach }: ChatComposerProps) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="border-t border-outline-variant/30 bg-surface p-sm md:p-md flex items-end gap-xs">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) onAttach(Array.from(e.target.files)); e.target.value = ""; }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { if (e.target.files) onAttach(Array.from(e.target.files)); e.target.value = ""; }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Attach file"
        className="p-xs rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors shrink-0"
      >
        <span className="material-symbols-outlined">attach_file</span>
      </button>
      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        aria-label="Use camera"
        className="p-xs rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors shrink-0"
      >
        <span className="material-symbols-outlined">photo_camera</span>
      </button>

      <textarea
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        placeholder="Ask a question about this report…"
        className="flex-1 resize-none max-h-32 px-sm py-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={!text.trim()}
        aria-label="Send message"
        className="p-sm rounded-full bg-primary text-on-primary hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 shrink-0"
      >
        <span className="material-symbols-outlined">send</span>
      </button>
    </div>
  );
}
