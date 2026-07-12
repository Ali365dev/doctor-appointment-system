import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId, isValidDateString } from "@/lib/validators";
import { getBookedTimesForClinicDate } from "@/services/api/appointment";
import { findClinicById } from "@/services/mongodb/repositories/clinic.repository";
import { generateSlotsForDate } from "@/lib/slots";

export async function GET(req: NextRequest) {
  try {
    const clinicId = req.nextUrl.searchParams.get("clinicId");
    const date = req.nextUrl.searchParams.get("date");

    if (!isValidObjectId(clinicId)) {
      return NextResponse.json({ error: "A valid clinicId is required" }, { status: 400 });
    }
    if (!isValidDateString(date)) {
      return NextResponse.json({ error: "A valid date (YYYY-MM-DD) is required" }, { status: 400 });
    }

    const clinic = await findClinicById(clinicId);
    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    const slots = generateSlotsForDate(clinic.schedule, clinic.defaultSlotDurationMinutes, date);
    const bookedTimes = await getBookedTimesForClinicDate(clinicId, date);
    return NextResponse.json({ slots, bookedTimes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
