import "server-only";
import { google } from "googleapis";
import { timeToMinutes } from "@/lib/slots";
import { CLINIC_TIMEZONE } from "@/lib/timezone";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI
  );
}

function getAuthorizedClient() {
  const client = getOAuthClient();
  client.setCredentials({ refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN });
  return client;
}

export interface CreateMeetEventParams {
  appointmentNumber: string;
  patientName: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM AM/PM" */
  time: string;
  durationMinutes: number;
}

/** Creates a Calendar event with an attached Google Meet link for a confirmed online consultation. */
export async function createGoogleMeetEvent(params: CreateMeetEventParams): Promise<string | null> {
  const calendar = google.calendar({ version: "v3", auth: getAuthorizedClient() });

  const startMinutes = timeToMinutes(params.time);
  const [year, month, day] = params.date.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const startDateTime = `${params.date}T${pad(Math.floor(startMinutes / 60))}:${pad(startMinutes % 60)}:00`;
  const endMinutes = startMinutes + params.durationMinutes;
  const endDate = new Date(Date.UTC(year, month - 1, day));
  endDate.setUTCDate(endDate.getUTCDate() + Math.floor(endMinutes / 1440));
  const endDateStr = endDate.toISOString().slice(0, 10);
  const endMinutesOfDay = ((endMinutes % 1440) + 1440) % 1440;
  const endDateTime = `${endDateStr}T${pad(Math.floor(endMinutesOfDay / 60))}:${pad(endMinutesOfDay % 60)}:00`;

  const { data } = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Online Consultation — ${params.patientName} (${params.appointmentNumber})`,
      start: { dateTime: startDateTime, timeZone: CLINIC_TIMEZONE },
      end: { dateTime: endDateTime, timeZone: CLINIC_TIMEZONE },
      conferenceData: {
        createRequest: {
          requestId: params.appointmentNumber,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  return data.hangoutLink ?? null;
}

/** One-time authorization URL — the doctor visits this once to grant calendar access. */
export function getGoogleCalendarAuthUrl(): string {
  return getOAuthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // forces Google to return a refresh_token even on repeat authorizations
    scope: SCOPES,
  });
}

/** Exchanges the one-time authorization code for tokens (called by the OAuth callback route only). */
export async function exchangeGoogleCalendarCode(code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export function isGoogleCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CALENDAR_CLIENT_ID &&
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
      process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
  );
}
