import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, touchLastLogin } from "@/services/mongodb/repositories/user.repository";
import { verifyPassword } from "@/lib/password";
import { signSession, sessionCookieOptions } from "@/lib/session";
import { enforceRateLimit, rateLimitKey, getRequestIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRate = await enforceRateLimit(rateLimitKey("login", "email", normalizedEmail), {
      limit: 8,
      windowSeconds: 15 * 60,
    });
    const ipRate = await enforceRateLimit(rateLimitKey("login", "ip", getRequestIp(req)), {
      limit: 30,
      windowSeconds: 15 * 60,
    });
    if (!emailRate.ok || !ipRate.ok) {
      const retryAfterSeconds = Math.max(emailRate.ok ? 0 : emailRate.retryAfterSeconds, ipRate.ok ? 0 : ipRate.retryAfterSeconds);
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

    const user = await findUserByEmail(normalizedEmail);

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "This account has been deactivated." }, { status: 403 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "EMAIL_NOT_VERIFIED", message: "Please verify your email before signing in." },
        { status: 403 }
      );
    }

    await touchLastLogin(String(user._id));

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
