import Link from "next/link";
import { getReportById } from "@/components/patient/reports/data";
import DiscussionPanel from "@/components/patient/reports/DiscussionPanel";
import EmptyReports from "@/components/patient/reports/EmptyReports";

export const metadata = { title: "Discuss Report | CarePlus Patient Portal" };

export default async function ReportDiscussionPage({
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
    <div className="max-w-5xl mx-auto px-gutter py-xl space-y-md">
      <nav className="flex items-center gap-1 text-caption text-on-surface-variant">
        <Link href="/patient/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/patient/medical-records" className="hover:text-primary transition-colors">Medical Records</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href={`/patient/medical-records/${report.id}`} className="hover:text-primary transition-colors">
          {report.title}
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-semibold">Discussion</span>
      </nav>
      <h1 className="text-headline-lg font-bold text-on-surface">Discuss: {report.title}</h1>
      <DiscussionPanel report={report} />
    </div>
  );
}
