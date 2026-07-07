import "server-only";
import { getCloudinary } from "./config";

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

export interface UploadOptions {
  folder: string;
  /** "image" converts PDFs to a viewable asset too; "auto" lets Cloudinary detect. */
  resourceType?: "image" | "auto" | "raw";
}

/**
 * Uploads a File (from a multipart FormData request) to Cloudinary and
 * returns the normalized result. Shared by every upload route — never
 * duplicate this logic per-feature.
 */
export async function uploadToCloudinary(file: File, options: UploadOptions): Promise<CloudinaryUploadResult> {
  const cloudinary = getCloudinary();

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: options.folder,
    resource_type: options.resourceType ?? "auto",
  });

  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
  };
}
