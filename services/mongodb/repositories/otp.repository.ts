import { connectDB } from "../connection";
import EmailOtp, { type EmailOtpDoc } from "../models/EmailOtp";

export type OtpPurpose = "verify_email" | "password_reset";

export interface CreateOtpInput {
  userId: string;
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: Date;
}

export async function createOtp(input: CreateOtpInput): Promise<void> {
  await connectDB();
  await EmailOtp.create({
    userId: input.userId,
    email: input.email.trim().toLowerCase(),
    purpose: input.purpose,
    codeHash: input.codeHash,
    expiresAt: input.expiresAt,
  });
}

export async function findActiveOtp(userId: string, purpose: OtpPurpose): Promise<EmailOtpDoc | null> {
  await connectDB();
  return EmailOtp.findOne({
    userId,
    purpose,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .lean<EmailOtpDoc>();
}

export async function incrementOtpAttempts(otpId: string): Promise<number> {
  await connectDB();
  const updated = await EmailOtp.findByIdAndUpdate(
    otpId,
    { $inc: { attempts: 1 } },
    { new: true }
  ).lean<EmailOtpDoc>();
  return updated?.attempts ?? 0;
}

export async function consumeOtp(otpId: string): Promise<void> {
  await connectDB();
  await EmailOtp.updateOne({ _id: otpId }, { $set: { consumedAt: new Date() } });
}

export async function invalidateActiveOtps(userId: string, purpose: OtpPurpose): Promise<void> {
  await connectDB();
  await EmailOtp.updateMany(
    { userId, purpose, consumedAt: null },
    { $set: { consumedAt: new Date() } }
  );
}
