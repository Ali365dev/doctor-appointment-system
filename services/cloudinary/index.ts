import "server-only";
import { CLOUDINARY_FOLDERS } from "./config";
import { uploadToCloudinary, type CloudinaryUploadResult } from "./upload";
import { deleteFromCloudinary } from "./delete";

export { getCloudinary, CLOUDINARY_FOLDERS } from "./config";
export { uploadToCloudinary, type CloudinaryUploadResult } from "./upload";
export { deleteFromCloudinary } from "./delete";

export const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_RECEIPT_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
export const MAX_RECEIPT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/** Validates and uploads a patient profile photo to the profile-images folder. */
export async function uploadProfileImage(file: File): Promise<CloudinaryUploadResult> {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, or WEBP images are allowed for profile photos");
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error("Profile photo must be 5 MB or smaller");
  }
  return uploadToCloudinary(file, { folder: CLOUDINARY_FOLDERS.profileImages, resourceType: "image" });
}

/** Validates and uploads a payment receipt (image or PDF) to the receipts folder. */
export async function uploadReceiptImage(file: File): Promise<CloudinaryUploadResult> {
  if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, or PDF files are allowed for receipts");
  }
  if (file.size > MAX_RECEIPT_SIZE_BYTES) {
    throw new Error("Receipt file must be 10 MB or smaller");
  }
  return uploadToCloudinary(file, { folder: CLOUDINARY_FOLDERS.receipts, resourceType: "image" });
}

/** Validates and uploads a clinic photo to the clinics folder. */
export async function uploadClinicImage(file: File): Promise<CloudinaryUploadResult> {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, or WEBP images are allowed for clinic photos");
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error("Clinic photo must be 5 MB or smaller");
  }
  return uploadToCloudinary(file, { folder: CLOUDINARY_FOLDERS.clinics, resourceType: "image" });
}

/** Deletes a previously-uploaded profile photo, receipt, or clinic photo from Cloudinary. */
export async function deleteUploadedAsset(publicId: string): Promise<void> {
  return deleteFromCloudinary(publicId, "image");
}
