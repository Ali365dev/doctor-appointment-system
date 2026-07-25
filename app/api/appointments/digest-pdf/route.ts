import { NextRequest, NextResponse } from "next/server";
import { verifyDigestPdfToken } from "@/lib/digestPdfToken";
import { findAppointmentsByDate } from "@/services/mongodb/repositories/appointment.repository";
import { getCmsProfile } from "@/services/mongodb/repositories/cms.repository";
import { createLetterheadPdf } from "@/lib/pdf/letterhead";
import { addDaysToDateString } from "@/lib/timezone";
import type { AppointmentDoc } from "@/services/mongodb/models/Appointment";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function toRow(appt: AppointmentDoc): (string | number)[] {
  const clinic = appt.clinicId as unknown as { name?: string } | null;
  return [
    appt.time,
    appt.patientSnapshot?.fullName ?? "Unknown",
    appt.procedureNameSnapshot ?? "Consultation",
    clinic?.name ?? "—",
    appt.status,
  ];
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  const token = req.nextUrl.searchParams.get("token") ?? "";

  if (!DATE_REGEX.test(date)) {
    return NextResponse.json({ error: "Invalid or missing date" }, { status: 400 });
  }
  if (!verifyDigestPdfToken(date, token)) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
  }

  try {
    const tomorrow = addDaysToDateString(date, 1);
    const [profile, todayAppointments, tomorrowAppointments] = await Promise.all([
      getCmsProfile(),
      findAppointmentsByDate(date),
      findAppointmentsByDate(tomorrow),
    ]);

    const { doc, renderTable, drawFooter, drawSectionTitle, headerHeight } = await createLetterheadPdf(
      { name: profile.name, designation: profile.designation, contactPhone: profile.contactPhone, contactEmail: profile.contactEmail },
      { title: "Appointment Digest", orientation: "landscape" }
    );

    const headers = ["Time", "Patient", "Procedure", "Clinic", "Status"];
    let y = headerHeight + 12;

    y = drawSectionTitle(`Today — ${date} (${todayAppointments.length})`, y);
    if (todayAppointments.length > 0) {
      y = renderTable({ startY: y, headers, rows: todayAppointments.map(toRow), badgeColumns: ["Status"] });
    } else {
      doc.setFont("helvetica", "italic").setFontSize(9).text("No appointments scheduled.", 14, y + 4);
      y += 10;
    }

    y += 12;
    y = drawSectionTitle(`Tomorrow — ${tomorrow} (${tomorrowAppointments.length})`, y);
    if (tomorrowAppointments.length > 0) {
      renderTable({ startY: y, headers, rows: tomorrowAppointments.map(toRow), badgeColumns: ["Status"] });
    } else {
      doc.setFont("helvetica", "italic").setFontSize(9).text("No appointments scheduled.", 14, y + 4);
    }

    drawFooter();

    const buffer = Buffer.from(doc.output("arraybuffer"));
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="appointment-digest-${date}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
