import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { findUserById } from "@/services/mongodb/repositories/user.repository";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await findUserById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
      avatar: user.avatar ?? null,
    },
  });
}
