import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId } from "@/lib/validators";
import { getPatientDetail, PatientServiceError } from "@/services/api/patient";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid patient id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patient = await getPatientDetail(id);
    return NextResponse.json({ patient });
  } catch (err) {
    if (err instanceof PatientServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
