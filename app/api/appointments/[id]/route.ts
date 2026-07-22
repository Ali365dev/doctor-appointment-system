import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId } from "@/lib/validators";
import {
  getAppointmentById,
  changeAppointmentStatus,
  AppointmentServiceError,
} from "@/services/api/appointment";
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@/types/appointment";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    return NextResponse.json({ appointment });
  } catch (err) {
    if (err instanceof AppointmentServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid appointment id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status, note } = await req.json();
    if (typeof status !== "string" || !(APPOINTMENT_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: "A valid status is required" }, { status: 400 });
    }

    // Only a doctor session can reach this route (checked above) — record the
    // human-readable role, not the raw userId, matching "system"/"patient"
    // elsewhere in the status history so the timeline UI never leaks raw ids.
    const appointment = await changeAppointmentStatus(id, status as AppointmentStatus, "admin", note);
    return NextResponse.json({ appointment });
  } catch (err) {
    if (err instanceof AppointmentServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
