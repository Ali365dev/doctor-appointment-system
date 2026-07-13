import { NextRequest, NextResponse } from "next/server";
import { uploadMedicalReport } from "@/services/cloudinary";

/**
 * Uploads a patient-supplied medical report before an Appointment record
 * exists (Step 3 of booking) — returns just the URL, which the client stores
 * and sends along with the rest of the booking data at Step 4/5.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "A file is required" }, { status: 400 });
    }

    const uploaded = await uploadMedicalReport(file);
    return NextResponse.json({ url: uploaded.secureUrl }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
