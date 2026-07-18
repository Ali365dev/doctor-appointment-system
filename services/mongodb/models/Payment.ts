import { Schema, model, models, Types, type InferSchemaType } from "mongoose";
import { PAYMENT_STATUSES, PAYMENT_METHODS } from "@/types/payment";

const paymentSchema = new Schema(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, index: true },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    amountPkr: { type: Number, required: true },
    status: { type: String, enum: PAYMENT_STATUSES, required: true, default: "pending" },
    transactionRef: { type: String }, // wallet/bank TXN id entered/quoted by patient
    receiptUrl: { type: String },
    receiptPublicId: { type: String }, // Cloudinary public ID, needed to delete the asset on replace
    receiptUploadedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    refundedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export type PaymentDoc = InferSchemaType<typeof paymentSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const Payment = models.Payment ?? model("Payment", paymentSchema);
export default Payment;
