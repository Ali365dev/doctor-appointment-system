import "server-only";
import { v2 as cloudinary } from "cloudinary";

let configured = false;

/**
 * Lazily configures the Cloudinary SDK from env vars on first use, and
 * returns the configured client. Credentials are never read on the client —
 * this file is server-only.
 */
export function getCloudinary() {
  if (!configured) {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    if (!cloud_name || !api_key || !api_secret) {
      throw new Error(
        "Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
      );
    }

    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    configured = true;
  }

  return cloudinary;
}

export const CLOUDINARY_FOLDERS = {
  profileImages: "doctor-clinic/profile-images",
  receipts: "doctor-clinic/receipts",
  doctor: "doctor-clinic/doctor",
  logo: "doctor-clinic/logo",
  clinics: "doctor-clinic/clinics",
  procedures: "doctor-clinic/procedures",
  medicalReports: "doctor-clinic/medical-reports",
} as const;
