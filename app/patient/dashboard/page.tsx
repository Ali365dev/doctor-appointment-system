import Image from "next/image";
import Link from "next/link";
import AppointmentTable from "@/components/patient/AppointmentTable";
// <<<<<<< Updated upstream
import { getSession } from "@/lib/auth/getSession";
import { findUserById } from "@/services/mongodb/repositories/user.repository";
import { getAppointmentsForPatient } from "@/services/api/appointment";
import { toPatientPaymentStatus } from "@/lib/appointmentDisplay";
import type { PaymentDoc } from "@/services/mongodb/models/Payment";
// =======
import RecentReportsWidget from "@/components/patient/reports/RecentReportsWidget";
// >>>>>>> Stashed changes

export const metadata = { title: "Dashboard | CarePlus Patient Portal" };

export default async function PatientDashboardPage() {
  const session = await getSession();
  const [user, appointments] = await Promise.all([
    session ? findUserById(session.userId) : null,
    session ? getAppointmentsForPatient(session.userId) : [],
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appointments
    .filter((a) => (a.status === "confirmed" || a.status === "rescheduled") && a.date >= today)
    .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1))[0];

  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const mostRecent = appointments[0];
  const mostRecentPayment =
    mostRecent?.paymentId && typeof mostRecent.paymentId === "object"
      ? (mostRecent.paymentId as unknown as PaymentDoc)
      : null;

  const paymentStatusLabel = !mostRecent
    ? "No payments yet"
    : mostRecentPayment
    ? toPatientPaymentStatus(mostRecentPayment.status)
    : "Pending";

  const summaryCards = [
    {
      icon: "calendar_today",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      label: "Upcoming Appointment",
      value: upcoming?.time ?? "None scheduled",
      sub: upcoming ? upcoming.date : "Book your next visit",
      badge: upcoming?.date ?? "",
      badgeColor: "text-primary",
      href: "/patient/appointments",
    },
    {
      icon: "history",
      iconBg: "bg-secondary-container/20",
      iconColor: "text-secondary",
      label: "Appt. History",
      value: String(appointments.length),
      sub: `${completedCount} completed`,
      badge: "All time",
      badgeColor: "text-on-surface-variant",
      valueSub: `/ ${completedCount} Completed`,
      href: "/patient/appointments",
    },
    {
      icon: "check_circle",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      label: "Payment Status",
      value: paymentStatusLabel,
      sub: mostRecent ? `Last: Rs. ${mostRecent.feeSnapshotPkr.toLocaleString()}` : "—",
      badge: "",
      badgeColor: "text-emerald-600",
      href: "/patient/appointments",
    },
    {
      icon: "notifications_active",
      iconBg: "bg-tertiary-container/10",
      iconColor: "text-tertiary",
      label: "Notifications",
      value: "0 Unread",
      sub: "No new notifications",
      href: null,
    },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-gutter py-xl space-y-xl">
      {/* Welcome Banner */}
      <section>
        <div className="bg-primary rounded-2xl p-lg shadow-md flex flex-col md:flex-row items-center justify-between text-on-primary gap-md">
          <div>
            <h2 className="text-[28px] md:text-headline-lg font-bold mb-2">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h2>
            <p className="text-on-primary/80 text-body-md">Here&apos;s a summary of your health portal activity.</p>
          </div>
          <Link
            href="/book-appointment/step-1"
            className="bg-surface text-primary font-bold text-label-md px-lg py-md rounded-xl shadow-lg hover:bg-surface-container-lowest hover:scale-105 active:scale-95 transition-all flex items-center gap-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined font-bold">add</span>
            Book New Appointment
          </Link>
        </div>
      </section>



      {/* Summary Cards */}
      <section className="grid my-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {summaryCards.map((card) => {
          const cardClassName = `bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-sm transition-all duration-300 block ${
            card.href ? "hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 cursor-pointer" : ""
          }`;
          const cardBody = (
            <>
              <div className="flex justify-between items-start mb-4">
                <div className={`${card.iconBg} p-xs rounded-lg ${card.iconColor}`}>
                  <span className="material-symbols-outlined">{card.icon}</span>
                </div>
                {card.badge && <span className={`font-bold text-label-md ${card.badgeColor}`}>{card.badge}</span>}
              </div>
              <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">{card.label}</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-headline-md font-bold text-on-surface">{card.value}</p>
                {card.valueSub && (
                  <span className="text-caption text-on-surface-variant">{card.valueSub}</span>
                )}
              </div>
              <p className="text-caption text-on-surface-variant mt-2">{card.sub}</p>
            </>
          );
          return card.href ? (
            <Link key={card.label} href={card.href} className={cardClassName}>
              {cardBody}
            </Link>
          ) : (
            <div key={card.label} className={cardClassName}>
              {cardBody}
            </div>
          );
        })}
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

      {/* Recent Medical Records 
      <RecentReportsWidget />*/}
    </div>
  );
}
