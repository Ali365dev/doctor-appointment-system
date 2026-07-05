import { NextRequest, NextResponse } from "next/server";
import { findUserByPhone, touchLastLogin } from "@/services/mongodb/repositories/user.repository";
import { verifyPassword } from "@/lib/password";
import { signSession, sessionCookieOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || typeof phone !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Phone and password are required" }, { status: 400 });
    }

    const user = await findUserByPhone(phone.trim());

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid phone number or password" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "This account has been deactivated." }, { status: 403 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid phone number or password" }, { status: 401 });
    }

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
      mustChangePassword: user.mustChangePassword,
    });
    response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
