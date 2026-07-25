import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/services/mongodb/repositories/user.repository";
import { invalidateActiveOtps, createOtp } from "@/services/mongodb/repositories/otp.repository";
import { generateOtpCode, hashOtpCode, otpExpiryDate, OTP_RESEND_COOLDOWN_SECONDS } from "@/lib/otp";
import { enforceRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { sendNotification } from "@/services/notifications";
import { emailVerificationOtpEmail, passwordResetOtpEmail } from "@/services/notifications/templates";

type Purpose = "verify_email" | "password_reset";

export async function POST(req: NextRequest) {
  try {
    const { email, purpose } = await req.json();

    if (!email || typeof email !== "string" || (purpose !== "verify_email" && purpose !== "password_reset")) {
      return NextResponse.json({ error: "Email and a valid purpose are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const typedPurpose = purpose as Purpose;

    // 60s cooldown per email+purpose, plus a coarser daily cap against abuse.
    const cooldown = await enforceRateLimit(rateLimitKey("resend-otp", "cooldown", typedPurpose, normalizedEmail), {
      limit: 1,
      windowSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    });
    if (!cooldown.ok) {
      return NextResponse.json(
        { error: `Please wait before requesting another code.` },
        { status: 429, headers: { "Retry-After": String(cooldown.retryAfterSeconds) } }
      );
    }
    const dailyCap = await enforceRateLimit(rateLimitKey("resend-otp", "daily", typedPurpose, normalizedEmail), {
      limit: 10,
      windowSeconds: 24 * 60 * 60,
    });
    if (!dailyCap.ok) {
      return NextResponse.json(
        { error: "Too many code requests today. Please try again tomorrow." },
        { status: 429, headers: { "Retry-After": String(dailyCap.retryAfterSeconds) } }
      );
    }

    // Always respond 200 regardless of account existence/eligibility — avoid leaking which emails are registered.
    const user = await findUserByEmail(normalizedEmail);
    const eligible =
      user &&
      user.isActive &&
      (typedPurpose === "verify_email" ? !user.emailVerified : true);

    if (eligible) {
      await invalidateActiveOtps(String(user._id), typedPurpose);
      const code = generateOtpCode();
      await createOtp({
        userId: String(user._id),
        email: normalizedEmail,
        purpose: typedPurpose,
        codeHash: hashOtpCode(code),
        expiresAt: otpExpiryDate(),
      });
      const message =
        typedPurpose === "verify_email"
          ? emailVerificationOtpEmail({ name: user.name, code })
          : passwordResetOtpEmail({ name: user.name, code });
      void sendNotification({ email: normalizedEmail }, message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
