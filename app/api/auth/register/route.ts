import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  findUserByPhone,
  createEmailPatient,
} from "@/services/mongodb/repositories/user.repository";
import { invalidateActiveOtps, createOtp } from "@/services/mongodb/repositories/otp.repository";
import { hashPassword, isPasswordStrong } from "@/lib/password";
import { generateOtpCode, hashOtpCode, otpExpiryDate } from "@/lib/otp";
import { enforceRateLimit, rateLimitKey, getRequestIp } from "@/lib/rateLimit";
import { sendNotification } from "@/services/notifications";
import { emailVerificationOtpEmail } from "@/services/notifications/templates";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

async function issueVerificationOtp(userId: string, email: string, name: string) {
  await invalidateActiveOtps(userId, "verify_email");
  const code = generateOtpCode();
  await createOtp({ userId, email, purpose: "verify_email", codeHash: hashOtpCode(code), expiresAt: otpExpiryDate() });
  void sendNotification({ email }, emailVerificationOtpEmail({ name, code }));
}

export async function POST(req: NextRequest) {
  try {
    const rate = await enforceRateLimit(rateLimitKey("register", "ip", getRequestIp(req)), {
      limit: 10,
      windowSeconds: 60 * 60,
    });
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const { name, email, phone, password, confirmPassword } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }
    if (!phone || typeof phone !== "string" || !PHONE_REGEX.test(phone.trim())) {
      return NextResponse.json({ error: "A valid phone number is required" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || !isPasswordStrong(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number" },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    const existingByEmail = await findUserByEmail(normalizedEmail);
    if (existingByEmail) {
      if (existingByEmail.emailVerified) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
      }
      // Unverified existing registration — resume instead of dead-ending the user.
      await issueVerificationOtp(String(existingByEmail._id), normalizedEmail, existingByEmail.name);
      return NextResponse.json({ email: normalizedEmail });
    }

    const existingByPhone = await findUserByPhone(trimmedPhone);
    if (existingByPhone) {
      return NextResponse.json({ error: "An account with this phone number already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const created = await createEmailPatient({
      email: normalizedEmail,
      phone: trimmedPhone,
      name: trimmedName,
      passwordHash,
    });

    await issueVerificationOtp(String(created._id), normalizedEmail, trimmedName);

    return NextResponse.json({ email: normalizedEmail });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
