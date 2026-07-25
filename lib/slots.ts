import { DAYS_OF_WEEK, type DayOfWeek, type WeeklySchedule } from "@/types/clinic";

/** Converts "HH:MM AM/PM" to minutes since midnight. */
export function timeToMinutes(time: string): number {
  const [timePart, period] = time.trim().split(" ");
  const [h, m] = timePart.split(":").map(Number);
  let hours = h % 12;
  if (period?.toUpperCase() === "PM") hours += 12;
  return hours * 60 + m;
}

/** Converts minutes since midnight to "HH:MM AM/PM". */
function minutesToTime(totalMinutes: number): string {
  const h24 = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

/** Maps a "YYYY-MM-DD" date string to its weekday name, e.g. "Monday". */
export function dayOfWeekForDate(dateStr: string): DayOfWeek {
  const date = new Date(`${dateStr}T00:00:00`);
  // getDay(): 0=Sunday..6=Saturday; DAYS_OF_WEEK starts at Monday.
  const jsDay = date.getDay();
  const mondayFirstIndex = (jsDay + 6) % 7;
  return DAYS_OF_WEEK[mondayFirstIndex];
}

/**
 * Generates every bookable time slot for a given date based on the clinic's
 * weekly schedule and default slot duration. Returns an empty array if the
 * clinic is closed that day (or has no schedule configured for it).
 */
export function generateSlotsForDate(
  schedule: WeeklySchedule | undefined,
  slotDurationMinutes: number,
  dateStr: string
): string[] {
  if (!schedule || slotDurationMinutes <= 0) return [];

  const day = dayOfWeekForDate(dateStr);
  const entry = schedule.find((d) => d.day === day);
  if (!entry || !entry.isOpen || !entry.startTime || !entry.endTime) return [];

  const startMin = timeToMinutes(entry.startTime);
  const endMin = timeToMinutes(entry.endTime);
  const slots: string[] = [];
  for (let min = startMin; min + slotDurationMinutes <= endMin; min += slotDurationMinutes) {
    slots.push(minutesToTime(min));
  }
  return slots;
}

/** True when the clinic's weekly schedule marks the given date's weekday as not open. */
export function isClinicClosedOnDate(schedule: WeeklySchedule | undefined, dateStr: string): boolean {
  if (!schedule) return false;
  const entry = schedule.find((d) => d.day === dayOfWeekForDate(dateStr));
  return entry ? !entry.isOpen : false;
}

/** Set of JS Date.getDay() values (0=Sun..6=Sat) the clinic is open on. */
export function openWeekdayNumbers(schedule: WeeklySchedule | undefined): Set<number> {
  if (!schedule) return new Set();
  const nameToJsDay: Record<DayOfWeek, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
  };
  return new Set(schedule.filter((d) => d.isOpen).map((d) => nameToJsDay[d.day]));
}

/**
 * Derives the legacy `timings: Record<DayName, "H:MM AM - H:MM PM">` map from
 * the structured weekly schedule, so older UI that hasn't been migrated to
 * read `schedule` directly (public homepage, booking flow) still reflects
 * whatever the admin sets in Clinic Management.
 */
export function timingsFromSchedule(schedule: WeeklySchedule): Record<string, string> {
  const timings: Record<string, string> = {};
  for (const day of schedule) {
    if (day.isOpen && day.startTime && day.endTime) {
      timings[day.day] = `${day.startTime} - ${day.endTime}`;
    }
  }
  return timings;
}
