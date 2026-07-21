import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/services/firebase/admin";
import { findUserByFirebaseUid, createPatient, touchLastLogin } from "@/services/mongodb/repositories/user.repository";
import { signSession, sessionCookieOptions } from "@/lib/session";
import { generateTemporaryPassword, hashPassword } from "@/lib/password";
import { sendTemporaryPassword, sendNotification } from "@/services/notifications";
import { welcomeEmail } from "@/services/notifications/templates";

export async function POST(req: NextRequest) {
  try {
    const { idToken, name } = await req.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const firebaseUid = decoded.uid;
    const phone = decoded.phone_number ?? "";

    if (!phone) {
      return NextResponse.json({ error: "No phone number on this Firebase account" }, { status: 400 });
    }

    // Doctor accounts are seeded directly in MongoDB and never created here.
    const existingUser = await findUserByFirebaseUid(firebaseUid);

    // ── Existing user (returning patient or the doctor) — unchanged flow: log in directly. ──
    if (existingUser) {
      if (!existingUser.isActive) {
        return NextResponse.json({ error: "This account has been deactivated." }, { status: 403 });
      }

      await touchLastLogin(String(existingUser._id));

      const token = await signSession({
        userId: String(existingUser._id),
        firebaseUid: existingUser.firebaseUid,
        phone: existingUser.phone ?? "",
        role: existingUser.role as "doctor" | "patient",
      });

      const response = NextResponse.json({
        registered: false,
        isNew: false,
        user: {
          id: String(existingUser._id),
          name: existingUser.name,
          phone: existingUser.phone,
          role: existingUser.role,
        },
      });
      response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
      return response;
    }

    // ── New patient — generate + deliver a temporary password, don't log in yet. ──
    const patientName = typeof name === "string" && name.trim() ? name.trim() : "New Patient";
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);

    const created = await createPatient({
      firebaseUid,
      phone,
      name: patientName,
      passwordHash,
    });

    const notification = await sendTemporaryPassword(
      { phone: created.phone },
      { name: created.name, temporaryPassword }
    );

    // Best-effort — a missing SMTP/WhatsApp config must never block signup.
    void sendNotification({ phone: created.phone }, welcomeEmail({ patientName: created.name }));

    return NextResponse.json({
      registered: true,
      isNew: true,
      channel: notification.channel,
      message:
        notification.channel === "console"
          ? "Registration successful. Email/WhatsApp delivery isn't configured yet — check the server logs for your temporary password."
          : `Registration successful. Your temporary password was sent via ${notification.channel}.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
