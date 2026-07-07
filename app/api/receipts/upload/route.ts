import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId, isValidPaymentMethod } from "@/lib/validators";
import { uploadReceiptImage } from "@/services/cloudinary";
import { createPaymentForAppointment, PaymentServiceError } from "@/services/api/payment";
import { AppointmentServiceError } from "@/services/api/appointment";

/**
 * Shared receipt-upload endpoint used by the single /book-appointment/upload-receipt
 * page for both JazzCash and Easypaisa manual payments. Uploads the file to
 * Cloudinary, then creates the Payment record via the same
 * createPaymentForAppointment() used everywhere else — no separate payment logic.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const appointmentId = formData.get("appointmentId");
    const method = formData.get("method");
    const transactionRef = formData.get("transactionRef");
    const file = formData.get("file");

    if (!isValidObjectId(appointmentId)) {
      return NextResponse.json({ error: "A valid appointmentId is required" }, { status: 400 });
    }
    if (!isValidPaymentMethod(method) || method === "stripe" || method === "reception") {
      return NextResponse.json({ error: "method must be jazzcash or easypaisa" }, { status: 400 });
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "A receipt file is required" }, { status: 400 });
    }

    const uploaded = await uploadReceiptImage(file);

    const payment = await createPaymentForAppointment({
      appointmentId,
      method,
      transactionRef: typeof transactionRef === "string" ? transactionRef : undefined,
      receiptUrl: uploaded.secureUrl,
      receiptPublicId: uploaded.publicId,
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) {
    if (err instanceof PaymentServiceError || err instanceof AppointmentServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
