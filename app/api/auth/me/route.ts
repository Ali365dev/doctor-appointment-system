import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { findUserById } from "@/services/mongodb/repositories/user.repository";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await findUserById(session.userId);

  return NextResponse.json({
    user: {
      id: session.userId,
      phone: session.phone,
      role: session.role,
      name: user?.name ?? null,
      avatar: user?.avatar ?? null,
    },
  });
}
