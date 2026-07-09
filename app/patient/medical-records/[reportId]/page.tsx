import Link from "next/link";
import { getReportById } from "@/components/patient/reports/data";
import ReportDetails from "@/components/patient/reports/ReportDetails";
import EmptyReports from "@/components/patient/reports/EmptyReports";

export const metadata = { title: "Report Details | CarePlus Patient Portal" };

export default async function ReportDetailsPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = getReportById(reportId);

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto px-gutter py-xl">
        <EmptyReports
          icon="error"
          title="Report not found"
          description="This report may have been deleted or the link is incorrect."
        />
        <div className="flex justify-center mt-md">
          <Link href="/patient/medical-records" className="text-primary font-bold hover:underline">
            Back to Medical Records
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-gutter py-xl">
      <nav className="flex items-center gap-1 text-caption text-on-surface-variant mb-md">
        <Link href="/patient/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/patient/medical-records" className="hover:text-primary transition-colors">Medical Records</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-semibold">{report.title}</span>
      </nav>
      <ReportDetails report={report} />
    </div>
  );
}
