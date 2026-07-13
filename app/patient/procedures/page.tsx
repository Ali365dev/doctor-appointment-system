import Link from "next/link";
import AppointmentTable from "@/components/patient/AppointmentTable";

export const metadata = { title: "My Procedures | CarePlus Patient Portal" };

export default function MyProceduresPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-gutter py-xl space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">My Procedures</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Upcoming, completed, and cancelled procedure bookings.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-xs bg-primary text-on-primary font-bold text-label-md px-md py-sm rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Book a Procedure
        </Link>
      </div>

      <AppointmentTable showSearch onlyProcedures />
    </div>
  );
}
