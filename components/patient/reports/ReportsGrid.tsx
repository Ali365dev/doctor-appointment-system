"use client";

import { useRouter } from "next/navigation";
import { Report } from "./data";
import ReportCard from "./ReportCard";
import EmptyReports from "./EmptyReports";
import { ReportsGridSkeleton } from "./ReportSkeleton";

interface ReportsGridProps {
  reports: Report[];
  loading?: boolean;
  isFiltered?: boolean;
  view?: "grid" | "list";
  onDelete?: (id: string) => void;
}

export default function ReportsGrid({ reports, loading, isFiltered, view = "grid", onDelete }: ReportsGridProps) {
  const router = useRouter();

  if (loading) return <ReportsGridSkeleton />;

  if (reports.length === 0) {
    return isFiltered ? (
      <EmptyReports
        icon="search_off"
        title="No matching reports"
        description="Try adjusting your search or filters to find what you're looking for."
      />
    ) : (
      <EmptyReports
        icon="folder_off"
        title="No reports yet"
        description="Upload your first medical report, prescription, or test result to get started."
        actionLabel="Upload Report"
        onAction={() => router.push("/patient/medical-records/upload")}
      />
    );
  }

  return (
    <div
      className={
        view === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md"
          : "grid grid-cols-1 gap-sm"
      }
    >
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} onDelete={onDelete} />
      ))}
    </div>
  );
}
