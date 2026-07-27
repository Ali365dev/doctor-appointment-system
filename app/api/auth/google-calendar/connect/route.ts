import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { getGoogleCalendarAuthUrl } from "@/services/google/calendar";

/** One-time setup step: doctor visits this to authorize calendar access for Google Meet link generation. */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "doctor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.redirect(getGoogleCalendarAuthUrl());
}
