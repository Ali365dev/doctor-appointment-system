import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { validateClinicBody } from "@/lib/validators";
import {
  findActiveClinics,
  findAllClinics,
  createClinic,
} from "@/services/mongodb/repositories/clinic.repository";
import { defaultWeeklySchedule } from "@/types/clinic";
import { timingsFromSchedule } from "@/lib/slots";

export async function GET() {
  try {
    const session = await getSession();
    const clinics = session?.role === "doctor" ? await findAllClinics() : await findActiveClinics();
    return NextResponse.json({ clinics });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const error = validateClinicBody(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const schedule = body.schedule ?? defaultWeeklySchedule();

    const clinic = await createClinic({
      name: body.name.trim(),
      address: body.address?.trim() || undefined,
      city: body.city.trim(),
      phone: body.phone?.trim() || undefined,
      whatsapp: body.whatsapp?.trim() || undefined,
      email: body.email?.trim() || undefined,
      feePkr: body.feePkr,
      mapLink: body.mapLink?.trim() || undefined,
      mapEmbed: body.mapEmbed?.trim() || undefined,
      latitude: body.latitude ?? undefined,
      longitude: body.longitude ?? undefined,
      displayOrder: body.displayOrder ?? 0,
      isActive: body.isActive ?? true,
      defaultSlotDurationMinutes: body.defaultSlotDurationMinutes ?? 30,
      schedule,
      timings: timingsFromSchedule(schedule),
    });

    return NextResponse.json({ clinic }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
