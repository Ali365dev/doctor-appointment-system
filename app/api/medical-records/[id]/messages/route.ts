import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId } from "@/lib/validators";
import { addMessageToReport, addDoctorMessageToReport, MedicalRecordServiceError } from "@/services/api/medicalRecord";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await req.formData();
    const message = formData.get("message");
    const attachments = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const report =
      session.role === "doctor"
        ? await addDoctorMessageToReport(id, message.trim(), attachments)
        : await addMessageToReport({
            id,
            patientId: session.userId,
            message: message.trim(),
            attachments,
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
