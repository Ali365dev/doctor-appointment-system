import { cache } from "react";
import { connectDB } from "../connection";
import PaymentSettings from "../models/PaymentSettings";
import { doctor } from "@/lib/data";

export interface PaymentSettingsInput {
  jazzcashNumber?: string;
  jazzcashAccountTitle?: string;
  jazzcashQrUrl?: string;
  jazzcashQrPublicId?: string;
  easypaisaNumber?: string;
  easypaisaAccountTitle?: string;
  easypaisaQrUrl?: string;
  easypaisaQrPublicId?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountTitle?: string;
  bankQrUrl?: string;
  bankQrPublicId?: string;
}

export interface PaymentSettingsData {
  jazzcashNumber: string;
  jazzcashAccountTitle: string;
  jazzcashQrUrl?: string;
  jazzcashQrPublicId?: string;
  easypaisaNumber: string;
  easypaisaAccountTitle: string;
  easypaisaQrUrl?: string;
  easypaisaQrPublicId?: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountTitle: string;
  bankQrUrl?: string;
  bankQrPublicId?: string;
  updatedAt: string;
}

/** Seed values match the numbers the booking flow shipped with before this became admin-editable. */
const DEFAULT_SETTINGS: PaymentSettingsInput = {
  jazzcashNumber: "03001234567",
  jazzcashAccountTitle: doctor.name,
  easypaisaNumber: "03457654321",
  easypaisaAccountTitle: doctor.name,
  bankName: "UBL",
  bankAccountNumber: "0581231834748",
  bankAccountTitle: doctor.name,
};

function serialize(doc: unknown): PaymentSettingsData {
  return JSON.parse(JSON.stringify(doc)) as PaymentSettingsData;
}

async function loadPaymentSettings(): Promise<PaymentSettingsData> {
  await connectDB();
  const existing = await PaymentSettings.findOne({}).lean();
  if (existing) {
    return serialize(existing);
  }
  const created = await PaymentSettings.create(DEFAULT_SETTINGS);
  return serialize(created.toObject());
}

/** Returns the single payment-settings document, auto-seeding it on first read. */
export const getPaymentSettings = cache(loadPaymentSettings);

export async function updatePaymentSettings(patch: PaymentSettingsInput): Promise<PaymentSettingsData> {
  await connectDB();
  const updated = await PaymentSettings.findOneAndUpdate({}, patch, { new: true, upsert: true }).lean();
  return serialize(updated);
}
