import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/services/firebase/admin";
import { findUserByFirebaseUid, updatePasswordAndClearMustChange, touchLastLogin } from "@/services/mongodb/repositories/user.repository";
import { hashPassword } from "@/lib/password";
import { signSession, sessionCookieOptions } from "@/lib/session";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: NextRequest) {
  try {
    const { idToken, newPassword } = await req.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const user = await findUserByFirebaseUid(decoded.uid);

    if (!user) {
      return NextResponse.json({ error: "No account found for this phone number" }, { status: 404 });
    }
    if (!user.isActive) {
      return NextResponse.json({ error: "This account has been deactivated." }, { status: 403 });
    }

    const passwordHash = await hashPassword(newPassword);
    await updatePasswordAndClearMustChange(String(user._id), passwordHash);
    await touchLastLogin(String(user._id));

    const token = await signSession({
      userId: String(user._id),
      firebaseUid: user.firebaseUid,
      phone: user.phone ?? "",
      role: user.role as "doctor" | "patient",
    });

    const response = NextResponse.json({
      user: {
        id: String(user._id),
        name: user.name,
        phone: user.phone,
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
