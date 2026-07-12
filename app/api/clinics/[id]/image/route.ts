import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId } from "@/lib/validators";
import { uploadClinicImage, deleteUploadedAsset } from "@/services/cloudinary";
import { findClinicById, updateClinic } from "@/services/mongodb/repositories/clinic.repository";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid clinic id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "An image file is required" }, { status: 400 });
    }

    const previousClinic = await findClinicById(id);
    if (!previousClinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    const uploaded = await uploadClinicImage(file);
    const clinic = await updateClinic(id, { image: uploaded.secureUrl, imagePublicId: uploaded.publicId });

    if (previousClinic.imagePublicId) {
      await deleteUploadedAsset(previousClinic.imagePublicId);
    }

    return NextResponse.json({ clinic });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
