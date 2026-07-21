export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/services/firebase/admin";
import { findUserByFirebaseUid, createGooglePatient, touchLastLogin } from "@/services/mongodb/repositories/user.repository";
import { signSession, sessionCookieOptions } from "@/lib/session";
import { sendNotification } from "@/services/notifications";
import { welcomeEmail } from "@/services/notifications/templates";

export async function POST(req: NextRequest) {
  try {
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

    // Google Login can only ever resolve to a patient — doctor accounts are
    // seeded directly in MongoDB and are never created or matched here.
    let user = await findUserByFirebaseUid(firebaseUid);
    let isNew = false;

    if (!user) {
      user = await createGooglePatient({
        firebaseUid,
        email,
        name: decoded.name ?? "Google User",
        avatar: decoded.picture,
      });
      isNew = true;
      // Best-effort — a missing SMTP config must never block signup.
      void sendNotification({ email: user.email }, welcomeEmail({ patientName: user.name }));
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "This account has been deactivated." }, { status: 403 });
    }

    await touchLastLogin(String(user._id));

    const token = await signSession({
      userId: String(user._id),
      firebaseUid: user.firebaseUid,
      phone: user.phone ?? "",
      role: "patient",
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
