import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId } from "@/lib/validators";
import { saveDoctorReview, MedicalRecordServiceError } from "@/services/api/medicalRecord";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    if (typeof body.summary !== "string" || !body.summary.trim()) {
      return NextResponse.json({ error: "A review summary is required" }, { status: 400 });
    }

    const report = await saveDoctorReview({
      id,
      summary: body.summary.trim(),
      recommendations: Array.isArray(body.recommendations) ? body.recommendations.filter(Boolean) : [],
      medicineChanges: Array.isArray(body.medicineChanges) ? body.medicineChanges.filter(Boolean) : [],
    });
    return NextResponse.json({ report });
  } catch (err) {
    if (err instanceof MedicalRecordServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
