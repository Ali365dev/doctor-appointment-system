import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { uploadPaymentQr, deleteUploadedAsset } from "@/services/cloudinary";
import { getPaymentSettings, updatePaymentSettings } from "@/services/mongodb/repositories/paymentSettings.repository";

const METHOD_FIELDS = {
  bank: { url: "bankQrUrl", publicId: "bankQrPublicId" },
  jazzcash: { url: "jazzcashQrUrl", publicId: "jazzcashQrPublicId" },
  easypaisa: { url: "easypaisaQrUrl", publicId: "easypaisaQrPublicId" },
} as const;

type QrMethod = keyof typeof METHOD_FIELDS;

function isQrMethod(value: unknown): value is QrMethod {
  return typeof value === "string" && value in METHOD_FIELDS;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const method = formData.get("method");
    const file = formData.get("file");

    if (!isQrMethod(method)) {
      return NextResponse.json({ error: "method must be bank, jazzcash, or easypaisa" }, { status: 400 });
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "An image file is required" }, { status: 400 });
    }

    const previous = await getPaymentSettings();
    const uploaded = await uploadPaymentQr(file);
    const fields = METHOD_FIELDS[method];

    const settings = await updatePaymentSettings({
      [fields.url]: uploaded.secureUrl,
      [fields.publicId]: uploaded.publicId,
    });

    const previousPublicId = previous[fields.publicId as keyof typeof previous] as string | undefined;
    if (previousPublicId) {
      await deleteUploadedAsset(previousPublicId);
    }

    return NextResponse.json({ settings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
