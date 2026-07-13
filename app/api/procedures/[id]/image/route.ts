import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { isValidObjectId } from "@/lib/validators";
import { uploadProcedureImage, deleteUploadedAsset } from "@/services/cloudinary";
import { findProcedureById, updateProcedure } from "@/services/mongodb/repositories/procedure.repository";

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

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "An image file is required" }, { status: 400 });
    }

    const previousProcedure = await findProcedureById(id);
    if (!previousProcedure) {
      return NextResponse.json({ error: "Procedure not found" }, { status: 404 });
    }

    const uploaded = await uploadProcedureImage(file);
    const procedure = await updateProcedure(id, { image: uploaded.secureUrl, imagePublicId: uploaded.publicId });

    if (previousProcedure.imagePublicId) {
      await deleteUploadedAsset(previousProcedure.imagePublicId);
    }

    return NextResponse.json({ procedure });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
