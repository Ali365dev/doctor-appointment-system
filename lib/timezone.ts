const CLINIC_TIMEZONE = "Asia/Karachi";

/** Current date in the clinic's timezone, as "YYYY-MM-DD". */
export function getClinicDateString(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Current time in the clinic's timezone, as 24-hour "HH:MM". */
export function getClinicTimeString(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: CLINIC_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
}

/** "YYYY-MM-DD" for the day after the given date string, staying in the clinic's calendar. */
export function addDaysToDateString(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 12));
  utcNoon.setUTCDate(utcNoon.getUTCDate() + days);
  return utcNoon.toISOString().slice(0, 10);
}

/**
 * Minutes elapsed since midnight for a "HH:MM" string, for window comparisons
 * (e.g. "is now within N minutes of the configured send time").
 */
export function minutesSinceMidnight(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
