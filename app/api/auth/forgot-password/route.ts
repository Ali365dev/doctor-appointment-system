import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/services/mongodb/repositories/user.repository";
import { invalidateActiveOtps, createOtp } from "@/services/mongodb/repositories/otp.repository";
import { generateOtpCode, hashOtpCode, otpExpiryDate } from "@/lib/otp";
import { enforceRateLimit, rateLimitKey, getRequestIp } from "@/lib/rateLimit";
import { sendNotification } from "@/services/notifications";
import { passwordResetOtpEmail } from "@/services/notifications/templates";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const rate = await enforceRateLimit(rateLimitKey("forgot-password", "ip", getRequestIp(req)), {
      limit: 10,
      windowSeconds: 15 * 60,
    });
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    // Always return the same response — never leak whether an email is registered.
    const user = await findUserByEmail(normalizedEmail);
    if (user && user.isActive) {
      await invalidateActiveOtps(String(user._id), "password_reset");
      const code = generateOtpCode();
      await createOtp({
        userId: String(user._id),
        email: normalizedEmail,
        purpose: "password_reset",
        codeHash: hashOtpCode(code),
        expiresAt: otpExpiryDate(),
      });
      void sendNotification({ email: normalizedEmail }, passwordResetOtpEmail({ name: user.name, code }));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
