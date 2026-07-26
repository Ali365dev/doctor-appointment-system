import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { validateProfileUpdateBody } from "@/lib/validators";
import { updateUserProfile } from "@/services/mongodb/repositories/user.repository";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const validationError = validateProfileUpdateBody(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const updated = await updateUserProfile(session.userId, body);
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    // Duplicate email/phone (unique indexes) surfaces as a Mongo E11000 error.
    if (err instanceof Error && "code" in err && (err as { code?: number }).code === 11000) {
      const field = err.message.includes("phone") ? "phone number" : "email";
      return NextResponse.json({ error: `That ${field} is already in use by another account` }, { status: 409 });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
