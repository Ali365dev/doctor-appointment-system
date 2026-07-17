import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { validateCmsBody } from "@/lib/validators";
import { getCmsProfile, updateCmsProfile } from "@/services/mongodb/repositories/cms.repository";

export async function GET() {
  try {
    const cms = await getCmsProfile();
    return NextResponse.json({ cms });
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
    const error = validateCmsBody(body, true);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const cms = await updateCmsProfile(body);
    return NextResponse.json({ cms });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
