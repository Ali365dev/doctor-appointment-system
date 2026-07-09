interface EmptyReportsProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyReports({
  icon = "folder_off",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyReportsProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-xl px-md rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-md">
        <span className="material-symbols-outlined text-headline-lg">{icon}</span>
      </div>
      <h3 className="text-headline-md font-bold text-on-surface mb-1">{title}</h3>
      {description && (
        <p className="text-body-md text-on-surface-variant max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-md bg-primary text-on-primary font-bold px-lg py-sm rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-body-lg">add</span>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
