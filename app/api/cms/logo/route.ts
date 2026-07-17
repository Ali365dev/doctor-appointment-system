import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { uploadDoctorLogo, deleteUploadedAsset } from "@/services/cloudinary";
import { getCmsProfile, updateCmsProfile } from "@/services/mongodb/repositories/cms.repository";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "An image file is required" }, { status: 400 });
    }

    const previous = await getCmsProfile();
    const uploaded = await uploadDoctorLogo(file);
    const cms = await updateCmsProfile({ logoUrl: uploaded.secureUrl, logoPublicId: uploaded.publicId });

    if (previous.logoPublicId) {
      await deleteUploadedAsset(previous.logoPublicId);
    }

    return NextResponse.json({ cms });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
