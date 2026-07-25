import { connectDB } from "../connection";
import RateLimit from "../models/RateLimit";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

/**
 * Atomically increments a windowed counter stored in Mongo (works correctly
 * across Vercel's serverless instances, unlike an in-memory map). Opens a
 * fresh window whenever the previous one has expired.
 */
export async function checkAndIncrement(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  await connectDB();
  const now = new Date();

  const attempt = async (): Promise<RateLimitResult> => {
    const existing = await RateLimit.findOne({ key, expiresAt: { $gt: now } });

    if (!existing) {
      const expiresAt = new Date(now.getTime() + windowSeconds * 1000);
      await RateLimit.findOneAndUpdate(
        { key },
        { $set: { key, count: 1, windowStart: now, expiresAt } },
        { upsert: true }
      );
      return { allowed: true };
    }

    if (existing.count >= limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000));
      return { allowed: false, retryAfterSeconds };
    }

    await RateLimit.updateOne({ _id: existing._id }, { $inc: { count: 1 } });
    return { allowed: true };
  };

  try {
    return await attempt();
  } catch (err) {
    // Concurrent first-hit race on the upsert (E11000) — retry once against the now-existing doc.
    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
      return attempt();
    }
    throw err;
  }
}
