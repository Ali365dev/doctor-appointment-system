"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { doctor } from "@/lib/data";
import type { AppointmentStatus, VisitType } from "@/types/appointment";
import type { PaymentStatus } from "@/types/payment";

interface ApiAppointment {
  _id: string;
  appointmentNumber: string;
  clinicId: { _id: string; name: string } | string;
  visitType: VisitType;
  date: string;
  time: string;
  patientId?: string;
  patientSnapshot: { fullName: string };
  feeSnapshotPkr: number;
  status: AppointmentStatus;
  createdAt: string;
}

interface ApiPayment {
  _id: string;
  status: PaymentStatus;
  amountPkr: number;
  createdAt: string;
}

interface DashboardContentProps {
  appointments: ApiAppointment[];
  payments: ApiPayment[];
}

const STATUS_META: Record<AppointmentStatus, { label: string; cls: string }> = {
  pending_payment: { label: "Pending Payment", cls: "bg-amber-100 text-amber-700" },
  payment_submitted: { label: "Payment Submitted", cls: "bg-amber-100 text-amber-700" },
  payment_verification: { label: "Payment Verification", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", cls: "bg-secondary/10 text-secondary" },
  completed: { label: "Completed", cls: "bg-surface-container-highest text-on-surface-variant" },
  cancelled: { label: "Cancelled", cls: "bg-error/10 text-error" },
  rejected: { label: "Rejected", cls: "bg-error/10 text-error" },
  rescheduled: { label: "Rescheduled", cls: "bg-primary/10 text-primary" },
  no_show: { label: "No Show", cls: "bg-error/10 text-error" },
};

function clinicName(clinicId: ApiAppointment["clinicId"]): string {
  return typeof clinicId === "string" ? clinicId : clinicId?.name ?? "—";
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function getCalendarCells(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
}

const today = new Date();
const todayStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const todayIso = today.toISOString().slice(0, 10);

export default function DashboardContent({ appointments, payments }: DashboardContentProps) {
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(todayIso);

  const cells = getCalendarCells(calYear, calMonth);
  const monthLabel = new Date(calYear, calMonth, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  const daysWithAppointments = useMemo(() => {
    const set = new Set<number>();
    for (const a of appointments) {
      const d = new Date(a.date + "T00:00:00");
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) set.add(d.getDate());
    }
    return set;
  }, [appointments, calYear, calMonth]);

  const todaysSchedule = useMemo(
    () =>
      appointments
        .filter((a) => a.date === todayIso && a.status !== "cancelled" && a.status !== "rejected")
        .sort((a, b) => (a.time > b.time ? 1 : -1)),
    [appointments]
  );

  const selectedSchedule = useMemo(
    () =>
      appointments
        .filter((a) => a.date === selectedDate && a.status !== "cancelled" && a.status !== "rejected")
        .sort((a, b) => (a.time > b.time ? 1 : -1)),
    [appointments, selectedDate]
  );

  const selectedDateLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const kpis = useMemo(() => {
    const activeToday = todaysSchedule.filter((a) => a.status === "confirmed" || a.status === "completed").length;

    const pendingPayments = payments.filter((p) => p.status === "pending" || p.status === "submitted");
    const urgentPayments = payments.filter((p) => p.status === "submitted").length;

    const now = new Date();
    const monthlyRevenue = payments
      .filter((p) => {
        if (p.status !== "verified") return false;
        const d = new Date(p.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, p) => sum + p.amountPkr, 0);

    const totalPatients = new Set(appointments.map((a) => a.patientId).filter(Boolean)).size;

    return [
      { label: "Today's Appointments", value: todaysSchedule.length, sub: `${activeToday} confirmed`, icon: "event", color: "bg-primary/10 text-primary", href: "/admin/appointments" },
      { label: "Pending Payments", value: pendingPayments.length, sub: `${urgentPayments} awaiting verification`, icon: "pending_actions", color: "bg-tertiary/10 text-tertiary", href: "/admin/payments" },
      { label: "Revenue This Month", value: `Rs. ${monthlyRevenue.toLocaleString()}`, sub: "From verified payments", icon: "trending_up", color: "bg-secondary/10 text-secondary", href: "/admin/payments" },
      { label: "Total Patients", value: totalPatients, sub: "Registered bookings", icon: "person_add", color: "bg-surface-container-high text-on-surface", href: "/admin/patients" },
    ];
  }, [todaysSchedule, payments, appointments]);

  const revenueTrend = useMemo(() => {
    const days: { iso: string; label: string; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      days.push({ iso, label, revenue: 0 });
    }
    const byDay = new Map(days.map((d) => [d.iso, d]));
    for (const p of payments) {
      if (p.status !== "verified") continue;
      const iso = new Date(p.createdAt).toISOString().slice(0, 10);
      const entry = byDay.get(iso);
      if (entry) entry.revenue += p.amountPkr;
    }
    return days;
  }, [payments]);

  // Per-day appointment counts for whichever month the mini calendar is
  // currently browsing — updates live as calMonth/calYear change.
  const dailyAppointmentsInMonth = useMemo(() => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, count: 0 }));
    for (const a of appointments) {
      const d = new Date(a.date + "T00:00:00");
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
        days[d.getDate() - 1].count += 1;
      }
    }
    return days;
  }, [appointments, calYear, calMonth]);

  return (
    <div className="px-gutter py-lg max-w-[1280px] mx-auto">
      <div className="flex items-start justify-between mb-lg">
        <div>
          <h1 className="text-headline-md font-bold text-primary">Overview</h1>
          <p className="text-caption text-on-surface-variant">{todayStr}</p>
        </div>
        <Link href="/admin/appointments"
          className="flex items-center gap-xs px-md py-xs bg-primary text-on-primary rounded-xl text-label-md font-semibold hover:shadow-lg transition-all">
          <span className="material-symbols-outlined">event</span> View Appointments
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-xs hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-label-md">{k.label}</span>
              <span className={`p-xs rounded-lg ${k.color}`}>
                <span className="material-symbols-outlined">{k.icon}</span>
              </span>
            </div>
            <span className="text-headline-lg font-bold">{k.value}</span>
            <span className="text-caption text-secondary font-medium">{k.sub}</span>
          </Link>
        ))}
      </div>

      {/* Bookings & Revenue by period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-xl">
         <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm">
            <h3 className="text-headline-md font-semibold mb-md">Revenue — Last 14 Days</h3>
            {revenueTrend.every((d) => d.revenue === 0) ? (
              <p className="text-body-md text-on-surface-variant text-center py-lg">No verified payments in this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#006591" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#006591" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e1e2ed" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#737686" }}
                    axisLine={{ stroke: "#e1e2ed" }}
                    tickLine={false}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#737686" }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                  />
                  <Tooltip
                    formatter={(value) => [`Rs. ${Number(Array.isArray(value) ? value[0] : value ?? 0).toLocaleString()}`, "Revenue"]}
                    contentStyle={{ borderRadius: 8, borderColor: "#c3c6d7", fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#006591"
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
            <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm">
            <h3 className="text-headline-md font-semibold mb-md">Appointments by Day — {monthLabel}</h3>
            {appointments.length === 0 ? (
              <p className="text-body-md text-on-surface-variant text-center py-lg">No appointments recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyAppointmentsInMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e1e2ed" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "#737686" }}
                    axisLine={{ stroke: "#e1e2ed" }}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#737686" }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(day) => `${monthLabel.split(" ")[0]} ${day}`}
                    contentStyle={{ borderRadius: 8, borderColor: "#c3c6d7", fontSize: 12 }}
                  />
                  <Bar dataKey="count" name="Appointments" fill="#006591" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl items-start">
        {/* Left: Today's Schedule */}
        <div className="lg:col-span-2 flex flex-col gap-xl">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="px-md py-sm border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="text-headline-md font-semibold">
                  {selectedDate === todayIso ? "Today's Schedule" : "Schedule"}
                </h3>
                {selectedDate !== todayIso && (
                  <p className="text-caption text-on-surface-variant">{selectedDateLabel}</p>
                )}
              </div>
              <div className="flex items-center gap-sm">
                {selectedDate !== todayIso && (
                  <button
                    onClick={() => setSelectedDate(todayIso)}
                    className="text-primary text-label-md hover:underline"
                  >
                    Back to Today
                  </button>
                )}
                <Link href="/admin/appointments" className="text-primary text-label-md hover:underline">
                  View All
                </Link>
              </div>
            </div>
            <div className="divide-y divide-outline-variant/20 max-h-105 overflow-y-auto">
              {selectedSchedule.length === 0 ? (
                <p className="px-md py-lg text-center text-on-surface-variant text-body-md">
                  No appointments scheduled for {selectedDate === todayIso ? "today" : "this day"}.
                </p>
              ) : (
                selectedSchedule.map((item) => {
                  const meta = STATUS_META[item.status];
                  return (
                    <div key={item._id} className="px-md py-sm flex items-center justify-between hover:bg-surface-container/50 transition-colors">
                      <div className="flex items-center gap-md">
                        <div className="text-center min-w-[60px]">
                          <div className="text-label-md text-on-surface">{item.time}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                          {item.patientSnapshot.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-label-md text-on-surface">{item.patientSnapshot.fullName}</span>
                          <span className="text-caption text-on-surface-variant">
                            {item.appointmentNumber} · {clinicName(item.clinicId)} · {item.visitType === "online" ? "Online" : "In-Clinic"}
                          </span>
                        </div>
                      </div>
                      <span className={`px-xs py-[2px] ${meta.cls} text-[10px] rounded-full font-bold uppercase tracking-wider`}>
                        {meta.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Calendar + Quick Actions */}
        <div className="flex flex-col gap-xl">
          {/* Mini Calendar */}
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-sm">
              <span className="text-label-md text-on-surface font-semibold">{monthLabel}</span>
              <div className="flex gap-xs">
                <button onClick={prevMonth} className="p-xs rounded-lg hover:bg-surface-container-high">
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
                </button>
                <button onClick={nextMonth} className="p-xs rounded-lg hover:bg-surface-container-high">
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-xs text-center">
              {DAYS.map((d, i) => (
                <div key={i} className="text-[10px] font-bold text-on-surface-variant">{d}</div>
              ))}
              {cells.map((day, i) => {
                const isToday =
                  day === today.getDate() &&
                  calMonth === today.getMonth() &&
                  calYear === today.getFullYear();
                const cellIso =
                  day !== null
                    ? `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    : null;
                const isSelected = cellIso === selectedDate;
                const hasAppointments = day !== null && daysWithAppointments.has(day);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={day === null}
                    onClick={() => cellIso && setSelectedDate(cellIso)}
                    className={`relative text-caption py-xs rounded-md w-full ${
                      day === null
                        ? "opacity-0 pointer-events-none"
                        : isSelected
                        ? "bg-primary text-on-primary font-bold"
                        : isToday
                        ? "ring-2 ring-primary text-on-surface font-bold"
                        : "hover:bg-primary/10 text-on-surface cursor-pointer"
                    }`}
                  >
                    {day}
                    {hasAppointments && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm">
            <h3 className="text-label-md font-semibold text-on-surface mb-md">Quick Actions</h3>
            <div className="space-y-sm">
              {[
                { icon: "qr_code_scanner", label: "Verify Appointment", href: "/admin/appointments/verify", color: "text-primary" },
                { icon: "payments", label: "Review Payments", href: "/admin/payments", color: "text-secondary" },
                { icon: "group", label: "Patient Directory", href: "/admin/patients", color: "text-tertiary", external: false },
              ].map(({ icon, label, href, color, external }) => (
                <Link key={label} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-sm px-sm py-xs rounded-lg hover:bg-surface-container-high transition-colors group">
                  <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                  <span className="text-body-md text-on-surface group-hover:text-primary transition-colors">{label}</span>
                  <span className="material-symbols-outlined text-outline-variant ml-auto text-[18px]">chevron_right</span>
                </Link>
              ))}
            </div>
          </div>

        
        </div>
      </div>
    </div>
  );
}
