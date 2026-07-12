import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId, validateClinicBody } from "@/lib/validators";
import { findClinicById, updateClinic, deleteClinic } from "@/services/mongodb/repositories/clinic.repository";
import { timingsFromSchedule } from "@/lib/slots";
import { deleteUploadedAsset } from "@/services/cloudinary";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid clinic id" }, { status: 400 });
    }

    const clinic = await findClinicById(id);
    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    const session = await getSession();
    if (!clinic.isActive && session?.role !== "doctor") {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    return NextResponse.json({ clinic });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid clinic id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const error = validateClinicBody(body, true);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (body.name !== undefined) update.name = body.name.trim();
    if (body.address !== undefined) update.address = body.address.trim();
    if (body.city !== undefined) update.city = body.city.trim();
    if (body.phone !== undefined) update.phone = body.phone.trim();
    if (body.whatsapp !== undefined) update.whatsapp = body.whatsapp.trim();
    if (body.email !== undefined) update.email = body.email.trim();
    if (body.feePkr !== undefined) update.feePkr = body.feePkr;
    if (body.mapLink !== undefined) update.mapLink = body.mapLink.trim();
    if (body.mapEmbed !== undefined) update.mapEmbed = body.mapEmbed.trim();
    if (body.latitude !== undefined) update.latitude = body.latitude;
    if (body.longitude !== undefined) update.longitude = body.longitude;
    if (body.displayOrder !== undefined) update.displayOrder = body.displayOrder;
    if (body.isActive !== undefined) update.isActive = body.isActive;
    if (body.defaultSlotDurationMinutes !== undefined) update.defaultSlotDurationMinutes = body.defaultSlotDurationMinutes;
    if (body.schedule !== undefined) {
      update.schedule = body.schedule;
      // Keep the legacy `timings` map in sync so older UI (homepage, booking
      // flow) that still reads it reflects whatever the admin sets here.
      update.timings = timingsFromSchedule(body.schedule);
    }

    const clinic = await updateClinic(id, update);
    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    return NextResponse.json({ clinic });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid clinic id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const clinic = await findClinicById(id);
    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    await deleteClinic(id);

    if (clinic.imagePublicId) {
      await deleteUploadedAsset(clinic.imagePublicId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
