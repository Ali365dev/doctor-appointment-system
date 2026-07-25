import { cache } from "react";
import { connectDB } from "../connection";
import DigestSettings, { type DigestSettingsDoc } from "../models/DigestSettings";

export interface DigestSettingsData {
  enabled: boolean;
  sendTime: string;
  email: string | null;
  lastSentDate: string | null;
}

function serialize(doc: DigestSettingsDoc): DigestSettingsData {
  return {
    enabled: doc.enabled,
    sendTime: doc.sendTime,
    email: doc.email ?? null,
    lastSentDate: doc.lastSentDate ?? null,
  };
}

async function loadDigestSettings(): Promise<DigestSettingsDoc> {
  await connectDB();
  // Sorted deterministically (oldest first) in case a race on first load ever
  // created more than one singleton doc — same guard used by cms.repository.ts.
  const existing = await DigestSettings.findOne({}).sort({ createdAt: 1 });
  if (existing) return existing.toObject() as DigestSettingsDoc;
  const created = await DigestSettings.create({});
  return created.toObject() as DigestSettingsDoc;
}

export const getDigestSettings = cache(async (): Promise<DigestSettingsData> => {
  const doc = await loadDigestSettings();
  return serialize(doc);
});

export async function updateDigestSettings(patch: {
  enabled?: boolean;
  sendTime?: string;
  email?: string | null;
}): Promise<DigestSettingsData> {
  await connectDB();
  const updated = await DigestSettings.findOneAndUpdate({}, patch, {
    new: true,
    upsert: true,
    sort: { createdAt: 1 },
  });
  return serialize(updated.toObject() as DigestSettingsDoc);
}

export async function markDigestSent(date: string): Promise<void> {
  await connectDB();
  await DigestSettings.findOneAndUpdate({}, { lastSentDate: date }, { upsert: true, sort: { createdAt: 1 } });
}
