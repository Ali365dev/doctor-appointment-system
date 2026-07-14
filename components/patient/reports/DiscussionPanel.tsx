"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Report, Message } from "./data";
import ChatBubble from "./ChatBubble";
import ChatComposer from "./ChatComposer";
import QuickQuestionCards from "./QuickQuestionCards";
import MedicalFileCard from "./MedicalFileCard";
import EmptyReports from "./EmptyReports";

export default function DiscussionPanel({ report }: { report: Report }) {
  const [messages, setMessages] = useState<Message[]>(report.conversation);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = async (text: string, attachments: File[] = []) => {
    try {
      const formData = new FormData();
      formData.append("message", text);
      attachments.forEach((file) => formData.append("attachments", file));

      const res = await fetch(`/api/medical-records/${report.id}/messages`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not send message");
        return false;
      }
      setMessages(data.report.conversation);
      return true;
    } catch {
      toast.error("Network error sending message");
      return false;
    }
  };

  const handleSend = async (text: string) => {
    if (await sendMessage(text)) toast.success("Message sent to your doctor.");
  };

  const handleAttach = async (files: File[]) => {
    if (await sendMessage("Sent attachment(s).", files)) toast.success(`${files.length} file(s) attached.`);
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
        </div>

        <ChatComposer onSend={handleSend} onAttach={handleAttach} />
      </div>
    </div>
  );
}
