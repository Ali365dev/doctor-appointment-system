import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import {
  createMedicalRecord,
  getMedicalRecordsForPatient,
  getAllMedicalRecordsForAdmin,
  MedicalRecordServiceError,
} from "@/services/api/medicalRecord";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.role === "doctor") {
      const reports = await getAllMedicalRecordsForAdmin();
      return NextResponse.json({ reports });
    }

    const reports = await getMedicalRecordsForPatient(session.userId);
    return NextResponse.json({ reports });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "patient") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const category = formData.get("category");
    const appointmentId = formData.get("appointmentId");
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Report title is required" }, { status: 400 });
    }
    if (typeof category !== "string" || !category.trim()) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const report = await createMedicalRecord({
      patientId: session.userId,
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : undefined,
      category: category.trim(),
      appointmentId: typeof appointmentId === "string" && appointmentId ? appointmentId : undefined,
      files,
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    if (err instanceof MedicalRecordServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
