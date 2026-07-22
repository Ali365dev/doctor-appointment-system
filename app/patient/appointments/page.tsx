import Link from "next/link";
import AppointmentTable from "@/components/patient/AppointmentTable";

export const metadata = { title: "Appointments | CarePlus Patient Portal" };

export default function AppointmentsPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-gutter py-xl space-y-lg">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Appointments</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">
            View and manage all your appointment records.
          </p>
        </div>
        <Link
          href="/book-appointment/step-1"
          className="inline-flex items-center gap-xs bg-primary text-on-primary font-bold text-label-md px-md py-sm rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Book New Appointment
        </Link>
      </div>

      {/* Appointments Table with search + filter */}
      <AppointmentTable showSearch />
    </div>
  );
}
