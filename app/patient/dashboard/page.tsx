import Link from "next/link";
import AppointmentTable from "@/components/patient/AppointmentTable";

export const metadata = { title: "Dashboard | CarePlus Patient Portal" };

const summaryCards = [
  {
    icon: "calendar_today",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    label: "Upcoming Appointment",
    value: "10:30 AM",
    sub: "Dermatology Check-up",
    badge: "Oct 24",
    badgeColor: "text-primary",
  },
  {
    icon: "history",
    iconBg: "bg-secondary-container/20",
    iconColor: "text-secondary",
    label: "Appt. History",
    value: "12",
    sub: "Next available: Nov 15",
    badge: "Year to date",
    badgeColor: "text-on-surface-variant",
    valueSub: "/ 10 Completed",
  },
  {
    icon: "check_circle",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    label: "Payment Status",
    value: "Paid in Full",
    sub: "Last: $150.00 (Oct 12)",
    badge: "All Clear",
    badgeColor: "text-emerald-600",
  },
  {
    icon: "notifications_active",
    iconBg: "bg-tertiary-container/10",
    iconColor: "text-tertiary",
    label: "Notifications",
    value: "3 Unread",
    sub: "Last: Appt. Confirmed",
    badgeCircle: "3",
  },
];

export default function PatientDashboardPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-gutter py-xl space-y-xl">
      {/* Welcome Banner */}
      <section>
        <div className="bg-primary rounded-2xl p-lg shadow-md flex flex-col md:flex-row items-center justify-between text-on-primary gap-md">
          <div>
            <h2 className="text-[28px] md:text-headline-lg font-bold mb-2">Welcome back, James</h2>
            <p className="text-on-primary/80 text-body-md">Here&apos;s a summary of your health portal activity.</p>
          </div>
          <Link
            href="/book-appointment"
            className="bg-surface text-primary font-bold text-label-md px-lg py-md rounded-xl shadow-lg hover:bg-surface-container-lowest hover:scale-105 active:scale-95 transition-all flex items-center gap-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined font-bold">add</span>
            Book New Appointment
          </Link>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${card.iconBg} p-xs rounded-lg ${card.iconColor}`}>
                <span className="material-symbols-outlined">{card.icon}</span>
              </div>
              {card.badgeCircle ? (
                <span className="bg-error text-on-error text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {card.badgeCircle}
                </span>
              ) : (
                <span className={`font-bold text-label-md ${card.badgeColor}`}>{card.badge}</span>
              )}
            </div>
            <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">{card.label}</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-headline-md font-bold text-on-surface">{card.value}</p>
              {card.valueSub && (
                <span className="text-caption text-on-surface-variant">{card.valueSub}</span>
              )}
            </div>
            <p className="text-caption text-on-surface-variant mt-2">{card.sub}</p>
          </div>
        ))}
      </section>

      {/* Appointments Table */}
      <section className="space-y-md">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-md font-bold text-on-surface">Appointment Records</h3>
          <Link
            href="/patient/appointments"
            className="text-primary font-bold text-label-md flex items-center gap-xs hover:underline"
          >
            View Full History
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
        <AppointmentTable limit={2} />
      </section>
    </div>
  );
}
