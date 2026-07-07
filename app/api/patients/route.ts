import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { getPatientsWithStats } from "@/services/api/patient";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patients = await getPatientsWithStats();
    return NextResponse.json({ patients });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
