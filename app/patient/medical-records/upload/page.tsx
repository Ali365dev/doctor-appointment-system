import Link from "next/link";
import UploadReportForm from "@/components/patient/reports/UploadReportForm";

export const metadata = { title: "Upload Report | CarePlus Patient Portal" };

export default function UploadReportPage() {
  return (
    <div className="max-w-3xl mx-auto px-gutter py-xl space-y-lg">
      <div>
        <nav className="flex items-center gap-1 text-caption text-on-surface-variant mb-1">
          <Link href="/patient/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/patient/medical-records" className="hover:text-primary transition-colors">Medical Records</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold">Upload</span>
        </nav>
        <h1 className="text-headline-lg font-bold text-on-surface">Upload Report</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Add your reports, prescriptions, or medicine photos for your doctor to review.
        </p>
      </div>
      <UploadReportForm />
    </div>
  );
}
