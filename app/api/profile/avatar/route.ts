import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { uploadProfileImage, deleteUploadedAsset } from "@/services/cloudinary";
import { findUserById, updateUserAvatar } from "@/services/mongodb/repositories/user.repository";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "A photo file is required" }, { status: 400 });
    }

    const previousUser = await findUserById(session.userId);

    const uploaded = await uploadProfileImage(file);
    await updateUserAvatar(session.userId, uploaded.secureUrl, uploaded.publicId);

    // Replace, don't accumulate — delete the old photo now that the new one is saved.
    if (previousUser?.avatarPublicId) {
      await deleteUploadedAsset(previousUser.avatarPublicId);
    }

    return NextResponse.json({ avatar: uploaded.secureUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await findUserById(session.userId);
    if (user?.avatarPublicId) {
      await deleteUploadedAsset(user.avatarPublicId);
    }
    await updateUserAvatar(session.userId, "", undefined);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
