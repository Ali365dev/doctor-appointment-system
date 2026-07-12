"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useBookingStore } from "@/store/bookingStore";
import { openWeekdayNumbers } from "@/lib/slots";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
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
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const { selectedClinic, setDate, setTime } = useBookingStore();
  const availableDayNums = openWeekdayNumbers(selectedClinic?.schedule);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const isoDate = selectedDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;

  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedClinic || !isoDate) {
        setTimeSlots([]);
        setBookedTimes(new Set());
        return;
      }
      setSlotsLoading(true);
      try {
        const res = await fetch(
          `/api/appointments/availability?clinicId=${selectedClinic.id}&date=${isoDate}`
        );
        const data = await res.json();
        if (!cancelled && res.ok) {
          setTimeSlots(data.slots ?? []);
          setBookedTimes(new Set<string>(data.bookedTimes ?? []));
        }
      } catch {
        // Non-fatal — the server re-validates at booking time regardless.
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClinic?.id, isoDate]);

  const goToPrevMonth = () => {
    const now = new Date();
    if (currentYear === now.getFullYear() && currentMonth === now.getMonth()) return;
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
    return d < todayMidnight || !availableDayNums.has(d.getDay());
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

  const handleContinue = () => {
    if (!selectedDay || !isoDate) {
      setError("Please select a date.");
      toast.error("Please select a date to continue.");
      return;
    }
    if (!selectedTime) {
      setError("Please select a time slot.");
      toast.error("Please select a time slot to continue.");
      return;
    }
    if (bookedTimes.has(selectedTime)) {
      setError("That time slot was just booked by someone else. Please choose another.");
      toast.error("That time slot is no longer available.");
      return;
    }
    setDate(isoDate);
    setTime(selectedTime);
    router.push("/book-appointment/step-3");
  };

  const clinicTimingNote = selectedClinic
    ? `Available days based on ${selectedClinic.name} timings`
    : "Select a clinic in step 1 to see available days";

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Left column */}
      <div className="w-full lg:w-2/3 space-y-8">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface mb-2">Select Date &amp; Time</h1>
          <p className="text-body-md text-on-surface-variant">
            {clinicTimingNote}
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
                className="p-2 rounded-lg hover:bg-surface-container-low transition-colors border border-outline-variant/20 disabled:opacity-30"
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

          <div className="grid grid-cols-7 text-center text-[14px] font-semibold text-outline mb-4">
            {DAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 text-center text-body-md">
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} className="py-4" />;
              const disabled = isDisabled(day);
              const selected = selectedDay === day && !disabled;
              const todayHighlight = isToday(day) && !disabled;

              if (disabled) {
                return (
                  <div key={day} className="py-4 text-outline/30 cursor-not-allowed">{day}</div>
                );
              }

              return (
                <div key={day} className="py-2 flex items-center justify-center">
                  <button
                    onClick={() => { setSelectedDay(day); setSelectedTime(null); setError(""); }}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-all ${
                      selected
                        ? "bg-primary text-on-primary shadow-md ring-4 ring-primary/10"
                        : todayHighlight
                        ? "text-primary ring-2 ring-primary/40 hover:bg-surface-container"
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
        {timeSlots.length > 0 && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 shadow-sm">
            <h3 className="text-headline-md font-semibold mb-4">Available Time Slots</h3>
            {selectedClinic && (
              <p className="text-caption text-on-surface-variant mb-6">
                {(selectedClinic.schedule ?? [])
                  .filter((d) => d.isOpen)
                  .map((d) => `${d.day}: ${d.startTime} - ${d.endTime}`)
                  .join(" · ")}
                {slotsLoading && " · Checking availability…"}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {timeSlots.map((time) => {
                const isBooked = bookedTimes.has(time);
                return (
                  <button
                    key={time}
                    disabled={isBooked}
                    onClick={() => { setSelectedTime(time); setError(""); }}
                    className={`px-6 py-2.5 rounded-full border text-[14px] font-semibold transition-all active:scale-95 ${
                      isBooked
                        ? "border-outline-variant/30 text-outline/40 bg-surface-container line-through cursor-not-allowed"
                        : selectedTime === time
                        ? "bg-primary text-on-primary border-primary shadow-sm"
                        : "border-outline-variant hover:border-primary hover:text-primary"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 border border-error/30">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-error text-body-md font-semibold">{error}</p>
          </div>
        )}

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
            onClick={handleContinue}
            className="flex items-center gap-2 px-10 py-3 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-all active:scale-95 text-[14px] font-semibold shadow-md shadow-primary/20"
          >
            Continue to Details
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Summary Sidebar */}
      <aside className="w-full lg:w-1/3 sticky top-32">
        <div className="bg-surface-container-highest/50 backdrop-blur-md rounded-xl border border-outline-variant/40 p-8">
          <h3 className="text-headline-md font-semibold mb-6">Appointment Summary</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined">medical_services</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-on-surface mb-0.5">
                  {selectedClinic?.name ?? "No clinic selected"}
                </p>
                {selectedClinic?.address && (
                  <p className="text-caption text-on-surface-variant">{selectedClinic.address}</p>
                )}
                {selectedClinic && (
                  <p className="text-caption text-primary font-semibold mt-xs">
                    Rs. {selectedClinic.fee_pkr.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                  <span className="text-body-md font-semibold">
                    {formattedDate ?? "Select a date"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                  <span className="text-body-md font-semibold">
                    {selectedTime ?? "Select a time"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg flex gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">info</span>
              <p className="text-caption text-primary/80">
                Days shown are based on {selectedClinic?.name ?? "the selected clinic"}&apos;s schedule.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
