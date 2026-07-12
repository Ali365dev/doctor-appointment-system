export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export interface ScheduleDay {
  day: DayOfWeek;
  isOpen: boolean;
  startTime: string; // "HH:MM AM/PM"
  endTime: string; // "HH:MM AM/PM"
}

export type WeeklySchedule = ScheduleDay[];

export const SLOT_DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60] as const;
export type SlotDurationMinutes = (typeof SLOT_DURATION_OPTIONS)[number];

export function defaultWeeklySchedule(): WeeklySchedule {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    isOpen: false,
    startTime: "09:00 AM",
    endTime: "05:00 PM",
  }));
}
