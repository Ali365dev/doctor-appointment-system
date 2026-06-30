"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const TIME_SLOTS = [
  {
    key: "morning",
    label: "Morning (9:00 AM - 12:00 PM)",
    icon: "wb_sunny",
    slots: [
      { time: "09:00 AM", available: true },
      { time: "09:45 AM", available: true },
      { time: "10:30 AM", available: true },
      { time: "11:15 AM", available: true },
    ],
  },
  {
    key: "afternoon",
    label: "Afternoon (1:00 PM - 4:00 PM)",
    icon: "light_mode",
    slots: [
      { time: "01:00 PM", available: true },
      { time: "01:45 PM", available: true },
      { time: "02:30 PM", available: true },
      { time: "03:15 PM", available: true },
    ],
  },
  {
    key: "evening",
    label: "Evening (5:00 PM - 8:00 PM)",
    icon: "nights_stay",
    slots: [
      { time: "05:00 PM", available: true },
      { time: "05:45 PM", available: false },
      { time: "06:30 PM", available: true },
      { time: "07:15 PM", available: true },
    ],
  },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function BookingStep2Content() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [selectedTime, setSelectedTime] = useState<string | null>("10:30 AM");
  const router = useRouter();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const isDisabled = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < todayMidnight || d.getDay() === 0 || d.getDay() === 6;
  };

  const isToday = (day: number) =>
    currentYear === today.getFullYear() &&
    currentMonth === today.getMonth() &&
    day === today.getDate();

  const formattedDate = selectedDay
    ? new Date(currentYear, currentMonth, selectedDay).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Left column */}
      <div className="w-full lg:w-2/3 space-y-8">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface mb-2">Select Date &amp; Time</h1>
          <p className="text-body-md text-on-surface-variant">
            Please choose your preferred appointment slot with Dr. Zaid Gul.
          </p>
        </div>

        {/* Calendar */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-headline-md font-semibold">
              {MONTHS[currentMonth]} {currentYear}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={goToPrevMonth}
                className="p-2 rounded-lg hover:bg-surface-container-low transition-colors border border-outline-variant/20"
                aria-label="Previous month"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-surface-container-low transition-colors border border-outline-variant/20"
                aria-label="Next month"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 text-center text-[14px] font-semibold text-outline mb-4">
            {DAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 text-center text-body-md">
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} className="py-4" />;
              const disabled = isDisabled(day);
              const selected = selectedDay === day && !disabled;
              const todayHighlight = isToday(day) && !disabled;

              if (disabled) {
                return (
                  <div key={day} className="py-4 text-outline/30 cursor-not-allowed">
                    {day}
                  </div>
                );
              }

              return (
                <div key={day} className="py-2 flex items-center justify-center">
                  <button
                    onClick={() => setSelectedDay(day)}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-all ${
                      selected || todayHighlight
                        ? "bg-primary text-on-primary shadow-md ring-4 ring-primary/10"
                        : "hover:bg-surface-container"
                    }`}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 shadow-sm">
          <h3 className="text-headline-md font-semibold mb-8">Available Time Slots</h3>
          <div className="space-y-8">
            {TIME_SLOTS.map((group) => (
              <div key={group.key}>
                <div className="flex items-center gap-2 text-outline mb-4">
                  <span className="material-symbols-outlined text-body-md">{group.icon}</span>
                  <span className="text-[14px] font-semibold">{group.label}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {group.slots.map((slot) =>
                    slot.available ? (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`px-6 py-2.5 rounded-full border text-[14px] font-semibold transition-all active:scale-95 ${
                          selectedTime === slot.time
                            ? "bg-primary text-on-primary border-primary shadow-sm"
                            : "border-outline-variant hover:border-primary hover:text-primary"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ) : (
                      <button
                        key={slot.time}
                        disabled
                        className="px-6 py-2.5 rounded-full border border-outline-variant opacity-50 cursor-not-allowed line-through text-[14px] font-semibold"
                      >
                        {slot.time}
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/book-appointment/step-1")}
            className="flex items-center gap-2 px-8 py-3 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container transition-all active:scale-95 text-[14px] font-semibold"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Previous
          </button>
          <button
            onClick={() => router.push("/book-appointment/step-3")}
            className="flex items-center gap-2 px-10 py-3 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-all active:scale-95 text-[14px] font-semibold shadow-md shadow-primary/20"
          >
            Continue to Details
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-1/3 sticky top-32">
        <div className="bg-surface-container-highest/50 backdrop-blur-md rounded-xl border border-outline-variant/40 p-8">
          <h3 className="text-headline-md font-semibold mb-6">Appointment Summary</h3>
          <div className="space-y-6">
            {/* Provider */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high shrink-0">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoVXlCiSn2ouB_4dgLdwMjDv6OQX3SbGnGXM_bN5t_InmWUojWtyQuDeQWxbZoJ3vcUfB0QWZVOwGLWf1_9CpELpiDIopDSBE2dkVU8MMp7WFMI27FfYrjewMxGgHKPrnkdkw2cIqhY3xE9nUGYFx3n3jsnkBB_WIVJ5Cg-mz0Nc9KJexfwUUw2_FNPuv6WPte5Ip7M5FXR96puDzBbKB7WH_LT_Lqs6R_B2wqUfCbRTbL9Au3DeTDq34gx7iFHd9HA2XR2A8K_uw"
                  alt="Dr. Julian Sterling"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-primary mb-0.5">Specialist</p>
                <p className="text-[18px] font-semibold leading-tight">Dr. Julian Sterling</p>
                <p className="text-caption text-on-surface-variant">Cardiology Specialist</p>
              </div>
            </div>

            <hr className="border-outline-variant/30" />

            {/* Clinic */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined">medical_services</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-on-surface mb-0.5">Faisal Hospital</p>
                <p className="text-caption text-on-surface-variant">545 Lower Canal Road East, Faisalabad</p>
              </div>
            </div>

            {/* Date/Time */}
            <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                  <span className="text-body-md font-semibold">
                    {formattedDate ?? "Select a date"}
                  </span>
                </div>
                <span className="material-symbols-outlined text-outline-variant cursor-pointer hover:text-primary transition-colors">
                  edit
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                  <span className="text-body-md font-semibold">
                    {selectedTime ?? "Select a time"}
                  </span>
                </div>
                <span className="material-symbols-outlined text-outline-variant cursor-pointer hover:text-primary transition-colors">
                  edit
                </span>
              </div>
            </div>

            <hr className="border-outline-variant/30" />

            <div className="flex justify-between items-center text-[14px] font-semibold">
              <span className="text-on-surface-variant">Initial Consultation</span>
              <span className="text-on-surface">Rs. 2,000</span>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg flex gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">info</span>
              <p className="text-caption text-primary/80">
                Confirming this slot reserves the doctor&apos;s time specifically for your case.
                Cancellation fees apply within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
