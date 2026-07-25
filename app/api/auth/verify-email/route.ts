import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, markEmailVerified } from "@/services/mongodb/repositories/user.repository";
import { findActiveOtp, incrementOtpAttempts, consumeOtp } from "@/services/mongodb/repositories/otp.repository";
import { hashOtpCode, OTP_MAX_ATTEMPTS } from "@/lib/otp";
import { enforceRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { sendNotification } from "@/services/notifications";
import { welcomeEmail } from "@/services/notifications/templates";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || typeof email !== "string" || !code || typeof code !== "string") {
      return NextResponse.json({ error: "Email and verification code are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const rate = await enforceRateLimit(rateLimitKey("verify-email", "email", normalizedEmail), {
      limit: 10,
      windowSeconds: 15 * 60,
    });
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json({ error: "No account found for this email" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    const otp = await findActiveOtp(String(user._id), "verify_email");
    if (!otp) {
      return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
    }

    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many incorrect attempts. Please request a new code." }, { status: 400 });
    }

    if (hashOtpCode(code.trim()) !== otp.codeHash) {
      await incrementOtpAttempts(String(otp._id));
      return NextResponse.json({ error: "Incorrect verification code" }, { status: 400 });
    }

    await consumeOtp(String(otp._id));
    await markEmailVerified(String(user._id));
    void sendNotification({ email: normalizedEmail }, welcomeEmail({ patientName: user.name }));

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
