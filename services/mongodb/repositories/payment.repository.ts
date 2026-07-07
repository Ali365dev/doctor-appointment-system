import { connectDB } from "../connection";
import Payment, { type PaymentDoc } from "../models/Payment";
import "../models/Appointment"; // registers the "Appointment" model so populate("appointmentId") below can resolve it
import type { PaymentMethod, PaymentStatus } from "@/types/payment";

export interface CreatePaymentInput {
  appointmentId: string;
  method: PaymentMethod;
  amountPkr: number;
  status: PaymentStatus;
  stripeSessionId?: string;
  transactionRef?: string;
  receiptUrl?: string;
  receiptPublicId?: string;
  receiptUploadedAt?: Date;
}

export async function createPayment(input: CreatePaymentInput): Promise<PaymentDoc> {
  await connectDB();
  const created = await Payment.create(input);
  return created.toObject() as PaymentDoc;
}

export async function findPaymentById(paymentId: string): Promise<PaymentDoc | null> {
  await connectDB();
  return Payment.findById(paymentId).lean<PaymentDoc>();
}

export async function findPaymentByStripeSessionId(sessionId: string): Promise<PaymentDoc | null> {
  await connectDB();
  return Payment.findOne({ stripeSessionId: sessionId }).lean<PaymentDoc>();
}

export async function updatePaymentStripeSession(paymentId: string, stripeSessionId: string): Promise<void> {
  await connectDB();
  await Payment.updateOne({ _id: paymentId }, { $set: { stripeSessionId } });
}

export async function updatePaymentIntentId(paymentId: string, stripePaymentIntentId: string): Promise<void> {
  await connectDB();
  await Payment.updateOne({ _id: paymentId }, { $set: { stripePaymentIntentId } });
}

export async function findPaymentByAppointmentId(appointmentId: string): Promise<PaymentDoc | null> {
  await connectDB();
  return Payment.findOne({ appointmentId }).sort({ createdAt: -1 }).lean<PaymentDoc>();
}

export async function clearPaymentReceipt(paymentId: string): Promise<void> {
  await connectDB();
  await Payment.updateOne(
    { _id: paymentId },
    { $unset: { receiptUrl: "", receiptPublicId: "", receiptUploadedAt: "" } }
  );
}

export async function markPaymentRefunded(paymentId: string): Promise<PaymentDoc | null> {
  await connectDB();
  return Payment.findByIdAndUpdate(
    paymentId,
    { $set: { status: "refunded", refundedAt: new Date() } },
    { new: true }
  ).lean<PaymentDoc>();
}

export async function findAllPayments(filter?: { status?: PaymentStatus }): Promise<PaymentDoc[]> {
  await connectDB();
  return Payment.find(filter?.status ? { status: filter.status } : {})
    .populate("appointmentId", "appointmentNumber patientSnapshot")
    .sort({ createdAt: -1 })
    .lean<PaymentDoc[]>();
}

export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  verifiedBy?: string,
  rejectionReason?: string
): Promise<PaymentDoc | null> {
  await connectDB();
  const isVerified = status === "verified";
  return Payment.findByIdAndUpdate(
    paymentId,
    {
      $set: {
        status,
        ...(isVerified ? { verifiedBy, verifiedAt: new Date() } : {}),
        ...(status === "rejected" ? { rejectionReason } : {}),
      },
    },
    { new: true }
  ).lean<PaymentDoc>();
}
