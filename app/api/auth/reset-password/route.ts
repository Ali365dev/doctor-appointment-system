import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  updatePasswordAndClearMustChange,
  touchLastLogin,
} from "@/services/mongodb/repositories/user.repository";
import { findActiveOtp, incrementOtpAttempts, consumeOtp } from "@/services/mongodb/repositories/otp.repository";
import { hashPassword, isPasswordStrong } from "@/lib/password";
import { hashOtpCode, OTP_MAX_ATTEMPTS } from "@/lib/otp";
import { signSession, sessionCookieOptions } from "@/lib/session";
import { enforceRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { sendNotification } from "@/services/notifications";
import { passwordChangedEmail } from "@/services/notifications/templates";

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword, confirmPassword } = await req.json();

    if (!email || typeof email !== "string" || !code || typeof code !== "string") {
      return NextResponse.json({ error: "Email and verification code are required" }, { status: 400 });
    }
    if (!newPassword || typeof newPassword !== "string" || !isPasswordStrong(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number" },
        { status: 400 }
      );
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const rate = await enforceRateLimit(rateLimitKey("reset-password", "email", normalizedEmail), {
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
    if (!user.isActive) {
      return NextResponse.json({ error: "This account has been deactivated." }, { status: 403 });
    }

    const otp = await findActiveOtp(String(user._id), "password_reset");
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

    const passwordHash = await hashPassword(newPassword);
    await updatePasswordAndClearMustChange(String(user._id), passwordHash);
    await touchLastLogin(String(user._id));
    void sendNotification({ email: normalizedEmail }, passwordChangedEmail({ name: user.name }));

    const token = await signSession({
      userId: String(user._id),
      role: user.role as "doctor" | "patient",
      email: user.email,
    });

    const response = NextResponse.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
