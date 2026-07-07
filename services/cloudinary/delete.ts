import "server-only";
import { getCloudinary } from "./config";

/**
 * Deletes a Cloudinary asset by its public ID. Swallows "not found" style
 * failures so a missing/already-deleted asset never blocks the caller's
 * main flow (e.g. saving a new profile photo shouldn't fail just because
 * the old one was already gone).
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "raw" = "image"
): Promise<void> {
  try {
    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn(`[cloudinary] Failed to delete asset ${publicId}:`, err);
  }
}
