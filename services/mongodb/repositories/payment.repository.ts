import { connectDB } from "../connection";
import Payment, { type PaymentDoc } from "../models/Payment";
import "../models/Appointment"; // registers the "Appointment" model so populate("appointmentId") below can resolve it
import type { PaymentMethod, PaymentStatus } from "@/types/payment";

export interface CreatePaymentInput {
  appointmentId: string;
  method: PaymentMethod;
  amountPkr: number;
  status: PaymentStatus;
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

export async function findAllPayments(filter?: { status?: PaymentStatus }): Promise<PaymentDoc[]> {
  await connectDB();
  return Payment.find(filter?.status ? { status: filter.status } : {})
    .populate("appointmentId", "appointmentNumber patientSnapshot")
    .sort({ createdAt: -1 })
    .lean<PaymentDoc[]>();
}

/** Deletes payments belonging to the given appointment ids. Returns the number actually deleted. */
export async function deletePaymentsByAppointmentIds(appointmentIds: string[]): Promise<number> {
  if (appointmentIds.length === 0) return 0;
  await connectDB();
  const result = await Payment.deleteMany({ appointmentId: { $in: appointmentIds } });
  return result.deletedCount ?? 0;
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
