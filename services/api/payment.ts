import "server-only";
import { connectDB } from "@/services/mongodb";
import {
  createPayment as createPaymentRecord,
  findPaymentById,
  findPaymentByAppointmentId,
  findAllPayments,
  updatePaymentStatus,
  updatePaymentIntentId,
  markPaymentRefunded,
  clearPaymentReceipt,
} from "@/services/mongodb/repositories/payment.repository";
import {
  getAppointmentById,
  attachPaymentToAppointment,
  changeAppointmentStatus,
} from "@/services/api/appointment";
import { deleteUploadedAsset } from "@/services/cloudinary";
import { sendNotification } from "@/services/notifications";
import type { PaymentDoc } from "@/services/mongodb/models/Payment";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";

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
  stripeSessionId?: string;
  transactionRef?: string;
  receiptUrl?: string;
  receiptPublicId?: string;
}

/**
 * Creates the Payment record for an appointment and moves the appointment
 * into the right status for its payment method:
 *  - reception: no payment needed up front -> confirmed immediately, payment stays "pending"
 *  - stripe: payment is created "pending" and only flips to confirmed via server-side
 *    verification (checkout-session retrieval or webhook), never on the client's say-so
 *  - jazzcash/easypaisa: receipt-based, goes to "submitted" -> awaits admin verification
 */
export async function createPaymentForAppointment(params: CreatePaymentParams): Promise<PaymentDoc> {
  await connectDB();

  const appointment = await getAppointmentById(params.appointmentId);

  // Re-upload after rejection: this appointment already has a previous payment
  // attempt with a receipt — delete that old Cloudinary asset so it doesn't
  // become an orphan now that a new receipt is replacing it.
  if (params.receiptPublicId) {
    const previous = await findPaymentByAppointmentId(params.appointmentId);
    if (previous?.receiptPublicId) {
      await deleteUploadedAsset(previous.receiptPublicId);
    }
  }

  const initialStatus: PaymentStatus =
    params.method === "jazzcash" || params.method === "easypaisa" ? "submitted" : "pending";

  const payment = await createPaymentRecord({
    appointmentId: params.appointmentId,
    method: params.method,
    amountPkr: appointment.feeSnapshotPkr,
    status: initialStatus,
    stripeSessionId: params.stripeSessionId,
    transactionRef: params.transactionRef,
    receiptUrl: params.receiptUrl,
    receiptPublicId: params.receiptPublicId,
    receiptUploadedAt: params.receiptUrl ? new Date() : undefined,
  });

  await attachPaymentToAppointment(params.appointmentId, String(payment._id));

  if (params.method === "reception") {
    await changeAppointmentStatus(params.appointmentId, "confirmed", "system", "Pay at reception — confirmed without upfront payment");
  } else if (params.method === "jazzcash" || params.method === "easypaisa") {
    await changeAppointmentStatus(params.appointmentId, "payment_verification", "system", "Manual receipt submitted, awaiting admin verification");
  }
  // stripe: appointment stays in "pending_payment" until verifyStripePayment() confirms it.

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
  if (payment.method === "stripe") {
    throw new PaymentServiceError("Stripe payments are verified automatically, not manually", 400);
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

  const appointment = await changeAppointmentStatus(
    String(payment.appointmentId),
    approve ? "confirmed" : "pending_payment",
    verifiedBy,
    approve ? "Payment verified by admin" : (rejectionReason ?? "Payment rejected by admin — please re-upload your receipt")
  );

  if (approve) {
    void sendNotification(
      { email: appointment.patientSnapshot.email, phone: appointment.patientSnapshot.phone },
      {
        subject: "Payment Confirmation",
        text: `Hi ${appointment.patientSnapshot.fullName}, your payment for appointment ${appointment.appointmentNumber} has been verified and confirmed.`,
      }
    );
  }

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
    await deleteUploadedAsset(payment.receiptPublicId);
  }
  await clearPaymentReceipt(paymentId);
  const updated = await findPaymentById(paymentId);
  if (!updated) {
    throw new PaymentServiceError("Payment not found", 404);
  }
  return updated;
}

/**
 * Stores the Stripe PaymentIntent ID once a Checkout Session completes, so
 * it can be shown to the patient/admin and used later for a refund.
 */
export async function attachStripePaymentIntent(paymentId: string, paymentIntentId: string): Promise<void> {
  await connectDB();
  await updatePaymentIntentId(paymentId, paymentIntentId);
}

/**
 * Admin-triggered Stripe refund. Only verified Stripe payments can be
 * refunded; the actual refund call happens in the API route (where the
 * Stripe SDK client lives) — this just persists the resulting state.
 */
export async function markPaymentAsRefunded(paymentId: string, refundedBy: string): Promise<PaymentDoc> {
  await connectDB();
  const payment = await findPaymentById(paymentId);
  if (!payment) {
    throw new PaymentServiceError("Payment not found", 404);
  }
  const updated = await markPaymentRefunded(paymentId);
  if (!updated) {
    throw new PaymentServiceError("Payment not found", 404);
  }
  await changeAppointmentStatus(String(payment.appointmentId), "cancelled", refundedBy, "Payment refunded by admin");
  return updated;
}

/**
 * Server-side Stripe confirmation. Only this function may move a Stripe
 * payment/appointment into a paid/confirmed state — the client redirect
 * URL param is never trusted on its own.
 */
export async function markStripePaymentVerified(paymentId: string): Promise<PaymentDoc> {
  await connectDB();
  const payment = await findPaymentById(paymentId);
  if (!payment) {
    throw new PaymentServiceError("Payment not found", 404);
  }
  const updated = await updatePaymentStatus(paymentId, "verified", "system");
  if (!updated) {
    throw new PaymentServiceError("Payment not found", 404);
  }
  const appointment = await changeAppointmentStatus(String(payment.appointmentId), "confirmed", "system", "Stripe payment verified");

  void sendNotification(
    { email: appointment.patientSnapshot.email, phone: appointment.patientSnapshot.phone },
    {
      subject: "Payment Confirmation",
      text: `Hi ${appointment.patientSnapshot.fullName}, your card payment for appointment ${appointment.appointmentNumber} has been confirmed.`,
    }
  );

  return updated;
}

export async function markStripePaymentFailed(paymentId: string): Promise<PaymentDoc> {
  await connectDB();
  const updated = await updatePaymentStatus(paymentId, "failed", "system");
  if (!updated) {
    throw new PaymentServiceError("Payment not found", 404);
  }
  return updated;
}

/**
 * Generic admin-set payment status — unlike verifyManualPayment/markPaymentAsRefunded,
 * this does NOT cascade to the appointment's status; the admin manages each
 * independently from the Appointment Details panel (e.g. correcting a Stripe
 * payment's status by hand, or resetting a payment back to "pending").
 */
export async function setPaymentStatus(paymentId: string, status: PaymentStatus, changedBy: string): Promise<PaymentDoc> {
  await connectDB();
  const updated = await updatePaymentStatus(paymentId, status, status === "verified" ? changedBy : undefined);
  if (!updated) {
    throw new PaymentServiceError("Payment not found", 404);
  }
  return updated;
}
