import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const paymentSettingsSchema = new Schema(
  {
    jazzcashNumber: { type: String, default: "" },
    jazzcashAccountTitle: { type: String, default: "" },
    jazzcashQrUrl: { type: String },
    jazzcashQrPublicId: { type: String },
    easypaisaNumber: { type: String, default: "" },
    easypaisaAccountTitle: { type: String, default: "" },
    easypaisaQrUrl: { type: String },
    easypaisaQrPublicId: { type: String },
    bankName: { type: String, default: "" },
    bankAccountNumber: { type: String, default: "" },
    bankAccountTitle: { type: String, default: "" },
    bankQrUrl: { type: String },
    bankQrPublicId: { type: String },
  },
  { timestamps: true }
);

export type PaymentSettingsDoc = InferSchemaType<typeof paymentSettingsSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const PaymentSettings = models.PaymentSettings ?? model("PaymentSettings", paymentSettingsSchema);
export default PaymentSettings;
