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
  // PDFs must upload as "raw" — Cloudinary blocks unauthenticated delivery of
  // PDF/ZIP files served through the "image" delivery pipeline by default,
  // which would otherwise make every uploaded PDF 401 when opened.
  const isPdf = file.type === "application/pdf";
  return uploadToCloudinary(file, { folder: CLOUDINARY_FOLDERS.receipts, resourceType: isPdf ? "raw" : "image" });
}

/** Validates and uploads the doctor's CMS profile photo to the doctor folder. */
export async function uploadDoctorPhoto(file: File): Promise<CloudinaryUploadResult> {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, or WEBP images are allowed for the profile photo");
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error("Profile photo must be 5 MB or smaller");
  }
  return uploadToCloudinary(file, { folder: CLOUDINARY_FOLDERS.doctor, resourceType: "image" });
}

/** Validates and uploads the site logo to the logo folder. */
export async function uploadDoctorLogo(file: File): Promise<CloudinaryUploadResult> {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, or WEBP images are allowed for the logo");
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error("Logo file must be 5 MB or smaller");
  }
  return uploadToCloudinary(file, { folder: CLOUDINARY_FOLDERS.logo, resourceType: "image" });
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

/** Validates and uploads a procedure photo to the procedures folder. */
export async function uploadProcedureImage(file: File): Promise<CloudinaryUploadResult> {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, or WEBP images are allowed for procedure photos");
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error("Procedure photo must be 5 MB or smaller");
  }
  return uploadToCloudinary(file, { folder: CLOUDINARY_FOLDERS.procedures, resourceType: "image" });
}

/** Validates and uploads a patient-supplied medical report (image or PDF), same rules as receipts. */
export async function uploadMedicalReport(file: File): Promise<CloudinaryUploadResult> {
  if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, or PDF files are allowed for medical reports");
  }
  if (file.size > MAX_RECEIPT_SIZE_BYTES) {
    throw new Error("Medical report file must be 10 MB or smaller");
  }
  // See uploadReceiptImage — PDFs must upload as "raw" or they 401 on open.
  const isPdf = file.type === "application/pdf";
  return uploadToCloudinary(file, { folder: CLOUDINARY_FOLDERS.medicalReports, resourceType: isPdf ? "raw" : "image" });
}

/** Deletes a previously-uploaded profile photo, receipt, clinic, procedure, or medical report file from Cloudinary. */
export async function deleteUploadedAsset(publicId: string, resourceType: "image" | "raw" = "image"): Promise<void> {
  return deleteFromCloudinary(publicId, resourceType);
}
