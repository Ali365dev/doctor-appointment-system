import { NextRequest, NextResponse } from "next/server";
import { getDigestSettings, markDigestSent } from "@/services/mongodb/repositories/digestSettings.repository";
import { findAppointmentsByDate } from "@/services/mongodb/repositories/appointment.repository";
import { sendEmail } from "@/services/notifications/email.provider";
import { dailyAppointmentDigestEmail, appUrl, type DigestAppointmentRow } from "@/services/notifications/templates";
import { getClinicDateString, getClinicTimeString, addDaysToDateString, minutesSinceMidnight } from "@/lib/timezone";
import { createDigestPdfToken } from "@/lib/digestPdfToken";
import type { AppointmentDoc } from "@/services/mongodb/models/Appointment";

// Matches the interval the external pinger (cron-job.org) is configured to
// hit this endpoint at — must be >= that interval so no window is missed.
const WINDOW_TOLERANCE_MINUTES = 15;

function toDigestRow(appt: AppointmentDoc): DigestAppointmentRow {
  const clinic = appt.clinicId as unknown as { name?: string } | null;
  return {
    time: appt.time,
    patientName: appt.patientSnapshot?.fullName ?? "Unknown",
    clinicName: clinic?.name ?? "—",
    procedureName: appt.procedureNameSnapshot ?? undefined,
    status: appt.status,
  };
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (req.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const force = req.nextUrl.searchParams.get("force") === "1";
    const settings = await getDigestSettings();

    if (!settings.enabled) {
      return NextResponse.json({ sent: false, reason: "disabled" });
    }

    const today = getClinicDateString();
    if (settings.lastSentDate === today && !force) {
      return NextResponse.json({ sent: false, reason: "already_sent_today" });
    }

    if (!force) {
      const nowMinutes = minutesSinceMidnight(getClinicTimeString());
      const sendMinutes = minutesSinceMidnight(settings.sendTime);
      const inWindow = nowMinutes >= sendMinutes && nowMinutes < sendMinutes + WINDOW_TOLERANCE_MINUTES;
      if (!inWindow) {
        return NextResponse.json({ sent: false, reason: "outside_window" });
      }
    }

    const adminEmail = settings.email ?? process.env.ADMIN_DIGEST_EMAIL;
    if (!adminEmail) {
      return NextResponse.json({ error: "No digest recipient configured (set it in admin settings or ADMIN_DIGEST_EMAIL)" }, { status: 500 });
    }

    const tomorrow = addDaysToDateString(today, 1);
    const [todayAppointments, tomorrowAppointments] = await Promise.all([
      findAppointmentsByDate(today),
      findAppointmentsByDate(tomorrow),
    ]);

    const pdfToken = createDigestPdfToken(today);
    const pdfUrl = appUrl(`/api/appointments/digest-pdf?date=${today}&token=${pdfToken}`);

    const { subject, html, text } = dailyAppointmentDigestEmail({
      today,
      todayAppointments: todayAppointments.map(toDigestRow),
      tomorrow,
      tomorrowAppointments: tomorrowAppointments.map(toDigestRow),
      pdfUrl,
    });

    const sent = await sendEmail(adminEmail, { subject, html, text });
    if (!sent) {
      return NextResponse.json({ error: "Email send failed or not configured" }, { status: 500 });
    }

    await markDigestSent(today);
    return NextResponse.json({ sent: true, today, tomorrow, todayCount: todayAppointments.length, tomorrowCount: tomorrowAppointments.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
