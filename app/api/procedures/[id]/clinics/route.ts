import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId, validateClinicProcedureBody } from "@/lib/validators";
import { findProcedureById } from "@/services/mongodb/repositories/procedure.repository";
import {
  findAssignmentsForProcedure,
  upsertAssignment,
} from "@/services/mongodb/repositories/clinicProcedure.repository";
import type { DayOfWeek } from "@/types/clinic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid procedure id" }, { status: 400 });
    }

    const session = await getSession();
    const assignments = await findAssignmentsForProcedure(id);
    // Public callers (booking flow, procedure detail page) only ever need active assignments.
    const visible = session?.role === "doctor" ? assignments : assignments.filter((a) => a.isActive);

    return NextResponse.json({ assignments: visible });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid procedure id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const procedure = await findProcedureById(id);
    if (!procedure) {
      return NextResponse.json({ error: "Procedure not found" }, { status: 404 });
    }

    const body = await req.json();
    const error = validateClinicProcedureBody(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const assignment = await upsertAssignment({
      clinicId: body.clinicId,
      procedureId: id,
      priceOverridePkr: body.priceOverridePkr ?? undefined,
      durationOverrideMinutes: body.durationOverrideMinutes ?? undefined,
      availableDays: body.availableDays as DayOfWeek[] | undefined,
      isActive: body.isActive ?? true,
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
