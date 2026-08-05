import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/getSession";
import { uploadPrepGuideTileImage, deleteUploadedAsset } from "@/services/cloudinary";
import { getCmsProfile, updateCmsProfile } from "@/services/mongodb/repositories/cms.repository";

/**
 * Uploads an image for one Preparation Guide feature tile, identified by
 * array index. Same replace-in-place / append-if-new-index behavior as the
 * Care Gallery image upload — see that route's comment for details.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const indexRaw = formData.get("index");
    const index = typeof indexRaw === "string" ? Number(indexRaw) : NaN;

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "An image file is required" }, { status: 400 });
    }
    if (!Number.isInteger(index) || index < 0) {
      return NextResponse.json({ error: "A valid index is required" }, { status: 400 });
    }

    const previous = await getCmsProfile();
    const uploaded = await uploadPrepGuideTileImage(file);

    const tiles = [...previous.prepGuideTiles];
    let oldPublicId: string | undefined;

    if (index < tiles.length) {
      oldPublicId = tiles[index].imagePublicId;
      tiles[index] = { ...tiles[index], image: uploaded.secureUrl, imagePublicId: uploaded.publicId };
    } else {
      tiles.push({ icon: "verified_user", label: "", image: uploaded.secureUrl, imagePublicId: uploaded.publicId });
    }

    const cms = await updateCmsProfile({ prepGuideTiles: tiles });
    revalidatePath("/", "layout");

    if (oldPublicId) {
      await deleteUploadedAsset(oldPublicId);
    }

    return NextResponse.json({ cms });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
