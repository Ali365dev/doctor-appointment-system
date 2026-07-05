import { NextRequest, NextResponse } from "next/server";
import { findUserByPhone } from "@/services/mongodb/repositories/user.repository";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const user = await findUserByPhone(phone.trim());

    // Lets the client decide whether to bother sending an OTP at all,
    // avoiding a wasted SMS for a number with no account.
    return NextResponse.json({ exists: Boolean(user && user.isActive) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
