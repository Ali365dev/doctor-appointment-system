import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId } from "@/lib/validators";
import {
  getAppointmentById,
  cancelAppointment,
  AppointmentServiceError,
} from "@/services/api/appointment";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid appointment id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const appointment = await getAppointmentById(id);
    const isOwner = session.role === "patient" && String(appointment.patientId) === session.userId;
    if (session.role !== "doctor" && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { note } = await req.json().catch(() => ({ note: undefined }));
    const updated = await cancelAppointment(id, session.userId, note);
    return NextResponse.json({ appointment: updated });
  } catch (err) {
    if (err instanceof AppointmentServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
