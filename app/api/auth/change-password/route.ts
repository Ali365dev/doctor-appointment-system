import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { findUserById, updatePasswordAndClearMustChange } from "@/services/mongodb/repositories/user.repository";
import { hashPassword, verifyPassword } from "@/lib/password";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // First-time forced change (mustChangePassword) skips this check — the
    // temporary password was already verified by /api/auth/login moments ago.
    if (!user.mustChangePassword) {
      if (!currentPassword || typeof currentPassword !== "string") {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }
      const valid = user.passwordHash && (await verifyPassword(currentPassword, user.passwordHash));
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
      }
    }

    const passwordHash = await hashPassword(newPassword);
    await updatePasswordAndClearMustChange(session.userId, passwordHash);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
