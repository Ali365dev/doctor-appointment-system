import "server-only";
import { connectDB } from "@/services/mongodb";
import {
  createPayment as createPaymentRecord,
  findPaymentById,
  findPaymentByAppointmentId,
  findAllPayments,
  updatePaymentStatus,
  clearPaymentReceipt,
} from "@/services/mongodb/repositories/payment.repository";
import {
  getAppointmentById,
  attachPaymentToAppointment,
  changeAppointmentStatus,
} from "@/services/api/appointment";
import { deleteUploadedAsset } from "@/services/cloudinary";
import type { PaymentDoc } from "@/services/mongodb/models/Payment";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";

// Receipts don't record their own file type — a PDF was uploaded as a "raw"
// Cloudinary resource (see uploadReceiptImage) while images are "image", so
// deleting the right asset means telling them apart by the stored URL.
function receiptResourceType(url?: string | null): "image" | "raw" {
  return url && /\.pdf($|\?)/i.test(url) ? "raw" : "image";
}

export class PaymentServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export interface CreatePaymentParams {
  appointmentId: string;
  method: PaymentMethod;
  transactionRef?: string;
  receiptUrl?: string;
  receiptPublicId?: string;
}

const MANUAL_RECEIPT_METHODS: PaymentMethod[] = ["jazzcash", "easypaisa", "bank"];

/**
 * Creates the Payment record for an appointment and moves the appointment
 * into the right status for its payment method:
 *  - reception: no payment needed up front -> confirmed immediately, payment stays "pending"
 *  - jazzcash/easypaisa/bank: receipt-based, goes to "submitted" -> awaits admin verification
 */
export async function createPaymentForAppointment(params: CreatePaymentParams): Promise<PaymentDoc> {
  await connectDB();

  const appointment = await getAppointmentById(params.appointmentId);

  // Online consultations have no reception desk to pay at.
  if (params.method === "reception" && appointment.visitType === "online") {
    throw new PaymentServiceError("Pay at Reception is not available for online consultations", 400);
  }

  // Re-upload after rejection: this appointment already has a previous payment
  // attempt with a receipt — delete that old Cloudinary asset so it doesn't
  // become an orphan now that a new receipt is replacing it.
  if (params.receiptPublicId) {
    const previous = await findPaymentByAppointmentId(params.appointmentId);
    if (previous?.receiptPublicId) {
      await deleteUploadedAsset(previous.receiptPublicId, receiptResourceType(previous.receiptUrl));
    }
  }

  const initialStatus: PaymentStatus = MANUAL_RECEIPT_METHODS.includes(params.method) ? "submitted" : "pending";

  const payment = await createPaymentRecord({
    appointmentId: params.appointmentId,
    method: params.method,
    amountPkr: appointment.feeSnapshotPkr,
    status: initialStatus,
    transactionRef: params.transactionRef,
    receiptUrl: params.receiptUrl,
    receiptPublicId: params.receiptPublicId,
    receiptUploadedAt: params.receiptUrl ? new Date() : undefined,
  });

  await attachPaymentToAppointment(params.appointmentId, String(payment._id));

  if (params.method === "reception") {
    await changeAppointmentStatus(params.appointmentId, "confirmed", "system", "Pay at reception — confirmed without upfront payment");
  } else if (MANUAL_RECEIPT_METHODS.includes(params.method)) {
    await changeAppointmentStatus(params.appointmentId, "payment_verification", "system", "Manual receipt submitted, awaiting admin verification");
  }

  return payment;
}

export async function getPaymentById(paymentId: string): Promise<PaymentDoc> {
  await connectDB();
  const payment = await findPaymentById(paymentId);
  if (!payment) {
    throw new PaymentServiceError("Payment not found", 404);
  }
  return payment;
}

export async function getAllPayments(filter?: { status?: PaymentStatus }): Promise<PaymentDoc[]> {
  await connectDB();
  return findAllPayments(filter);
}

/**
 * Admin-only manual verification (JazzCash/Easypaisa receipts, and marking a
 * Pay-at-Reception payment as collected). Confirms the linked appointment
 * once the payment is verified. On rejection, the appointment goes back to
 * "pending_payment" (not a dead-end "rejected" state) so the patient can
 * upload a new receipt and try again.
 */
export async function verifyManualPayment(
  paymentId: string,
  approve: boolean,
  verifiedBy: string,
  rejectionReason?: string
): Promise<PaymentDoc> {
  await connectDB();

  const payment = await findPaymentById(paymentId);
  if (!payment) {
    throw new PaymentServiceError("Payment not found", 404);
  }

  const updated = await updatePaymentStatus(
    paymentId,
    approve ? "verified" : "rejected",
    approve ? verifiedBy : undefined,
    approve ? undefined : rejectionReason
  );
  if (!updated) {
    throw new PaymentServiceError("Payment not found", 404);
  }

  // changeAppointmentStatus sends the "Appointment Confirmed" email itself
  // whenever status becomes "confirmed" — no separate send needed here.
  await changeAppointmentStatus(
    String(payment.appointmentId),
    approve ? "confirmed" : "pending_payment",
    verifiedBy,
    approve ? "Payment verified by admin" : (rejectionReason ?? "Payment rejected by admin — please re-upload your receipt")
  );

  return updated;
}

/**
 * Admin-only: permanently deletes a payment's uploaded receipt (Cloudinary
 * asset + the URL/publicId fields on the Payment doc). Does not change the
 * payment or appointment status — this is a standalone cleanup action.
 */
export async function deletePaymentReceipt(paymentId: string): Promise<PaymentDoc> {
  await connectDB();
  const payment = await findPaymentById(paymentId);
  if (!payment) {
    throw new PaymentServiceError("Payment not found", 404);
  }
  if (payment.receiptPublicId) {
    await deleteUploadedAsset(payment.receiptPublicId, receiptResourceType(payment.receiptUrl));
  }
  await clearPaymentReceipt(paymentId);
  const updated = await findPaymentById(paymentId);
  if (!updated) {
    throw new PaymentServiceError("Payment not found", 404);
  }
  return updated;
}

/**
 * Generic admin-set payment status — unlike verifyManualPayment, this does
 * NOT cascade to the appointment's status; the admin manages each
 * independently from the Appointment Details panel (e.g. marking a payment
 * "refunded" by hand, or resetting a payment back to "pending").
 */
export async function setPaymentStatus(paymentId: string, status: PaymentStatus, changedBy: string): Promise<PaymentDoc> {
  await connectDB();
  const updated = await updatePaymentStatus(paymentId, status, status === "verified" ? changedBy : undefined);
  if (!updated) {
    throw new PaymentServiceError("Payment not found", 404);
  }
  return updated;
}
