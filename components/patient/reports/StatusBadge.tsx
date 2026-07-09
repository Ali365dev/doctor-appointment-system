import { ReportStatus, STATUS_CONFIG } from "./data";

export default function StatusBadge({ status, className = "" }: { status: ReportStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-sm py-[3px] rounded-full text-caption font-bold uppercase tracking-wide ${config.className} ${className}`}
    >
      <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
      {config.label}
    </span>
  );
}
