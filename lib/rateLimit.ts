import "server-only";
import { checkAndIncrement } from "@/services/mongodb/repositories/rateLimit.repository";

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
}

export function rateLimitKey(...parts: string[]): string {
  return parts.join(":");
}

export async function enforceRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const result = await checkAndIncrement(key, config.limit, config.windowSeconds);
  if (!result.allowed) {
    return { ok: false, retryAfterSeconds: result.retryAfterSeconds ?? config.windowSeconds };
  }
  return { ok: true };
}

export function getRequestIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
