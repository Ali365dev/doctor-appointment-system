import Link from "next/link";

export default function ReportsHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
      <div>
        <nav className="flex items-center gap-1 text-caption text-on-surface-variant mb-1">
          <Link href="/patient/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold">Medical Records</span>
        </nav>
        <h1 className="text-headline-lg font-bold text-on-surface">Medical Records</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Upload reports, prescriptions, and test results — and discuss them directly with your doctor.
        </p>
      </div>
      <Link
        href="/patient/medical-records/upload"
        className="bg-primary text-on-primary font-bold px-lg py-sm rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-xs whitespace-nowrap"
      >
        <span className="material-symbols-outlined text-body-lg">upload_file</span>
        Upload Report
      </Link>
    </div>
  );
}
