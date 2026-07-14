import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId } from "@/lib/validators";
import {
  getMedicalRecordById,
  getMedicalRecordForAdmin,
  removeMedicalRecord,
  removeMedicalRecordAsAdmin,
  MedicalRecordServiceError,
} from "@/services/api/medicalRecord";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.role === "doctor") {
      const report = await getMedicalRecordForAdmin(id);
      return NextResponse.json({ report });
    }

    const report = await getMedicalRecordById(id, session.userId);
    return NextResponse.json({ report });
  } catch (err) {
    if (err instanceof MedicalRecordServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.role === "doctor") {
      await removeMedicalRecordAsAdmin(id);
    } else {
      await removeMedicalRecord(id, session.userId);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof MedicalRecordServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
