import { ReportStatus } from "./data";

const STEPS: { key: ReportStatus | "uploaded"; label: string; icon: string }[] = [
  { key: "uploaded", label: "Uploaded", icon: "upload_file" },
  { key: "pending", label: "Pending", icon: "hourglass_empty" },
  { key: "reviewing", label: "Reviewing", icon: "visibility" },
  { key: "replied", label: "Doctor Replied", icon: "mark_chat_read" },
  { key: "closed", label: "Closed", icon: "task_alt" },
];

const ORDER: (ReportStatus | "uploaded")[] = ["uploaded", "pending", "reviewing", "replied", "closed"];

export default function ReportTimeline({ status }: { status: ReportStatus }) {
  const currentIndex = ORDER.indexOf(status);

  return (
    <div className="flex items-center overflow-x-auto py-sm">
      {STEPS.map((step, i) => {
        const stepIndex = ORDER.indexOf(step.key);
        const done = stepIndex <= currentIndex;
        return (
          <div key={step.key} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1 min-w-[84px]">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  done ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-body-lg">{step.icon}</span>
              </div>
              <span className={`text-caption text-center font-semibold ${done ? "text-primary" : "text-on-surface-variant"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-[2px] w-8 md:w-12 -mt-5 ${stepIndex < currentIndex ? "bg-primary" : "bg-outline-variant"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
