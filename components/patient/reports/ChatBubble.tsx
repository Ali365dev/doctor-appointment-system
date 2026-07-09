import Image from "next/image";
import { Message, formatDateTime } from "./data";
import PdfPreviewCard from "./PdfPreviewCard";

export default function ChatBubble({ message, doctorAvatar }: { message: Message; doctorAvatar?: string }) {
  if (message.sender === "system") {
    return (
      <div className="flex justify-center">
        <span className="text-caption text-on-surface-variant bg-surface-container-high px-sm py-1 rounded-full">
          {message.message}
        </span>
      </div>
    );
  }

  const isPatient = message.sender === "patient";

  return (
    <div className={`flex items-start gap-sm max-w-[85%] md:max-w-[70%] ${isPatient ? "flex-row-reverse ml-auto" : ""}`}>
      {!isPatient && (
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-container-high">
          {doctorAvatar ? (
            <Image src={doctorAvatar} alt="Doctor" width={32} height={32} className="w-full h-full object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-body-lg">stethoscope</span>
            </div>
          )}
        </div>
      )}
      <div className={isPatient ? "items-end flex flex-col" : ""}>
        <div
          className={`rounded-2xl p-sm shadow-sm border ${
            isPatient
              ? "bg-primary text-on-primary border-primary rounded-tr-none"
              : "bg-surface border-outline-variant rounded-tl-none"
          }`}
        >
          <p className={`text-body-md ${isPatient ? "text-on-primary" : "text-on-surface"}`}>{message.message}</p>
          {message.attachments.length > 0 && (
            <div className="grid grid-cols-2 gap-xs mt-xs">
              {message.attachments.map((a) =>
                a.type === "pdf" ? (
                  <PdfPreviewCard key={a.id} file={a} />
                ) : (
                  <div key={a.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-outline-variant/30">
                    <Image src={a.thumbnail} alt={a.name} fill className="object-cover" unoptimized />
                  </div>
                )
              )}
            </div>
          )}
        </div>
        <span className="text-caption text-on-surface-variant mt-1 px-1">{formatDateTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
