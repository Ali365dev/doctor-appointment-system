"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Report, Message, MessageAttachment } from "./data";
import ChatBubble from "./ChatBubble";
import ChatComposer from "./ChatComposer";
import QuickQuestionCards from "./QuickQuestionCards";
import MedicineRequestCard from "./MedicineRequestCard";
import MedicalFileCard from "./MedicalFileCard";
import EmptyReports from "./EmptyReports";

export default function DiscussionPanel({ report }: { report: Report }) {
  const [messages, setMessages] = useState<Message[]>(report.conversation);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const appendPatientMessage = (text: string, attachments: MessageAttachment[] = []) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: "patient",
        message: text,
        attachments,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleSend = (text: string) => {
    appendPatientMessage(text);
    toast.success("Message sent to your doctor.");
  };

  const handleAttach = (files: File[]) => {
    const attachments: MessageAttachment[] = files.map((file) => ({
      id: `att-${file.name}-${Date.now()}`,
      name: file.name,
      type: file.type === "application/pdf" ? "pdf" : "image",
      url: file.type === "application/pdf" ? "#" : URL.createObjectURL(file),
      thumbnail: file.type === "application/pdf" ? "" : URL.createObjectURL(file),
    }));
    appendPatientMessage("Sent attachment(s).", attachments);
    toast.success(`${files.length} file(s) attached.`);
  };

  const handleMedicineRequest = (message: string, photo: File | null) => {
    const attachments: MessageAttachment[] = photo
      ? [{ id: `att-${photo.name}-${Date.now()}`, name: photo.name, type: "image", url: URL.createObjectURL(photo), thumbnail: URL.createObjectURL(photo) }]
      : [];
    appendPatientMessage(message, attachments);
    toast.success("Medicine change request sent to your doctor.");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-md lg:gap-0 lg:h-[calc(100vh-180px)] bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
      {/* Left: Uploaded files */}
      <aside className="lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-outline-variant/30 p-md space-y-sm overflow-y-auto">
        <h3 className="text-label-md font-bold text-on-surface uppercase tracking-wider">Uploaded Files</h3>
        {report.files.length === 0 ? (
          <EmptyReports icon="folder_off" title="No files" description="No files were uploaded with this report." />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-sm">
            {report.files.map((file) => (
              <MedicalFileCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </aside>

      {/* Right: Conversation */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-md space-y-md">
          {messages.length === 0 ? (
            <EmptyReports icon="forum" title="No discussion yet" description="Ask your doctor a question about this report to start the conversation." />
          ) : (
            messages.map((m) => <ChatBubble key={m.id} message={m} doctorAvatar={report.doctor?.avatar} />)
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-md pb-sm space-y-sm">
          <QuickQuestionCards onSelect={handleSend} />
          <MedicineRequestCard onSubmit={handleMedicineRequest} />
        </div>

        <ChatComposer onSend={handleSend} onAttach={handleAttach} />
      </div>
    </div>
  );
}
