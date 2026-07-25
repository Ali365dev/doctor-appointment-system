import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { getDigestSettings, updateDigestSettings } from "@/services/mongodb/repositories/digestSettings.repository";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const settings = await getDigestSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const patch: { enabled?: boolean; sendTime?: string; email?: string | null } = {};

    if (body.enabled !== undefined) {
      if (typeof body.enabled !== "boolean") {
        return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
      }
      patch.enabled = body.enabled;
    }

    if (body.sendTime !== undefined) {
      if (typeof body.sendTime !== "string" || !TIME_REGEX.test(body.sendTime)) {
        return NextResponse.json({ error: "sendTime must be in HH:MM (24-hour) format" }, { status: 400 });
      }
      patch.sendTime = body.sendTime;
    }

    if (body.email !== undefined) {
      if (body.email === null || body.email === "") {
        patch.email = null;
      } else if (typeof body.email !== "string" || !EMAIL_REGEX.test(body.email.trim())) {
        return NextResponse.json({ error: "email must be a valid email address" }, { status: 400 });
      } else {
        patch.email = body.email.trim().toLowerCase();
      }
    }

    const settings = await updateDigestSettings(patch);
    return NextResponse.json({ settings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
