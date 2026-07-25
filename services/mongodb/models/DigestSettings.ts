import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const digestSettingsSchema = new Schema(
  {
    enabled: { type: Boolean, required: true, default: true },
    // 24-hour "HH:MM" in Asia/Karachi — when the daily digest should send.
    sendTime: { type: String, required: true, default: "08:00" },
    // Recipient override — falls back to ADMIN_DIGEST_EMAIL env var when null.
    email: { type: String, default: null },
    // "YYYY-MM-DD" (Asia/Karachi) of the last successful send — guards against
    // sending more than once per day when the cron-check endpoint is pinged
    // every few minutes.
    lastSentDate: { type: String, default: null },
  },
  { timestamps: true }
);

export type DigestSettingsDoc = InferSchemaType<typeof digestSettingsSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const DigestSettings = models.DigestSettings ?? model("DigestSettings", digestSettingsSchema);
export default DigestSettings;
