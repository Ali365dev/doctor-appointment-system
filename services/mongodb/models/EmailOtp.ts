import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const emailOtpSchema = new Schema(
  {
    purpose: { type: String, enum: ["verify_email", "password_reset"], required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true, lowercase: true, index: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, required: true, default: 0 },
    consumedAt: { type: Date },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
emailOtpSchema.index({ userId: 1, purpose: 1, createdAt: -1 });

export type EmailOtpDoc = InferSchemaType<typeof emailOtpSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const EmailOtp = models.EmailOtp ?? model("EmailOtp", emailOtpSchema);

export default EmailOtp;
