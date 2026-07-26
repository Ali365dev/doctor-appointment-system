import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/getSession";
import { uploadWhyChooseImage, deleteUploadedAsset } from "@/services/cloudinary";
import { getCmsProfile, updateCmsProfile } from "@/services/mongodb/repositories/cms.repository";

/**
 * Uploads an image for one "Why Choose Us" feature card, identified by array
 * index. If the index matches an existing card, its image is replaced (and
 * the old Cloudinary asset deleted); if it's one past the end, a new blank
 * card is appended with just the image — the admin fills in title/desc and
 * hits Save Changes to persist those via the regular PATCH /api/cms.
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
    const uploaded = await uploadWhyChooseImage(file);

    const features = [...previous.whyChooseFeatures];
    let oldPublicId: string | undefined;

    if (index < features.length) {
      oldPublicId = features[index].imagePublicId;
      features[index] = { ...features[index], image: uploaded.secureUrl, imagePublicId: uploaded.publicId };
    } else {
      features.push({ icon: "star", title: "", desc: "", image: uploaded.secureUrl, imagePublicId: uploaded.publicId });
    }

    const cms = await updateCmsProfile({ whyChooseFeatures: features });
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
