import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId, validateClinicProcedureBody } from "@/lib/validators";
import {
  updateAssignment,
  removeAssignment,
} from "@/services/mongodb/repositories/clinicProcedure.repository";
import type { DayOfWeek } from "@/types/clinic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; clinicId: string }> }
) {
  try {
    const { id, clinicId } = await params;
    if (!isValidObjectId(id) || !isValidObjectId(clinicId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const error = validateClinicProcedureBody(body, true);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (body.priceOverridePkr !== undefined) update.priceOverridePkr = body.priceOverridePkr;
    if (body.durationOverrideMinutes !== undefined) update.durationOverrideMinutes = body.durationOverrideMinutes;
    if (body.availableDays !== undefined) update.availableDays = body.availableDays as DayOfWeek[];
    if (body.isActive !== undefined) update.isActive = body.isActive;

    const assignment = await updateAssignment(clinicId, id, update);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ assignment });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; clinicId: string }> }
) {
  try {
    const { id, clinicId } = await params;
    if (!isValidObjectId(id) || !isValidObjectId(clinicId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const removed = await removeAssignment(clinicId, id);
    if (!removed) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
