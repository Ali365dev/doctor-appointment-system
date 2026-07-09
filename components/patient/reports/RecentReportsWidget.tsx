import Link from "next/link";
import { getRecentReports, formatDate } from "./data";
import StatusBadge from "./StatusBadge";
import EmptyReports from "./EmptyReports";

export default function RecentReportsWidget() {
  const reports = getRecentReports(5);

  return (
    <section className="space-y-md">
      <div className="flex items-center justify-between">
        <h3 className="text-headline-md font-bold text-on-surface">Recent Medical Records</h3>
        <div className="flex items-center gap-md">
          <Link
            href="/patient/medical-records/upload"
            className="text-primary font-bold text-label-md flex items-center gap-xs hover:underline"
          >
            <span className="material-symbols-outlined text-body-lg">upload_file</span>
            Upload
          </Link>
          <Link
            href="/patient/medical-records"
            className="text-primary font-bold text-label-md flex items-center gap-xs hover:underline"
          >
            View All
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {reports.length === 0 ? (
        <EmptyReports
          title="No reports yet"
          description="Upload your first medical report to keep your doctor in the loop."
        />
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl divide-y divide-outline-variant/20 overflow-hidden shadow-sm">
          {reports.map((r) => (
            <Link
              key={r.id}
              href={`/patient/medical-records/${r.id}`}
              className="flex items-center justify-between gap-sm px-md py-sm hover:bg-surface-container-low transition-colors"
            >
              <div className="min-w-0 flex items-center gap-sm">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-body-lg">description</span>
                </div>
                <div className="min-w-0">
                  <p className="text-label-md font-semibold text-on-surface truncate">{r.title}</p>
                  <p className="text-caption text-on-surface-variant">{formatDate(r.updatedAt)}</p>
                </div>
              </div>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
