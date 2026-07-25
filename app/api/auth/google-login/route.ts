export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/services/firebase/admin";
import {
  findUserByFirebaseUid,
  findUserByEmail,
  createGoogleUser,
  linkGoogleToUser,
  markEmailVerified,
  markTemporaryPasswordSent,
  touchLastLogin,
} from "@/services/mongodb/repositories/user.repository";
import { signSession, sessionCookieOptions } from "@/lib/session";
import { generateTemporaryPassword, hashPassword } from "@/lib/password";
import { sendNotification } from "@/services/notifications";
import { welcomeEmail, googleAccountPasswordEmail } from "@/services/notifications/templates";
import { enforceRateLimit, rateLimitKey, getRequestIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const rate = await enforceRateLimit(rateLimitKey("google-login", "ip", getRequestIp(req)), {
      limit: 30,
      windowSeconds: 15 * 60,
    });
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const { idToken } = await req.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const firebaseUid = decoded.uid;
    const email = decoded.email;

    if (!email) {
      return NextResponse.json({ error: "No email on this Google account" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    // Google Login can only ever resolve to a patient — doctor accounts are
    // seeded directly in MongoDB and are never created or matched here.
    let user = await findUserByFirebaseUid(firebaseUid);
    let isNew = false;

    if (!user) {
      // Account linking: one account per email — if an email/password account
      // already exists with this (Google-confirmed) email, link Google to it
      // instead of creating a duplicate (email is a unique index).
      const existingByEmail = await findUserByEmail(normalizedEmail);

      if (existingByEmail) {
        user = await linkGoogleToUser(String(existingByEmail._id), firebaseUid);
        if (user && !user.emailVerified) {
          await markEmailVerified(String(user._id));
          user.emailVerified = true;
        }
      } else {
        const generatedPassword = generateTemporaryPassword();
        const passwordHash = await hashPassword(generatedPassword);
        user = await createGoogleUser({
          firebaseUid,
          email: normalizedEmail,
          name: decoded.name ?? "Google User",
          avatar: decoded.picture,
          passwordHash,
        });
        isNew = true;

        // Best-effort — a missing SMTP config must never block signup. Only
        // flip temporaryPasswordSent once the send actually succeeds, so this
        // email is never sent more than once.
        void (async () => {
          const result = await sendNotification(
            { email: user!.email },
            googleAccountPasswordEmail({ name: user!.name, generatedPassword })
          );
          if (result.sent) {
            await markTemporaryPasswordSent(String(user!._id));
          }
        })();
        void sendNotification({ email: user.email }, welcomeEmail({ patientName: user.name }));
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Could not resolve account" }, { status: 500 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "This account has been deactivated." }, { status: 403 });
    }

    await touchLastLogin(String(user._id));

    const token = await signSession({
      userId: String(user._id),
      role: "patient",
      email: user.email,
    });

    const response = NextResponse.json({
      isNew,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: "patient",
      },
    });
    response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
